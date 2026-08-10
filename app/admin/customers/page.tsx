import CustomerDirectory from "@/components/admin/CustomerDirectory"
import {
  getCustomerOrganizations,
} from "@/lib/admin/getCustomerOrganizations"

export default async function CustomersPage() {
  const organizations = await getCustomerOrganizations()

  const activeOrganizations = organizations.filter(
    (organization) => organization.access_status === "active"
  ).length

  const trialOrganizations = organizations.filter(
    (organization) =>
      organization.subscription_status === "trialing"
  ).length

  const totalActiveMembers = organizations.reduce(
    (total, organization) =>
      total + organization.active_member_count,
    0
  )

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-blue-700">
          Customer Administration
        </p>

        <h2 className="mt-1 text-3xl font-bold text-slate-950">
          Customer Accounts
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Review customer organizations, subscription access, account usage,
          and platform intelligence entitlements.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Customers
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {organizations.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Accounts
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {activeOrganizations}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {trialOrganizations} trialing
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Members
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {totalActiveMembers}
          </p>
        </div>
      </div>

      <CustomerDirectory organizations={organizations} />
    </section>
  )
}
