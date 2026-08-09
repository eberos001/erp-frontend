import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { requireSephomicAdmin } from "@/lib/admin/requireSephomicAdmin"

type BillingCustomer = {
  id: string
  name: string
  contact_email: string | null
  subscription_tier: string | null
  subscription_status: string | null
  access_status: string | null
  billing_customer_id: string | null
  billing_subscription_id: string | null
  trial_ends_at: string | null
  created_at: string
}

function formatLabel(value: string | null) {
  if (!value) return "Not set"

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatDate(value: string | null) {
  if (!value) return "—"

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

function statusClasses(status: string | null) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-800"
    case "trialing":
      return "bg-blue-100 text-blue-800"
    case "past_due":
      return "bg-amber-100 text-amber-800"
    case "suspended":
    case "disabled":
    case "cancelled":
    case "canceled":
    case "expired":
      return "bg-red-100 text-red-800"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

export default async function BillingPage() {
  const { administrator } = await requireSephomicAdmin()

  if (!administrator.can_manage_billing) {
    redirect("/admin")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("organizations")
    .select(`
      id,
      name,
      contact_email,
      subscription_tier,
      subscription_status,
      access_status,
      billing_customer_id,
      billing_subscription_id,
      trial_ends_at,
      created_at
    `)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(
      `Unable to load billing accounts: ${error.message}`
    )
  }

  const customers = (data ?? []) as BillingCustomer[]

  const activeSubscriptions = customers.filter(
    (customer) => customer.subscription_status === "active"
  ).length

  const trialingSubscriptions = customers.filter(
    (customer) => customer.subscription_status === "trialing"
  ).length

  const linkedBillingCustomers = customers.filter(
    (customer) => customer.billing_customer_id
  ).length

  const linkedSubscriptions = customers.filter(
    (customer) => customer.billing_subscription_id
  ).length

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Billing Administration
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-950">
          Billing & Subscriptions
        </h2>

        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Review customer subscription state, billing references,
          trial status, and payment-system connectivity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Subscriptions
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {activeSubscriptions}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Trialing
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {trialingSubscriptions}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Billing Customers Linked
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {linkedBillingCustomers}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Subscriptions Linked
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {linkedSubscriptions}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-lg font-bold text-slate-950">
            Customer Billing Accounts
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Customer
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Plan
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Access
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Trial Ends
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Billing Customer
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Subscription ID
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-950">
                      {customer.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {customer.contact_email || "No contact email"}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {formatLabel(customer.subscription_tier)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                        customer.subscription_status
                      )}`}
                    >
                      {formatLabel(customer.subscription_status)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                        customer.access_status
                      )}`}
                    >
                      {formatLabel(customer.access_status)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {formatDate(customer.trial_ends_at)}
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {customer.billing_customer_id || "Not linked"}
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {customer.billing_subscription_id || "Not linked"}
                  </td>
                </tr>
              ))}

              {customers.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    No customer billing records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
