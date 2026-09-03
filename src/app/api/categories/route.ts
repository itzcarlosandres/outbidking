import { NextResponse } from "next/server"
import { getCategories } from "@/lib/categories"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error en GET /api/categories:", error)
    return NextResponse.json({ error: "Error al obtener categorías" }, { status: 500 })
  }
}
