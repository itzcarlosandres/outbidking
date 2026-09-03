import { prisma } from "@/lib/db"

export interface SiteConfigData {
  id?: string
  siteName: string
  logoText: string
  logoAccent: string
  tagline: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  ogImage?: string | null
  faviconUrl?: string | null
  googleAnalyticsId?: string | null
  heroTitle: string
  heroSubtitle: string
  bannerNotice?: string | null
  minIncrement: number
  maxBidsPerHour: number
  basicPrice: number
  basicDays: number
  proPrice: number
  proDays: number
  elitePrice: number
  eliteDays: number
  // Pasarelas & Pagos
  nowpaymentsApiKey?: string
  nowpaymentsIpnSecret?: string
  nowpaymentsSandbox?: boolean
  enableCryptoPayments?: boolean
  enableTestPayments?: boolean
  enableManualPayments?: boolean
  walletUsdtTrc20?: string
  walletUsdtErc20?: string
  walletBtc?: string
  walletSol?: string
  manualPaymentNotes?: string
}

export const DEFAULT_CONFIG: SiteConfigData = {
  siteName: "puja.lol",
  logoText: "puja",
  logoAccent: ".lol",
  tagline: "Real-time leaderboard & live bidding directory",
  metaTitle: "puja.lol — Real-Time Project Rankings & Live Outbidding",
  metaDescription: "Submit your website, SaaS, tool, or channel and compete in live bids for the #1 spot. Maximum exposure and direct traffic.",
  metaKeywords: "ranking, live bidding, saas directory, startups, outbid, puja.lol, leaderboard",
  ogImage: "",
  faviconUrl: "",
  googleAnalyticsId: "",
  heroTitle: "Claim #1 for",
  heroSubtitle: "Submit your website, channel, or product and compete in live bids for the top ranking spot. The Top 3 gets maximum visibility.",
  bannerNotice: "Welcome to puja.lol! Compete in real-time to position your product at the top.",
  minIncrement: 5,
  maxBidsPerHour: 10,
  basicPrice: 5,
  basicDays: 7,
  proPrice: 12,
  proDays: 30,
  elitePrice: 25,
  eliteDays: 90,
  // Pasarelas & Pagos
  nowpaymentsApiKey: "",
  nowpaymentsIpnSecret: "",
  nowpaymentsSandbox: false,
  enableCryptoPayments: true,
  enableTestPayments: true,
  enableManualPayments: false,
  walletUsdtTrc20: "",
  walletUsdtErc20: "",
  walletBtc: "",
  walletSol: "",
  manualPaymentNotes: "Send the exact amount to any of our official wallets and contact support with the transaction hash (TxID).",
}

export async function getSiteConfig(): Promise<SiteConfigData> {
  try {
    let config = await prisma.siteConfig.findFirst()
    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          siteName: DEFAULT_CONFIG.siteName,
          logoText: DEFAULT_CONFIG.logoText,
          logoAccent: DEFAULT_CONFIG.logoAccent,
          tagline: DEFAULT_CONFIG.tagline,
          metaTitle: DEFAULT_CONFIG.metaTitle,
          metaDescription: DEFAULT_CONFIG.metaDescription,
          metaKeywords: DEFAULT_CONFIG.metaKeywords,
          ogImage: DEFAULT_CONFIG.ogImage,
          faviconUrl: DEFAULT_CONFIG.faviconUrl,
          googleAnalyticsId: DEFAULT_CONFIG.googleAnalyticsId,
          heroTitle: DEFAULT_CONFIG.heroTitle,
          heroSubtitle: DEFAULT_CONFIG.heroSubtitle,
          bannerNotice: DEFAULT_CONFIG.bannerNotice,
          minIncrement: DEFAULT_CONFIG.minIncrement,
          maxBidsPerHour: DEFAULT_CONFIG.maxBidsPerHour,
          basicPrice: DEFAULT_CONFIG.basicPrice,
          basicDays: DEFAULT_CONFIG.basicDays,
          proPrice: DEFAULT_CONFIG.proPrice,
          proDays: DEFAULT_CONFIG.proDays,
          elitePrice: DEFAULT_CONFIG.elitePrice,
          eliteDays: DEFAULT_CONFIG.eliteDays,
          nowpaymentsApiKey: DEFAULT_CONFIG.nowpaymentsApiKey || "",
          nowpaymentsIpnSecret: DEFAULT_CONFIG.nowpaymentsIpnSecret || "",
          nowpaymentsSandbox: DEFAULT_CONFIG.nowpaymentsSandbox || false,
          enableCryptoPayments: DEFAULT_CONFIG.enableCryptoPayments ?? true,
          enableTestPayments: DEFAULT_CONFIG.enableTestPayments ?? true,
          enableManualPayments: DEFAULT_CONFIG.enableManualPayments ?? false,
          walletUsdtTrc20: DEFAULT_CONFIG.walletUsdtTrc20 || "",
          walletUsdtErc20: DEFAULT_CONFIG.walletUsdtErc20 || "",
          walletBtc: DEFAULT_CONFIG.walletBtc || "",
          walletSol: DEFAULT_CONFIG.walletSol || "",
          manualPaymentNotes: DEFAULT_CONFIG.manualPaymentNotes || "",
        },
      })
    }

    return {
      id: config.id,
      siteName: config.siteName,
      logoText: config.logoText,
      logoAccent: config.logoAccent,
      tagline: config.tagline,
      metaTitle: config.metaTitle,
      metaDescription: config.metaDescription,
      metaKeywords: config.metaKeywords,
      ogImage: config.ogImage,
      faviconUrl: config.faviconUrl,
      googleAnalyticsId: config.googleAnalyticsId,
      heroTitle: config.heroTitle,
      heroSubtitle: config.heroSubtitle,
      bannerNotice: config.bannerNotice,
      minIncrement: Number(config.minIncrement),
      maxBidsPerHour: config.maxBidsPerHour,
      basicPrice: Number(config.basicPrice),
      basicDays: config.basicDays,
      proPrice: Number(config.proPrice),
      proDays: config.proDays,
      elitePrice: Number(config.elitePrice),
      eliteDays: config.eliteDays,
      nowpaymentsApiKey: config.nowpaymentsApiKey || "",
      nowpaymentsIpnSecret: config.nowpaymentsIpnSecret || "",
      nowpaymentsSandbox: config.nowpaymentsSandbox ?? false,
      enableCryptoPayments: config.enableCryptoPayments ?? true,
      enableTestPayments: config.enableTestPayments ?? true,
      enableManualPayments: config.enableManualPayments ?? false,
      walletUsdtTrc20: config.walletUsdtTrc20 || "",
      walletUsdtErc20: config.walletUsdtErc20 || "",
      walletBtc: config.walletBtc || "",
      walletSol: config.walletSol || "",
      manualPaymentNotes: config.manualPaymentNotes || "",
    }
  } catch (error) {
    console.error("Error obteniendo SiteConfig:", error)
    return DEFAULT_CONFIG
  }
}
