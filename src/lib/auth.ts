import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import { Role } from "@prisma/client"

export async function getOrCreateDbUser(sessionUser: {
  id?: string
  email?: string | null
  name?: string | null
  image?: string | null
  handle?: string | null
}) {
  if (!sessionUser) return null

  // 1. Intentar por ID
  if (sessionUser.id) {
    const byId = await prisma.user.findUnique({ where: { id: sessionUser.id } })
    if (byId) return byId
  }

  // 2. Intentar por Email
  if (sessionUser.email) {
    const byEmail = await prisma.user.findUnique({ where: { email: sessionUser.email } })
    if (byEmail) return byEmail
  }

  // 3. Crear usuario automáticamente si no existe en la BD
  const rawEmail = sessionUser.email || `${sessionUser.id || "user"}@puja.lol`
  const baseHandle = sessionUser.handle || rawEmail.split("@")[0] || "user"
  const cleanHandle = baseHandle.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20) || "user"

  let handle = cleanHandle
  let count = 1
  while (await prisma.user.findUnique({ where: { handle } })) {
    handle = `${cleanHandle}_${count++}`
  }

  return await prisma.user.create({
    data: {
      email: rawEmail,
      name: sessionUser.name || handle,
      handle: handle,
      image: sessionUser.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}`,
      role: Role.USER,
    },
  })
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || "",
    }),
    Credentials({
      name: "Acceso Rápido (Dev / Demo)",
      credentials: {
        email: { label: "Email o Handle", type: "text", placeholder: "ej: admin@puja.lol o sofidev" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        const input = String(credentials.email).trim().toLowerCase()

        // Buscar usuario existente o crear uno de prueba al vuelo
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: input },
              { handle: input.replace(/^@/, '') },
            ],
          },
        })

        if (!user) {
          const handle = input.includes('@') ? input.split('@')[0] : input
          user = await prisma.user.create({
            data: {
              email: input.includes('@') ? input : `${handle}@usuario.com`,
              name: handle.charAt(0).toUpperCase() + handle.slice(1),
              handle: handle,
              role: handle === 'admin' ? Role.ADMIN : Role.USER,
              image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}`,
            },
          })
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          handle: user.handle,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user && user.email) {
        const dbUser = await getOrCreateDbUser({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        })
        if (dbUser) {
          user.id = dbUser.id
        }
      }
      return true
    },
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub
        session.user.handle = (token.handle as string) || null
        session.user.role = (token.role as Role) || Role.USER
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.handle = (user as { handle?: string }).handle || null
        token.role = (user as { role?: Role }).role || Role.USER
      }
      return token
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
})
