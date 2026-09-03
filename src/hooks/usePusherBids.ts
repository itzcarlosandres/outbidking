"use client"

import { useEffect, useState } from "react"
import { getPusherClient, BidEventPayload } from "@/lib/pusher"

export function usePusherBids(onNewBid?: (bid: BidEventPayload) => void) {
  const [lastBid, setLastBid] = useState<BidEventPayload | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const pusher = getPusherClient()
    if (!pusher) {
      // Pusher no configurado o en modo mock
      return
    }

    const channel = pusher.subscribe("ranking")

    channel.bind("pusher:subscription_succeeded", () => {
      setIsConnected(true)
    })

    channel.bind("bid:new", (data: BidEventPayload) => {
      setLastBid(data)
      if (onNewBid) {
        onNewBid(data)
      }
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [onNewBid])

  return { lastBid, isConnected }
}
