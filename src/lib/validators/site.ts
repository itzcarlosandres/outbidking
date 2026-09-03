import { z } from "zod"

export const PLANS = {
  basic: {
    id: "basic",
    name: "Básico",
    price: 5,
    days: 30,
    description: "Puja de entrada inicial para comenzar a rankear.",
    popular: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 25,
    days: 60,
    description: "Puja destacada para escalar puestos rápidamente.",
    popular: true,
  },
  elite: {
    id: "elite",
    name: "Elite",
    price: 100,
    days: 90,
    description: "Puja fuerte para competir por el Top del ranking.",
    popular: false,
  },
} as const

export type PlanType = keyof typeof PLANS

export const createSiteSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  url: z
    .string()
    .url("Ingresa una URL válida (ej: https://tudominio.com)")
    .max(255, "La URL es demasiado larga"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(200, "La descripción no puede superar 200 caracteres"),
  category: z
    .string()
    .min(1, "Selecciona una categoría válida"),
  initialBid: z
    .number()
    .min(1, "La puja inicial debe ser de al menos $1 USD")
    .default(5),
  plan: z.string().optional(),
  ownerHandle: z.string().optional(),
  ownerEmail: z.string().email("Email inválido").optional().or(z.literal("")),
})

export type CreateSiteInput = z.infer<typeof createSiteSchema>
