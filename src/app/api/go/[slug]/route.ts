import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Conteo de clicks en memoria para no saturar la base de datos
const globalClicks = globalThis as unknown as {
  clickCache: Map<string, number> | undefined
  isFlusherStarted: boolean | undefined
}

if (!globalClicks.clickCache) {
  globalClicks.clickCache = new Map<string, number>()
}

// Iniciar flush periódico a la base de datos cada 30 segundos
if (!globalClicks.isFlusherStarted) {
  globalClicks.isFlusherStarted = true
  setInterval(async () => {
    if (!globalClicks.clickCache || globalClicks.clickCache.size === 0) return
    const entries = Array.from(globalClicks.clickCache.entries())
    globalClicks.clickCache.clear()

    for (const [slug, count] of entries) {
      try {
        await prisma.site.update({
          where: { slug },
          data: { clicks: { increment: count } },
        })
      } catch (e) {
        console.error(`Error persistiendo clicks para ${slug}:`, e)
      }
    }
  }, 30000)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const site = await prisma.site.findUnique({
      where: { slug },
      select: { url: true },
    })

    if (!site) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Registrar click en memoria
    const current = globalClicks.clickCache?.get(slug) || 0
    globalClicks.clickCache?.set(slug, current + 1)

    // Redirección 302 al sitio de destino
    const destination = site.url.startsWith("http") ? site.url : `https://${site.url}`
    return NextResponse.redirect(destination, { status: 302 })
  } catch (error) {
    console.error(`Error redirigiendo slug ${slug}:`, error)
    return NextResponse.redirect(new URL("/", request.url))
  }
}
