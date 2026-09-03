import { NextRequest, NextResponse } from "next/server"
import { getRanking } from "@/lib/ranking"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const view = (searchParams.get("view") as "all" | "today") || "all"
    const category = searchParams.get("category") || undefined
    const search = searchParams.get("search") || undefined
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    const result = await getRanking({
      view,
      category,
      search,
      page: isNaN(page) ? 1 : page,
      limit: isNaN(limit) ? 50 : Math.min(limit, 100),
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error en GET /api/ranking:", error)
    return NextResponse.json(
      { error: "Error al obtener el ranking" },
      { status: 500 }
    )
  }
}
