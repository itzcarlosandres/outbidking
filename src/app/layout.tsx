import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { WebSiteJsonLd } from "@/components/seo/JsonLd"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

const baseUrl = process.env.NEXTAUTH_URL || "https://puja.lol"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "puja.lol — Real-Time Project Rankings & Live Outbidding",
    template: "%s | puja.lol",
  },
  description:
    "Submit your website, SaaS, AI tool, or startup and compete in live bids for the #1 leaderboard spot. Get maximum visibility, high-authority backlink, and real traffic.",
  keywords: [
    "ranking",
    "live bidding directory",
    "saas directory",
    "ai tools directory",
    "startup leaderboard",
    "outbid",
    "puja.lol",
    "promote my startup",
    "traffic for my website",
    "leaderboard",
  ],
  authors: [{ name: "puja.lol" }],
  creator: "puja.lol",
  publisher: "puja.lol",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "puja.lol — Real-Time Project Leaderboard & Live Bids",
    description: "Compete live for the #1 ranking spot. Submit your project today for instant visibility.",
    url: baseUrl,
    siteName: "puja.lol",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "puja.lol — Real-Time Project Leaderboard & Live Bids",
    description: "Compete live for the #1 ranking spot. Submit your project today.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <head>
        <WebSiteJsonLd />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('pujalol_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-[#FF4A1C] selection:text-white">
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

