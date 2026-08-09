import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { requireSephomicAdmin } from "@/lib/admin/requireSephomicAdmin"
import SupportRequestManager from "@/components/admin/SupportRequestManager"

type SupportRequest = {
  id: string
  organization_id: string
  user_email: string | null
  subject: string
  message: string
  priority: string
  status: string
  admin_notes: string | null
  created_at: string
  organizations?: {
    name?: string | null
  } | null
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

export default async function AdminSupportPage() {
  const { administrator } = await requireSephomicAdmin()

  if (!administrator.can_run_support_actions) {
    redirect("/admin")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("support_requests")
    .select(`
      id,
      organization_id,
      user_email,
      subject,
      message,
      priority,
      status,
      admin_notes,
      created_at,
      organizations (
        name
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(
      `Unable to load support requests: ${error.message}`
    )
  }

  const requests = (data ?? []) as SupportRequest[]

  const openCount = requests.filter(
    (request) => request.status === "open"
  ).length

  const urgentCount = requests.filter(
    (request) =>
      request.priority === "urgent" &&
      request.status === "open"
  ).length

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Support Administration
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-950">
          Support & Recovery
        </h2>

        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Review customer support requests linked directly
          to their Sephomic organization.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Requests
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {requests.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Open Requests
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {openCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Urgent Requests
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {urgentCount}
          </p>
        </div>
      </div>

      <section className="space-y-4">
        {requests.map((request) => (
          <article
            key={request.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {request.organizations?.name ||
                    request.organization_id}
                </p>

                <h3 className="mt-2 text-lg font-bold text-slate-950">
                  {request.subject}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {request.user_email || "No email"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-slate-100 px-3 py-1 capitalize text-slate-700">
                  {request.priority}
                </span>

                <span className="rounded-full bg-blue-100 px-3 py-1 capitalize text-blue-700">
                  {request.status}
                </span>
              </div>
            </div>

            <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {request.message}
            </p>

            <p className="mt-5 text-xs text-slate-400">
              Submitted {formatDate(request.created_at)}
            </p>
            
            <SupportRequestManager
  request={{
    id: request.id,
    status: request.status,
    admin_notes: request.admin_notes,
  }}
/>
          </article>
        ))}

        {requests.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            No support requests have been submitted.
          </div>
        )}
      </section>
    </div>
  )
}
