"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { submitSupportRequestAction } from "@/app/support/actions"

type Membership = {
  organization_id: string
}

export default function SupportPage() {
  const router = useRouter()
  const supabase = createClient()

  const [organizationId, setOrganizationId] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState("normal")
  const [statusMessage, setStatusMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadUserContext() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setEmail(user.email || "")

      const { data } = await supabase
        .from("team_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle()

      const membership = data as Membership | null

      if (membership) {
        setOrganizationId(membership.organization_id)
      }
    }

    loadUserContext()
  }, [router, supabase])

  async function submitSupportRequest(
  event: React.FormEvent
) {
  event.preventDefault()

  setStatusMessage("")
  setLoading(true)

  const formData = new FormData()

  formData.set("subject", subject)
  formData.set("message", message)
  formData.set("priority", priority)

  const result =
    await submitSupportRequestAction(formData)

  setLoading(false)

  setStatusMessage(result.message)

  if (!result.success) {
    return
  }

  setSubject("")
  setMessage("")
  setPriority("normal")
}
return (

    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="text-sm font-semibold text-slate-300 hover:text-white"
        >
          ← Return to Dashboard
        </button>

        <h1 className="mt-6 text-4xl font-bold">
          Sephomic Support
        </h1>

        <p className="mt-3 text-slate-300">
          Submit a support request directly to Sephomic Internal Operations.
        </p>

        <form
          onSubmit={submitSupportRequest}
          className="mt-8 space-y-5 rounded-2xl bg-white p-8 text-slate-950"
        >
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Account Email
            </label>
            <input
              value={email}
              disabled
              className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              Subject
            </label>
            <input
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value)
              }
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              Priority
            </label>
            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              How can we help?
            </label>
            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              required
              className="min-h-40 w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </div>

          {statusMessage ? (
            <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
              {statusMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading
              ? "Submitting..."
              : "Submit Support Request"}
          </button>
        </form>
      </div>
    </main>
  )
}
