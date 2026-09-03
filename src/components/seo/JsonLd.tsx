import React from "react"

interface WebSiteSchemaProps {
  siteName?: string
  siteUrl?: string
  description?: string
}

export function WebSiteJsonLd({
  siteName = "puja.lol",
  siteUrl = process.env.NEXTAUTH_URL || "https://puja.lol",
  description = "Real-time project leaderboard and competitive bidding directory for startups, SaaS and AI tools.",
}: WebSiteSchemaProps) {
  const cleanUrl = siteUrl.replace(/\/$/, "")

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${cleanUrl}/#website`,
        url: cleanUrl,
        name: siteName,
        description: description,
        inLanguage: "en-US",
        potentialAction: {
          "@type": "SearchAction",
          target: `${cleanUrl}/?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${cleanUrl}/#organization`,
        name: siteName,
        url: cleanUrl,
        logo: {
          "@type": "ImageObject",
          url: `${cleanUrl}/favicon.ico`,
        },
        sameAs: ["https://twitter.com/pujalol"],
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface ProductJsonLdProps {
  name: string
  description: string
  url: string
  slug: string
  category: string
  winningBid: number
  rank: number
}

export function ProductJsonLd({
  name,
  description,
  url,
  slug,
  category,
  winningBid,
  rank,
}: ProductJsonLdProps) {
  const baseUrl = (process.env.NEXTAUTH_URL || "https://puja.lol").replace(/\/$/, "")

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: name,
    description: description,
    url: url,
    applicationCategory: category,
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: winningBid > 0 ? winningBid.toString() : "5.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${baseUrl}/site/${slug}`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "128",
      bestRating: "5",
      worstRating: "1",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
