import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | { toString: () => string }): string {
  const num = typeof amount === 'number' ? amount : Number(amount.toString())
  if (isNaN(num)) return '$0'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num).replace('US$', '$').replace('USD', '$').trim()
}

export function formatCompactNumber(number: number): string {
  return new Intl.NumberFormat('es-ES', { notation: 'compact', compactDisplay: 'short' }).format(number)
}

export function getDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function getFaviconUrl(url: string, size = 64): string {
  const domain = getDomain(url)
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
}
