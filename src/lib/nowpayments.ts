import crypto from "crypto"
import { prisma } from "@/lib/db"

const API_BASE_PROD = "https://api.nowpayments.io/v1"
const API_BASE_SANDBOX = "https://api-sandbox.nowpayments.io/v1"

export async function getNowPaymentsSettings() {
  try {
    const config = await prisma.siteConfig.findFirst()
    const apiKey = config?.nowpaymentsApiKey || process.env.NOWPAYMENTS_API_KEY || ""
    const ipnSecret = config?.nowpaymentsIpnSecret || process.env.NOWPAYMENTS_IPN_SECRET || ""
    const isSandbox = config?.nowpaymentsSandbox ?? (process.env.NOWPAYMENTS_SANDBOX === "true")
    const baseUrl = isSandbox ? API_BASE_SANDBOX : API_BASE_PROD

    return { apiKey, ipnSecret, isSandbox, baseUrl }
  } catch {
    const apiKey = process.env.NOWPAYMENTS_API_KEY || ""
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || ""
    const isSandbox = process.env.NOWPAYMENTS_SANDBOX === "true"
    const baseUrl = isSandbox ? API_BASE_SANDBOX : API_BASE_PROD
    return { apiKey, ipnSecret, isSandbox, baseUrl }
  }
}

export function getNowPaymentsBaseUrl(): string {
  const isSandbox = process.env.NOWPAYMENTS_SANDBOX === "true"
  return isSandbox ? API_BASE_SANDBOX : API_BASE_PROD
}

export function getNowPaymentsApiKey(): string {
  return process.env.NOWPAYMENTS_API_KEY || ""
}

export function getNowPaymentsIpnSecret(): string {
  return process.env.NOWPAYMENTS_IPN_SECRET || ""
}

export interface CreateInvoiceParams {
  amount: number
  orderId: string
  orderDescription: string
  successUrl: string
  cancelUrl: string
  ipnCallbackUrl?: string
}

export interface NowPaymentsInvoiceResponse {
  id: string
  token_id?: string
  order_id: string
  order_description: string
  price_amount: string
  price_currency: string
  pay_currency?: string
  ipn_callback_url: string
  invoice_url: string
  success_url: string
  cancel_url: string
  created_at: string
  updated_at: string
}

/**
 * Crea una factura en NOWPayments para pagos con criptomonedas (USDT, SOL, BTC, etc.)
 */
export async function createNowPaymentsInvoice(
  params: CreateInvoiceParams
): Promise<{ success: boolean; invoiceUrl: string; invoiceId: string; isMock?: boolean }> {
  const { apiKey, baseUrl } = await getNowPaymentsSettings()

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3001"
  const defaultIpnUrl = `${appUrl}/api/webhooks/nowpayments`

  // Si no hay API Key configurada, generar factura mock para entorno de pruebas
  if (!apiKey || apiKey.trim() === "" || apiKey === "mock") {
    console.log("ℹ️ [NOWPayments] Modo Simulado activo (Sin API Key configurada).")
    const mockInvoiceId = `mock_inv_${Date.now()}`
    const mockUrl = `${appUrl}/api/webhooks/nowpayments/mock-checkout?orderId=${encodeURIComponent(
      params.orderId
    )}&amount=${params.amount}&desc=${encodeURIComponent(
      params.orderDescription
    )}&successUrl=${encodeURIComponent(params.successUrl)}`

    return {
      success: true,
      invoiceUrl: mockUrl,
      invoiceId: mockInvoiceId,
      isMock: true,
    }
  }

  try {
    const res = await fetch(`${baseUrl}/invoice`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: params.amount,
        price_currency: "usd",
        order_id: params.orderId,
        order_description: params.orderDescription,
        ipn_callback_url: params.ipnCallbackUrl || defaultIpnUrl,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error("❌ Error de NOWPayments API:", data)
      throw new Error(data.message || data.error || "Error al generar factura de NOWPayments")
    }

    return {
      success: true,
      invoiceUrl: data.invoice_url,
      invoiceId: data.id,
      isMock: false,
    }
  } catch (error: any) {
    console.error("❌ Error en createNowPaymentsInvoice:", error)
    throw error
  }
}

/**
 * Ordena recursivamente las claves de un objeto para la firma HMAC de NOWPayments
 */
function sortObject(obj: any): any {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return obj
  }
  return Object.keys(obj)
    .sort()
    .reduce((result: any, key: string) => {
      result[key] = sortObject(obj[key])
      return result
    }, {})
}

/**
 * Valida la firma HMAC-SHA512 del webhook IPN de NOWPayments
 */
export async function verifyNowPaymentsSignature(
  rawBodyPayload: any,
  receivedSignature: string | null
): Promise<boolean> {
  const { ipnSecret } = await getNowPaymentsSettings()

  // Si no hay secret configurado en entorno local de pruebas, aceptar para testing
  if (!ipnSecret || ipnSecret.trim() === "") {
    console.warn("⚠️ [NOWPayments IPN] No hay IPN Secret configurado en .env ni en BD. Omitiendo validación de firma en desarrollo.")
    return true
  }

  if (!receivedSignature) {
    return false
  }

  try {
    const sortedPayload = sortObject(rawBodyPayload)
    const jsonString = JSON.stringify(sortedPayload)

    const hmac = crypto.createHmac("sha512", ipnSecret)
    hmac.update(jsonString)
    const expectedSignature = hmac.digest("hex")

    return expectedSignature.toLowerCase() === receivedSignature.toLowerCase()
  } catch (err) {
    console.error("Error verificando firma de NOWPayments:", err)
    return false
  }
}

/**
 * Consulta el estado de un pago directamente en NOWPayments
 */
export async function getNowPaymentsPaymentStatus(paymentId: string | number) {
  const apiKey = getNowPaymentsApiKey()
  const baseUrl = getNowPaymentsBaseUrl()

  if (!apiKey || apiKey === "mock") {
    return {
      payment_status: "finished",
      isMock: true,
    }
  }

  try {
    const res = await fetch(`${baseUrl}/payment/${paymentId}`, {
      headers: {
        "x-api-key": apiKey,
      },
    })
    return await res.json()
  } catch (e) {
    console.error("Error obteniendo estado de pago NOWPayments:", e)
    return null
  }
}
