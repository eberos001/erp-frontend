"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

  function LoginContent() {
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => {
  const invitedEmail = searchParams.get("email")

  if (invitedEmail) {
    setEmail(invitedEmail)
  }
}, [searchParams])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-bold text-black">Login</h1>

        <div>
          <label className="mb-1 block text-sm font-medium text-black">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-black"
            required
          />
        </div>

                <div>
          <label className="mb-1 block text-sm font-medium text-black">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-black"
            required
          />
        </div>

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-slate-600 hover:text-black hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {error ? (
          <p className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <div className="space-y-2 pt-2 text-center text-sm">
  <p className="text-slate-600">
    Need access?{" "}
    <Link
      href="/signup"
      className="font-semibold text-black hover:underline"
    >
      Request a demo
    </Link>
  </p>

  <Link
    href="/"
    className="inline-block text-slate-500 hover:text-black hover:underline"
  >
    Return to homepage
  </Link>
</div>
      </form>
    </main>
  )
}
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
            <p className="text-slate-600">Loading login page...</p>
          </div>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  )
}