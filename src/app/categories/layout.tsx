import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Explore 24+ Categories — AI, SaaS, Crypto & Developer Tools",
  description:
    "Discover top-performing projects organized across 24 niche categories: AI Agents, SEO, Developer Tools, Marketing, Web3, and more.",
  alternates: {
    canonical: "/categories",
  },
  openGraph: {
    title: "Explore 24+ Project Categories — puja.lol",
    description: "Browse ranked projects across AI Agents, SEO, Dev Tools, and more.",
    url: "/categories",
    type: "website",
  },
}

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
