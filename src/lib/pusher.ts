import PusherServer from "pusher"
import PusherClient from "pusher-js"

// Servidor Pusher (Singleton)
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || "mock_app_id",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || "mock_key",
  secret: process.env.PUSHER_SECRET || "mock_secret",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
  useTLS: true,
})

export interface BidEventPayload {
  siteId: string
  siteName: string
  siteSlug: string
  amount: number
  newRank: number
  userHandle: string
  userName: string
  userAvatar?: string | null
  timestamp: string
}

export async function triggerBidEvent(payload: BidEventPayload) {
  try {
    if (
      process.env.PUSHER_APP_ID &&
      process.env.PUSHER_APP_ID !== "mock_pusher_app_id" &&
      process.env.PUSHER_SECRET !== "mock_pusher_secret"
    ) {
      await pusherServer.trigger("ranking", "bid:new", payload)
    } else {
      console.log("📢 [Pusher Simulado en Servidor] Evento 'bid:new':", payload)
    }
  } catch (error) {
    console.error("⚠️ Error emitiendo evento de Pusher:", error)
  }
}

// Cliente Pusher (Singleton en navegador)
let clientInstance: PusherClient | null = null

export function getPusherClient(): PusherClient | null {
  if (typeof window === "undefined") return null
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  if (!key || key === "mock_pusher_key" || key === "mock_key") {
    // Si no hay key real configurada, retornamos null y el hook usará fallback/polling
    return null
  }
  if (!clientInstance) {
    clientInstance = new PusherClient(key, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
    })
  }
  return clientInstance
}
