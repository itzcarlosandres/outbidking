import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "All-Time Hall of Fame & Leaderboard — puja.lol",
  description:
    "Explore the highest-ranking SaaS, AI startups, and independent projects of all time. Real-time podium and active outbidding.",
  alternates: {
    canonical: "/leaderboard",
  },
  openGraph: {
    title: "All-Time Hall of Fame & Leaderboard — puja.lol",
    description: "Explore the top-ranked SaaS, AI startups, and tools.",
    url: "/leaderboard",
    type: "website",
  },
}

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
