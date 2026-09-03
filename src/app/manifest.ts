import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "puja.lol — Real-Time Project Rankings & Live Outbidding",
    short_name: "puja.lol",
    description: "Submit your SaaS, website or product and compete in live bids for the #1 spot.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F1117",
    theme_color: "#FF4A1C",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  }
}
