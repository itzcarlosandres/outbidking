import { Role } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    handle?: string | null
    role?: Role
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      handle?: string | null
      role?: Role
    }
  }
}
