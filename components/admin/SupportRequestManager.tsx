"use client"

import {
  useState,
  useTransition,
} from "react"

import {
  updateSupportRequestAction,
} from "@/app/admin/support/actions"

type SupportRequestManagerProps = {
  request: {
    id: string
    status: string
    admin_notes: string | null
  }
}

export default function SupportRequestManager({
  request,
}: SupportRequestManagerProps) {
  const [isPending, startTransition] =
    useTransition()

  const [status, setStatus] =
    useState(request.status)

  const [adminNotes, setAdminNotes] =
    useState(request.admin_notes || "")

  const [message, setMessage] =
    useState("")

  const [success, setSuccess] =
    useState(false)

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setMessage("")
    setSuccess(false)

    const formData =
      new FormData(event.currentTarget)

    startTransition(async () => {
      const result =
        await updateSupportRequestAction(
          request.id,
          formData
        )

      setMessage(result.message)
      setSuccess(result.success)
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 border-t border-slate-200 pt-5"
    >
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Request Status
          </span>

          <select
            name="status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-950"
          >
            <option value="open">
              Open
            </option>

            <option value="in_progress">
              In Progress
            </option>

            <option value="resolved">
              Resolved
            </option>

            <option value="closed">
              Closed
            </option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Internal Admin Notes
          </span>

          <textarea
            name="admin_notes"
            value={adminNotes}
            onChange={(event) =>
              setAdminNotes(
                event.target.value
              )
            }
            placeholder="Add internal troubleshooting notes, actions taken, or resolution details."
            className="min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-950"
          />
        </label>
      </div>

      {message ? (
        <p
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            success
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? "Saving..."
          : "Save Support Update"}
      </button>
    </form>
  )
}
