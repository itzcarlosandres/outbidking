import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "puja.lol — Real-Time Project Rankings & Live Outbidding",
  description:
    "Submit your website, SaaS, tool, or channel and compete in live bids for the #1 leaderboard spot. Maximum visibility and traffic for your projects.",
  keywords: ["ranking", "live bidding", "saas directory", "startups", "outbid", "puja.lol", "leaderboard"],
  authors: [{ name: "puja.lol team" }],
  openGraph: {
    title: "puja.lol — Real-Time Project Leaderboard & Live Bids",
    description: "Compete live for the #1 ranking spot. Submit your project today.",
    siteName: "puja.lol",
    type: "website",
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
