"use client"

import React, { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight,
  Globe,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react"

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get("callbackUrl") || "/admin"

  const [inputVal, setInputVal] = useState("admin@puja.lol")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await signIn("credentials", {
        email: inputVal.trim() || "admin@puja.lol",
        redirect: false,
        callbackUrl,
      })

      if (res?.error) {
        setError("Credenciales no válidas o acceso denegado.")
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (e: any) {
      setError(e.message || "Error al autenticar administrador")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--background)] px-4 py-12">
      
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-6 group">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF4A1C] text-white shadow-sm transition-transform group-hover:scale-105 font-black text-sm">
          ▲
        </div>
        <span className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
          puja<span className="text-[#FF4A1C]">.lol</span>
        </span>
      </Link>

      <div className="w-full max-w-md rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-8 shadow-soft space-y-6">
        
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-3">
            <Lock className="h-3.5 w-3.5" />
            <span>Administrative Access</span>
          </div>
          <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
            Backoffice Panel
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Exclusive authentication for system administrators.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        {/* Formulario de Login de Admin */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
              Admin Username or Email
            </label>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="admin@puja.lol"
              className="w-full h-12 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3.5 text-xs font-bold text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
              Security Key / Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-12 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3.5 text-xs text-[var(--foreground)] focus:border-[#FF4A1C] focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#FF4A1C] text-white font-bold text-xs shadow-md shadow-[#FF4A1C]/20 hover:bg-[#E63D10] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            <span>Sign In to Admin Panel</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[var(--card-border)]">
          <Link
            href="/"
            className="text-xs text-[var(--muted)] hover:text-[#FF4A1C] transition-colors"
          >
            ← Return to public site
          </Link>
        </div>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF4A1C]" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
