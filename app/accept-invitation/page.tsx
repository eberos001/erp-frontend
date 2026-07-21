"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function AcceptInvitationContent() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [organizationId, setOrganizationId] = useState("")

  useEffect(() => {
    async function loadInvitation() {
      const token = searchParams.get("token")

      if (!token) {
        setMessage("Invitation link is missing a token.")
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("user_invitations")
        .select("id, organization_id, email, role, status, expires_at")
        .eq("token", token)
        .maybeSingle()

      if (error || !data) {
        setMessage("This invitation link is invalid.")
        setLoading(false)
        return
      }

      if (data.status !== "pending") {
        setMessage("This invitation has already been used or revoked.")
        setLoading(false)
        return
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setMessage("This invitation has expired.")
        setLoading(false)
        return
      }

      setEmail(data.email)
      setRole(data.role)
      setOrganizationId(data.organization_id)
      setMessage(
        "Invitation verified. Please sign up or log in with this email to continue."
      )
      setLoading(false)
    }

    loadInvitation()
  }, [searchParams, supabase])

  function continueToLogin() {
    router.push(`/login?email=${encodeURIComponent(email)}`)
  }
  function continueToCreateAccount() {
  router.push(`/create-account?email=${encodeURIComponent(email)}`)
}

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-md w-full">
          <p className="text-slate-600">Checking invitation...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-2">
          Accept Sephomic Invitation
        </h1>

        <p className="text-slate-600 mb-4">{message}</p>

        {email && (
          <div className="rounded-xl bg-slate-50 border p-4 mb-4 text-sm">
            <p>
              <span className="font-semibold">Email:</span> {email}
            </p>
            <p>
              <span className="font-semibold">Role:</span> {role}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Organization ID: {organizationId}
            </p>
          </div>
        )}

        {email && (
          <div className="space-y-3">
  <button
    type="button"
    onClick={continueToLogin}
    className="w-full bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition"
  >
    Continue to Login
  </button>

  <button
    type="button"
    onClick={continueToCreateAccount}
    className="w-full border border-slate-300 text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-50 transition"
  >
    Create Account
  </button>
</div>
        )}
      </div>
    </main>
  )
}
export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
          <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-md w-full">
            <p className="text-slate-600">Loading invitation...</p>
          </div>
        </main>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  )
}