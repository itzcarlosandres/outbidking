import { NextRequest, NextResponse } from "next/server"
import { auth, getOrCreateDbUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createSiteSchema } from "@/lib/validators/site"
import { triggerBidEvent } from "@/lib/pusher"
import { createNowPaymentsInvoice } from "@/lib/nowpayments"
import { SiteStatus, PaymentType, PaymentStatus } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createSiteSchema.safeParse(body)

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Datos inválidos"
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const { name, url, description, category, ownerHandle, ownerEmail } = parsed.data
    const initialBid = parsed.data.initialBid || 5
    const session = await auth()

    let dbUser: any = null
    if (session?.user) {
      dbUser = await getOrCreateDbUser(session.user)
    } else {
      // Modo Directo sin login previo (estilo Outbid)
      const inputHandle = ownerHandle ? String(ownerHandle).trim().replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20) : ""
      const inputEmail = ownerEmail ? String(ownerEmail).trim().toLowerCase() : ""
      const guestSeed = Math.floor(Math.random() * 9000 + 1000)
      const handle = inputHandle || `creador_${guestSeed}`
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
        { error: "No se pudo registrar el usuario propietario del proyecto" },
        { status: 400 }
      )
    }

    const userId = dbUser.id

    // Generar slug único
    let baseSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")

    if (!baseSlug) baseSlug = "proyecto"

    let slug = baseSlug
    let counter = 1
    while (await prisma.site.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const paymentMethod = body.paymentMethod || "NOWPAYMENTS"
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3001"

    // Permanencia inicial amplia (365 días) mientras compite por puestos
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

    // SI EL PAGO ES CON NOWPAYMENTS (CRIPTOMONEDAS)
    if (paymentMethod === "NOWPAYMENTS") {
      const result = await prisma.$transaction(async (tx) => {
        const site = await tx.site.create({
          data: {
            name,
            slug,
            url,
            description,
            category,
            status: SiteStatus.ACTIVE,
            expiresAt,
            ownerId: userId,
          },
        })

        const bid = await tx.bid.create({
          data: {
            siteId: site.id,
            userId: userId,
            amount: initialBid,
            isWinning: false, // Se activará a true cuando el webhook confirme el pago
            auctionDate: now,
          },
        })

        const payment = await tx.payment.create({
          data: {
            userId: userId,
            amount: initialBid,
            type: PaymentType.BID,
            status: PaymentStatus.PENDING,
            paymentMethod: "NOWPAYMENTS",
            siteId: site.id,
            bidId: bid.id,
          },
        })

        return { site, bid, payment }
      })

      const invoice = await createNowPaymentsInvoice({
        amount: initialBid,
        orderId: result.payment.id,
        orderDescription: `Publicación de ${name} ($${initialBid} USD) - puja.lol`,
        successUrl: `${appUrl}/site/${result.site.slug}?payment=success&orderId=${result.payment.id}`,
        cancelUrl: `${appUrl}/dashboard?payment=cancelled`,
      })

      return NextResponse.json({
        success: true,
        isNowPayments: true,
        paymentId: result.payment.id,
        invoiceUrl: invoice.invoiceUrl,
        invoiceId: invoice.invoiceId,
        siteSlug: result.site.slug,
      })
    }

    // SI EL PAGO ES MODO SIMULADO / PRUEBA DIRECTA (MANUAL_TEST)
    const result = await prisma.$transaction(async (tx) => {
      const site = await tx.site.create({
        data: {
          name,
          slug,
          url,
          description,
          category,
          status: SiteStatus.ACTIVE,
          expiresAt,
          ownerId: userId,
        },
      })

      const bid = await tx.bid.create({
        data: {
          siteId: site.id,
          userId: userId,
          amount: initialBid,
          isWinning: true,
          auctionDate: now,
        },
      })

      const payment = await tx.payment.create({
        data: {
          userId: userId,
          amount: initialBid,
          type: PaymentType.BID,
          status: PaymentStatus.COMPLETED,
          paymentMethod: "MANUAL_TEST",
          siteId: site.id,
          bidId: bid.id,
        },
      })

      return { site, bid, payment }
    })

    // Calcular posición en el ranking
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
    const newRank = sorted.findIndex((s) => s.id === result.site.id) + 1

    // Emitir evento en tiempo real a Pusher
    await triggerBidEvent({
      siteId: result.site.id,
      siteName: result.site.name,
      siteSlug: result.site.slug,
      amount: initialBid,
      newRank: newRank || 1,
      userHandle: dbUser.handle || dbUser.name?.split(" ")[0] || "usuario",
      userName: dbUser.name || "Usuario",
      userAvatar: dbUser.image || null,
      timestamp: now.toISOString(),
    })

    return NextResponse.json({
      success: true,
      site: result.site,
      slug: result.site.slug,
      initialBid,
      rank: newRank,
    })
  } catch (error: any) {
    console.error("Error en POST /api/sites:", error)
    return NextResponse.json(
      { error: "Error interno al procesar la publicación" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const dbUser = await getOrCreateDbUser(session.user)
    const userId = dbUser?.id || session.user.id

    const sites = await prisma.site.findMany({
      where: { ownerId: userId },
      include: {
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ sites })
  } catch (error) {
    console.error("Error en GET /api/sites:", error)
    return NextResponse.json(
      { error: "Error al obtener proyectos" },
      { status: 500 }
    )
  }
}
