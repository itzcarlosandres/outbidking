import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyNowPaymentsSignature } from "@/lib/nowpayments"
import { triggerBidEvent } from "@/lib/pusher"
import { PaymentStatus, SiteStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json()
    const signature = request.headers.get("x-nowpayments-sig")

    console.log("📥 [NOWPayments IPN] Recibida notificación de pago:", {
      payment_id: rawBody.payment_id,
      order_id: rawBody.order_id,
      status: rawBody.payment_status,
      price_amount: rawBody.price_amount,
    })

    // 1. Validar la firma HMAC de seguridad
    const isValid = await verifyNowPaymentsSignature(rawBody, signature)
    if (!isValid) {
      console.error("❌ [NOWPayments IPN] Firma inválida rechazada.")
      return NextResponse.json({ error: "Firma inválida" }, { status: 400 })
    }

    const { order_id, payment_status, price_amount } = rawBody

    if (!order_id) {
      return NextResponse.json({ error: "order_id faltante" }, { status: 400 })
    }

    // 2. Buscar el registro de Payment en la base de datos
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ id: order_id }, { referenceId: order_id }],
      },
      include: {
        user: true,
      },
    })

    if (!payment) {
      console.warn(`⚠️ [NOWPayments IPN] No se encontró pago con referenceId: ${order_id}`)
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })
    }

    // 3. Procesar según estado de NOWPayments
    // Estados válidos de confirmación: 'finished' o 'confirmed'
    const isCompleted = payment_status === "finished" || payment_status === "confirmed"
    const isFailed = payment_status === "failed" || payment_status === "expired" || payment_status === "refunded"

    if (isFailed) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      })
      return NextResponse.json({ status: "updated_to_failed" })
    }

    if (!isCompleted) {
      // Estado aún en proceso (waiting, confirming, sending...)
      return NextResponse.json({ status: `received_${payment_status}` })
    }

    // 4. Si ya estaba completado, responder ok idempotentemente
    if (payment.status === PaymentStatus.COMPLETED) {
      return NextResponse.json({ status: "already_completed" })
    }

    const now = new Date()

    // 5. Transacción atómica: Marcar pago como COMPLETED, activar Bid y Site
    let siteToRank: any = null
    let updatedBid = null

    await prisma.$transaction(async (tx) => {
      // Actualizar estado del pago
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
        },
      })

      // Si el pago está asociado a un sitio
      if (payment.siteId) {
        siteToRank = await tx.site.findUnique({
          where: { id: payment.siteId },
        })

        if (siteToRank) {
          // Activar el sitio si estaba pendiente
          if (siteToRank.status !== SiteStatus.ACTIVE) {
            await tx.site.update({
              where: { id: siteToRank.id },
              data: { status: SiteStatus.ACTIVE },
            })
          }

          // Desmarcar pujas ganadoras previas del sitio
          await tx.bid.updateMany({
            where: {
              siteId: siteToRank.id,
              isWinning: true,
            },
            data: { isWinning: false },
          })

          // Si el pago ya tenía bidId asociado, activarlo
          if (payment.bidId) {
            updatedBid = await tx.bid.update({
              where: { id: payment.bidId },
              data: {
                isWinning: true,
                auctionDate: now,
              },
            })
          } else {
            // Crear nueva puja ganadora
            updatedBid = await tx.bid.create({
              data: {
                siteId: siteToRank.id,
                userId: payment.userId,
                amount: payment.amount,
                isWinning: true,
                auctionDate: now,
              },
            })

            await tx.payment.update({
              where: { id: payment.id },
              data: { bidId: updatedBid.id },
            })
          }
        }
      }
    })

    // 6. Recalcular nueva posición del ranking
    let newRank = 1
    if (siteToRank) {
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
      newRank = sorted.findIndex((s) => s.id === (siteToRank as any).id) + 1

      // 7. Emitir evento en tiempo real a Pusher
      await triggerBidEvent({
        siteId: (siteToRank as any).id,
        siteName: (siteToRank as any).name,
        siteSlug: (siteToRank as any).slug,
        amount: Number(payment.amount),
        newRank: newRank || 1,
        userHandle: payment.user.handle || payment.user.name?.split(" ")[0] || "usuario",
        userName: payment.user.name || "Usuario",
        userAvatar: payment.user.image || null,
        timestamp: now.toISOString(),
      })

      console.log(`✅ [NOWPayments IPN] Pago exitoso procesado. Proyecto ${(siteToRank as any).name} subió al puesto #${newRank}`)
    }

    return NextResponse.json({
      success: true,
      status: "completed",
      newRank,
    })
  } catch (error: any) {
    console.error("❌ Error en POST /api/webhooks/nowpayments:", error)
    return NextResponse.json(
      { error: "Error interno al procesar webhook IPN" },
      { status: 500 }
    )
  }
}
