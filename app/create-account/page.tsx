"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function CreateAccountPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const invitedEmail = searchParams.get("email")

    if (invitedEmail) {
      setEmail(invitedEmail)
    }
  }, [searchParams])

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setLoading(true)

    if (!email.trim()) {
      setError("Email is required.")
      setLoading(false)
      return
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim() || null,
        },
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccessMessage(
      "Account created successfully. Please check your email if confirmation is required, then log in."
    )

    router.push(`/login?email=${encodeURIComponent(email.trim().toLowerCase())}`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-2">
          Create Your Sephomic Account
        </h1>

        <p className="text-slate-600 mb-6">
          Create an account using the invited email address.
        </p>

        <form onSubmit={handleCreateAccount} className="space-y-4">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            className="w-full border px-3 py-2 rounded-lg"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border px-3 py-2 rounded-lg"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border px-3 py-2 rounded-lg"
          />

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="text-sm text-green-600">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{" "}
          <Link href={`/login?email=${encodeURIComponent(email)}`} className="font-semibold text-slate-950 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}