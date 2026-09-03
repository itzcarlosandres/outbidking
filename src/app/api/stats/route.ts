import { NextResponse } from "next/server"
import { getPlatformStats } from "@/lib/ranking"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const stats = await getPlatformStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error en GET /api/stats:", error)
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    )
  }
}
