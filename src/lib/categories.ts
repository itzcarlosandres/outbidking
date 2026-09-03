import React from "react"
import { prisma } from "@/lib/db"
import {
  Bot,
  Search,
  Megaphone,
  Coins,
  Code2,
  Scale,
  ShieldCheck,
  Heart,
  Share2,
  Trophy,
  Briefcase,
  GraduationCap,
  Layers,
  ShoppingCart,
  Globe,
  Gamepad2,
  User,
  CheckSquare,
  Palette,
  PenTool,
  Rocket,
  Sparkles,
  Mic,
  Target,
  Flame,
  Zap,
  TrendingUp,
  Sliders,
  Folder,
  Link as LinkIcon,
  Tag,
  Star,
  Activity,
  Cpu,
  Radio,
  BookOpen,
  DollarSign,
  type LucideIcon,
} from "lucide-react"

export interface CategoryData {
  id: string
  name: string
  slug: string
  icon: string
  description?: string | null
  order: number
  isActive: boolean
}

// Mapa de iconos soportados de Lucide
export const ICON_MAP: Record<string, LucideIcon> = {
  Bot,
  Search,
  Megaphone,
  Coins,
  Code2,
  Scale,
  ShieldCheck,
  Heart,
  Share2,
  Trophy,
  Briefcase,
  GraduationCap,
  Layers,
  ShoppingCart,
  Globe,
  Gamepad2,
  User,
  CheckSquare,
  Palette,
  PenTool,
  Rocket,
  Sparkles,
  Mic,
  Target,
  Flame,
  Zap,
  TrendingUp,
  Sliders,
  Folder,
  Link: LinkIcon,
  Tag,
  Star,
  Activity,
  Cpu,
  Radio,
  BookOpen,
  DollarSign,
}

export function getCategoryIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || Sparkles
}

// 24 Categorías por defecto exactas de la imagen
export const INITIAL_CATEGORIES: Array<{
  name: string
  slug: string
  icon: string
  order: number
}> = [
  { name: "AI Agents & Infrastructure", slug: "ai-agents-infrastructure", icon: "Bot", order: 1 },
  { name: "SEO & AI Visibility", slug: "seo-ai-visibility", icon: "Search", order: 2 },
  { name: "Marketing & Advertising", slug: "marketing-advertising", icon: "Megaphone", order: 3 },
  { name: "Crypto, Web3 & Investing", slug: "crypto-web3-investing", icon: "Coins", order: 4 },
  { name: "Developer Tools", slug: "developer-tools", icon: "Code2", order: 5 },
  { name: "Business, Finance & Legal", slug: "business-finance-legal", icon: "Scale", order: 6 },
  { name: "Security, Privacy & Compliance", slug: "security-privacy-compliance", icon: "ShieldCheck", order: 7 },
  { name: "Health, Fitness & Wellness", slug: "health-fitness-wellness", icon: "Heart", order: 8 },
  { name: "Social Media & Creator Tools", slug: "social-media-creator-tools", icon: "Share2", order: 9 },
  { name: "Leaderboards & Attention Markets", slug: "leaderboards-attention-markets", icon: "Trophy", order: 10 },
  { name: "Hiring, Jobs & Careers", slug: "hiring-jobs-careers", icon: "Briefcase", order: 11 },
  { name: "Education & Learning", slug: "education-learning", icon: "GraduationCap", order: 12 },
  { name: "Agencies, Studios & Services", slug: "agencies-studios-services", icon: "Layers", order: 13 },
  { name: "Ecommerce & Retail", slug: "ecommerce-retail", icon: "ShoppingCart", order: 14 },
  { name: "Domains & Web Assets", slug: "domains-web-assets", icon: "Globe", order: 15 },
  { name: "Games & Entertainment", slug: "games-entertainment", icon: "Gamepad2", order: 16 },
  { name: "People & Profiles", slug: "people-profiles", icon: "User", order: 17 },
  { name: "Productivity & Personal Tools", slug: "productivity-personal-tools", icon: "CheckSquare", order: 18 },
  { name: "Design & Creative", slug: "design-creative", icon: "Palette", order: 19 },
  { name: "Writing & Content", slug: "writing-content", icon: "PenTool", order: 20 },
  { name: "Directories, Launch & Discovery", slug: "directories-launch-discovery", icon: "Rocket", order: 21 },
  { name: "AI Media Generation", slug: "ai-media-generation", icon: "Sparkles", order: 22 },
  { name: "Audio, Voice & Podcasting", slug: "audio-voice-podcasting", icon: "Mic", order: 23 },
  { name: "Sales & Lead Generation", slug: "sales-lead-generation", icon: "Target", order: 24 },
]

export async function getCategories(): Promise<CategoryData[]> {
  try {
    let list = await prisma.categoryItem.findMany({
      orderBy: { order: "asc" },
    })

    // Si la tabla está vacía, inicializar con las 24 categorías
    if (list.length === 0) {
      for (const cat of INITIAL_CATEGORIES) {
        await prisma.categoryItem.create({
          data: {
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            order: cat.order,
            isActive: true,
          },
        })
      }
      list = await prisma.categoryItem.findMany({
        orderBy: { order: "asc" },
      })
    }

    return list.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      description: c.description,
      order: c.order,
      isActive: c.isActive,
    }))
  } catch (error) {
    console.error("Error obteniendo categorías:", error)
    return INITIAL_CATEGORIES.map((c, i) => ({
      id: `init-${i}`,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      order: c.order,
      isActive: true,
    }))
  }
}
