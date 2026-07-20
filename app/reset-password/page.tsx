"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const recoveryCheckedRef = useRef(false)

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)

  useEffect(() => {
  if (recoveryCheckedRef.current) return

  recoveryCheckedRef.current = true

  async function checkRecoverySession() {
    setError("")

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      setError(
        "No valid password reset session was found. Request a new reset link."
      )
      setCheckingSession(false)
      return
    }

    setHasRecoverySession(true)
    setCheckingSession(false)
  }

  checkRecoverySession()
}, [supabase])

  async function handleUpdatePassword(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setError("")
    setSuccessMessage("")

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      )
      return
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.")
      return
    }

    setLoading(true)

    const { error: updateError } =
      await supabase.auth.updateUser({
        password,
      })

    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setPassword("")
    setConfirmPassword("")

    setSuccessMessage(
      "Your password was updated successfully."
    )

    setTimeout(() => {
      router.push("/login")
      router.refresh()
    }, 1500)
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
            Choose a New Password
          </h1>

          <p className="mt-4 text-slate-300">
            Enter and confirm your new account password.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 text-slate-950 shadow-xl">
          {checkingSession ? (
            <p className="text-center text-sm text-slate-600">
              Verifying your reset link...
            </p>
          ) : hasRecoverySession ? (
            <form
              onSubmit={handleUpdatePassword}
              className="space-y-5"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">
                  New Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  required
                  minLength={8}
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
                {loading
                  ? "Updating..."
                  : "Update Password"}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>

              <Link
                href="/forgot-password"
                className="inline-block rounded-lg bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800"
              >
                Request a New Reset Link
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}