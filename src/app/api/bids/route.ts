import { NextRequest, NextResponse } from "next/server"
import { auth, getOrCreateDbUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createBidSchema } from "@/lib/validators/bid"
import { checkRateLimit } from "@/lib/ratelimit"
import { triggerBidEvent } from "@/lib/pusher"
import { createNowPaymentsInvoice } from "@/lib/nowpayments"
import { PaymentType, PaymentStatus, SiteStatus } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createBidSchema.safeParse(body)

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Datos de puja inválidos"
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const { siteId, amount, userHandle, userEmail } = parsed.data
    const session = await auth()

    let dbUser: any = null
    if (session?.user) {
      dbUser = await getOrCreateDbUser(session.user)
    } else {
      // Modo Directo sin login (estilo Outbid)
      const inputHandle = userHandle ? String(userHandle).trim().replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20) : ""
      const inputEmail = userEmail ? String(userEmail).trim().toLowerCase() : ""
      const guestSeed = Math.floor(Math.random() * 9000 + 1000)
      const handle = inputHandle || `pujador_${guestSeed}`
      const email = inputEmail || `${handle}@guest.puja.lol`

      dbUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { handle }],
        },
      })

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email,
            name: handle,
            handle,
            role: "USER",
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}`,
          },
        })
      }
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: "No se pudo registrar el usuario para la puja" },
        { status: 400 }
      )
    }

    const userId = dbUser.id

    // 1. Obtener configuración de subasta
    const auctionConfig = await prisma.auctionConfig.findFirst()
    const minIncrement = auctionConfig ? Number(auctionConfig.minIncrement) : 5
    const maxBidsPerHour = auctionConfig ? auctionConfig.maxBidsPerHour : 10

    // 2. Rate Limiting por usuario
    const rateCheck = await checkRateLimit(
      `user_bid:${userId}`,
      maxBidsPerHour,
      3600
    )

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `Has superado el límite de ${maxBidsPerHour} pujas por hora. Intenta más tarde.` },
        { status: 429 }
      )
    }

    // 3. Buscar el sitio
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        bids: {
          where: { isWinning: true },
          take: 1,
        },
      },
    })

    if (!site || site.status !== SiteStatus.ACTIVE) {
      return NextResponse.json(
        { error: "El proyecto no existe o no está activo" },
        { status: 404 }
      )
    }

    // 4. Validar puja mínima
    const currentWinningAmount = site.bids[0] ? Number(site.bids[0].amount) : 0
    const minRequired = currentWinningAmount > 0 ? currentWinningAmount + minIncrement : minIncrement

    if (amount < minRequired) {
      return NextResponse.json(
        { error: `La puja debe ser de al menos $${minRequired} USD ($${currentWinningAmount} actual + $${minIncrement} incremento)` },
        { status: 400 }
      )
    }

    const paymentMethod = body.paymentMethod || "NOWPAYMENTS"
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3001"

    // SI EL PAGO ES CON NOWPAYMENTS (CRIPTOMONEDAS)
    if (paymentMethod === "NOWPAYMENTS") {
      const payment = await prisma.payment.create({
        data: {
          userId: userId,
          amount: amount,
          type: PaymentType.BID,
          status: PaymentStatus.PENDING,
          paymentMethod: "NOWPAYMENTS",
          siteId: site.id,
        },
      })

      const invoice = await createNowPaymentsInvoice({
        amount: amount,
        orderId: payment.id,
        orderDescription: `Puja por ${site.name} ($${amount} USD) - puja.lol`,
        successUrl: `${appUrl}/site/${site.slug}?payment=success&orderId=${payment.id}`,
        cancelUrl: `${appUrl}/site/${site.slug}?payment=cancelled`,
      })

      return NextResponse.json({
        success: true,
        isNowPayments: true,
        paymentId: payment.id,
        invoiceUrl: invoice.invoiceUrl,
        invoiceId: invoice.invoiceId,
      })
    }

    // SI EL PAGO ES MODO SIMULADO / PRUEBA DIRECTA (MANUAL_TEST)
    const now = new Date()

    const transactionResult = await prisma.$transaction(async (tx) => {
      // Registrar pago
      const payment = await tx.payment.create({
        data: {
          userId: userId,
          amount: amount,
          type: PaymentType.BID,
          status: PaymentStatus.COMPLETED,
          paymentMethod: "MANUAL_TEST",
          siteId: site.id,
        },
      })

      // Desmarcar puja ganadora previa
      await tx.bid.updateMany({
        where: {
          siteId: site.id,
          isWinning: true,
        },
        data: {
          isWinning: false,
        },
      })

      // Crear nueva puja ganadora
      const newBid = await tx.bid.create({
        data: {
          siteId: site.id,
          userId: userId,
          amount: amount,
          isWinning: true,
          auctionDate: now,
        },
      })

      // Actualizar Payment con el bidId
      await tx.payment.update({
        where: { id: payment.id },
        data: { bidId: newBid.id },
      })

      return { payment, newBid }
    })

    // Calcular nueva posición en el ranking
    const allSites = await prisma.site.findMany({
      where: { status: SiteStatus.ACTIVE },
      include: {
        bids: {
          where: { isWinning: true },
          take: 1,
        },
      },
    })

    const sorted = allSites.map((s) => {
      const topBid = s.bids[0] ? Number(s.bids[0].amount) : 0
      return { id: s.id, amount: topBid }
    })

    sorted.sort((a, b) => b.amount - a.amount)
    const newRank = sorted.findIndex((s) => s.id === site.id) + 1

    // Emitir evento en tiempo real a Pusher
    await triggerBidEvent({
      siteId: site.id,
      siteName: site.name,
      siteSlug: site.slug,
      amount: amount,
      newRank: newRank || 1,
      userHandle: dbUser.handle || dbUser.name?.split(" ")[0] || "usuario",
      userName: dbUser.name || "Usuario",
      userAvatar: dbUser.image || null,
      timestamp: now.toISOString(),
    })

    return NextResponse.json({
      success: true,
      bid: transactionResult.newBid,
      newRank,
    })
  } catch (error: any) {
    console.error("Error en POST /api/bids:", error)
    return NextResponse.json(
      { error: "Error al procesar la puja" },
      { status: 500 }
    )
  }
}
