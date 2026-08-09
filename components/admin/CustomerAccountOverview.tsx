import Link from "next/link"
import type {
  CustomerOrganizationDetail,
} from "@/lib/admin/getCustomerOrganization"

type CustomerAccountOverviewProps = {
  organization: CustomerOrganizationDetail
}

function formatLabel(value: string | null) {
  if (!value) return "Not set"

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    )
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
      return "bg-red-100 text-red-800"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

function BooleanStatus({
  enabled,
}: {
  enabled: boolean
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        enabled
          ? "bg-emerald-100 text-emerald-800"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {enabled ? "Enabled" : "Disabled"}
    </span>
  )
}

export default function CustomerAccountOverview({
  organization,
}: CustomerAccountOverviewProps) {
  const activeMembers =
    organization.team_members.filter(
      (member) => member.is_active
    ).length

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/admin/customers"
            className="text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            ← Customer Accounts
          </Link>

          <h2 className="mt-3 text-3xl font-bold text-slate-950">
            {organization.name}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Organization ID: {organization.id}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${statusClasses(
              organization.subscription_status
            )}`}
          >
            {formatLabel(
              organization.subscription_status
            )}
          </span>

          <span
            className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${statusClasses(
              organization.access_status
            )}`}
          >
            Access:{" "}
            {formatLabel(organization.access_status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Subscription Plan
          </p>
          <p className="mt-2 text-xl font-bold text-slate-950">
            {formatLabel(
              organization.subscription_tier
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Members
          </p>
          <p className="mt-2 text-xl font-bold text-slate-950">
            {activeMembers}
            {organization.seat_limit
              ? ` / ${organization.seat_limit}`
              : ""}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Trial Ends
          </p>
          <p className="mt-2 text-xl font-bold text-slate-950">
            {formatDate(organization.trial_ends_at)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Customer Since
          </p>
          <p className="mt-2 text-xl font-bold text-slate-950">
            {formatDate(organization.created_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">
            Customer Profile
          </h3>

          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">
                Contact Email
              </dt>
              <dd className="mt-1 font-medium text-slate-950">
                {organization.contact_email || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500">
                Phone
              </dt>
              <dd className="mt-1 font-medium text-slate-950">
                {organization.phone || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500">
                Website
              </dt>
              <dd className="mt-1 font-medium text-slate-950">
                {organization.website || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500">
                Address
              </dt>
              <dd className="mt-1 whitespace-pre-line font-medium text-slate-950">
                {organization.address || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500">
                Account Slug
              </dt>
              <dd className="mt-1 font-medium text-slate-950">
                {organization.slug || "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">
            Billing Reference
          </h3>

          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">
                Billing Customer ID
              </dt>
              <dd className="mt-1 break-all font-medium text-slate-950">
                {organization.billing_customer_id || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500">
                Billing Subscription ID
              </dt>
              <dd className="mt-1 break-all font-medium text-slate-950">
                {organization.billing_subscription_id ||
                  "—"}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500">
                Subscription Status
              </dt>
              <dd className="mt-1 font-medium text-slate-950">
                {formatLabel(
                  organization.subscription_status
                )}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500">
                Access Status
              </dt>
              <dd className="mt-1 font-medium text-slate-950">
                {formatLabel(
                  organization.access_status
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">
          Usage Limits
        </h3>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-5">
          {[
            ["Seats", organization.seat_limit],
            ["Companies", organization.max_companies],
            ["Clients", organization.max_clients],
            [
              "Inventory Items",
              organization.max_inventory_items,
            ],
            [
              "Monthly Invoices",
              organization.max_monthly_invoices,
            ],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="mt-2 text-xl font-bold text-slate-950">
                {value ?? "Unlimited"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">
          Features and Intelligence
        </h3>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-950">
              Advanced Reports
            </p>
            <div className="mt-3">
              <BooleanStatus
                enabled={
                  organization.advanced_reports_enabled
                }
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-950">
              AI Assist
            </p>
            <div className="mt-3">
              <BooleanStatus
                enabled={organization.ai_assist_enabled}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-950">
              Smart AI
            </p>
            <div className="mt-3">
              <BooleanStatus
                enabled={organization.smart_ai_enabled}
              />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Plan:{" "}
              {formatLabel(organization.smart_ai_plan)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Expires:{" "}
              {formatDate(
                organization.smart_ai_expires_at
              )}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-950">
              Executive Intelligence
            </p>
            <div className="mt-3">
              <BooleanStatus
                enabled={
                  organization.executive_intelligence_enabled
                }
              />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Plan:{" "}
              {formatLabel(
                organization.executive_intelligence_plan
              )}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Expires:{" "}
              {formatDate(
                organization.executive_intelligence_expires_at
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-950">
            Team Members
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            {organization.team_members.length} total
            members · {activeMembers} active
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Member
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Position
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Added
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {organization.team_members.map(
                (member) => (
                  <tr key={member.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-950">
                        {member.full_name ||
                          member.email}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {member.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-800">
                      {formatLabel(member.role)}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {member.job_title || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <BooleanStatus
                        enabled={member.is_active}
                      />
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatDate(member.created_at)}
                    </td>
                  </tr>
                )
              )}

              {organization.team_members.length ===
                0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    No team members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
