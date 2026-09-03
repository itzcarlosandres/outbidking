import { z } from "zod"

export const createBidSchema = z.object({
  siteId: z.string().min(1, "El ID del sitio es requerido"),
  amount: z
    .number({ message: "Ingresa un monto numérico válido" })
    .min(1, "La puja mínima permitida es de $1 USD")
    .max(1_000_000, "La puja máxima permitida es de $1,000,000 USD"),
  userHandle: z.string().optional(),
  userEmail: z.string().email("Email inválido").optional().or(z.literal("")),
})

export type CreateBidInput = z.infer<typeof createBidSchema>
