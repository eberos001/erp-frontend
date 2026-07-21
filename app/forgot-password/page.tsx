"use client"

import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault()

    setError("")
    setSuccessMessage("")
    setLoading(true)

    const redirectTo =
  typeof window !== "undefined"
    ? `${window.location.origin}/auth/callback?next=/reset-password`
    : undefined

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      })

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setSuccessMessage(
      "Password reset instructions have been sent. Check your email."
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white"
          >
            ← Back to login
          </Link>

          <h1 className="mt-6 text-4xl font-bold">
            Reset Your Password
          </h1>

          <p className="mt-4 text-slate-300">
            Enter your account email and we will send you reset instructions.
          </p>
        </div>

        <form
          onSubmit={handlePasswordReset}
          className="space-y-5 rounded-2xl bg-white p-8 text-slate-950 shadow-xl"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="you@example.com"
              required
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Instructions"}
          </button>
        </form>
      </div>
    </main>
  )
}