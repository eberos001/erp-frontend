"use client"

import {
  useState,
  useTransition,
} from "react"

import {
  updateCustomerAccountAction,
} from "@/app/admin/customers/[organizationId]/actions"

type CustomerAccountEditorProps = {
  organization: {
    id: string
    name: string
    subscription_status?: string | null
    subscription_tier?: string | null
    access_status?: string | null
    seat_limit?: number | null
    smart_ai_enabled?: boolean | null
    executive_intelligence_enabled?:
      | boolean
      | null
  }
}

export default function CustomerAccountEditor({
  organization,
}: CustomerAccountEditorProps) {
  const [isEditing, setIsEditing] =
    useState(false)

  const [isPending, startTransition] =
    useTransition()

  const [message, setMessage] =
    useState("")

  const [isSuccess, setIsSuccess] =
    useState(false)

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setMessage("")
    setIsSuccess(false)

    const formData = new FormData(
      event.currentTarget
    )

    startTransition(async () => {
      const result =
        await updateCustomerAccountAction(
          organization.id,
          formData
        )

      setMessage(result.message)
      setIsSuccess(result.success)

      if (result.success) {
        setIsEditing(false)
      }
    })
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-950">
            Account Management
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            Manage subscription access, limits,
            and premium features.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setMessage("")
              setIsEditing(true)
            }}
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Edit Account
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
            isSuccess
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      {isEditing && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-6"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Customer Name
              </span>

              <input
                name="name"
                type="text"
                required
                defaultValue={organization.name}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-950 outline-none transition focus:border-slate-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Maximum Users
              </span>

              <input
                name="seat_limit"
                type="number"
                min="1"
                required
                defaultValue={
                  organization.seat_limit ?? 1
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-950 outline-none transition focus:border-slate-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Subscription Status
              </span>

              <select
                name="subscription_status"
                defaultValue={
                  organization.subscription_status ??
                  "trialing"
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-950 outline-none transition focus:border-slate-500"
              >
                <option value="trialing">
                  Trialing
                </option>
                <option value="active">
                  Active
                </option>
                <option value="past_due">
                  Past Due
                </option>
                <option value="canceled">
                  Canceled
                </option>
                <option value="expired">
                  Expired
                </option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Subscription Tier
              </span>

              <select
                name="subscription_tier"
                defaultValue={
                  organization.subscription_tier ??
                  "starter"
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-950 outline-none transition focus:border-slate-500"
              >
                <option value="starter">
                  Starter
                </option>
                <option value="growth">
                  Growth
                </option>
                <option value="professional">
                  Professional
                </option>
                <option value="enterprise">
                  Enterprise
                </option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Access Status
              </span>

              <select
                name="access_status"
                defaultValue={
                  organization.access_status ??
                  "active"
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-950 outline-none transition focus:border-slate-500"
              >
                <option value="active">
                  Active
                </option>
                <option value="restricted">
                  Restricted
                </option>
                <option value="suspended">
                  Suspended
                </option>
                <option value="disabled">
                  Disabled
                </option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
              <input
                name="smart_ai_enabled"
                type="checkbox"
                defaultChecked={
                  organization.smart_ai_enabled ??
                  false
                }
                className="h-4 w-4"
              />

              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  Smart AI
                </span>

                <span className="block text-xs text-slate-500">
                  Enable Smart AI access for
                  this organization.
                </span>
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
              <input
                name="executive_intelligence_enabled"
                type="checkbox"
                defaultChecked={
                  organization
                    .executive_intelligence_enabled ??
                  false
                }
                className="h-4 w-4"
              />

              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  Executive Intelligence
                </span>

                <span className="block text-xs text-slate-500">
                  Enable the premium executive
                  intelligence module.
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending
                ? "Saving..."
                : "Save Account Changes"}
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setMessage("")
                setIsEditing(false)
              }}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  )
}