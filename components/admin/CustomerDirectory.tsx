import Link from "next/link"
import type {
  CustomerOrganization,
} from "@/lib/admin/getCustomerOrganizations"

type CustomerDirectoryProps = {
  organizations: CustomerOrganization[]
}

function formatDate(value: string | null) {
  if (!value) return "—"

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

function formatLabel(value: string | null) {
  if (!value) return "Not set"

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
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

export default function CustomerDirectory({
  organizations,
}: CustomerDirectoryProps) {
  if (organizations.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-slate-950">
          No customer organizations found
        </h3>

        <p className="mt-2 text-sm text-slate-600">
          Customer organizations will appear here once they have been created.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Customer
              </th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Subscription
              </th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Access
              </th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Members
              </th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Intelligence
              </th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Created
              </th>
              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {organizations.map((organization) => (
              <tr
                key={organization.id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-950">
                    {organization.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {organization.contact_email ||
                      organization.slug ||
                      organization.id}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="font-medium text-slate-800">
                    {formatLabel(organization.subscription_tier)}
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                      organization.subscription_status
                    )}`}
                  >
                    {formatLabel(organization.subscription_status)}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                      organization.access_status
                    )}`}
                  >
                    {formatLabel(organization.access_status)}
                  </span>

                  {organization.trial_ends_at && (
                    <p className="mt-2 text-xs text-slate-500">
                      Trial ends {formatDate(organization.trial_ends_at)}
                    </p>
                  )}
                </td>

                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">
                    {organization.active_member_count}
                    <span className="font-normal text-slate-500">
                      {" "}
                      active
                    </span>
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {organization.member_count} total
                    {organization.seat_limit
                      ? ` · ${organization.seat_limit} seats`
                      : ""}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm text-slate-700">
                    Executive:{" "}
                    <span className="font-semibold">
                      {organization.executive_intelligence_enabled
                        ? formatLabel(
                            organization.executive_intelligence_plan
                          )
                        : "Off"}
                    </span>
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    Smart AI:{" "}
                    <span className="font-semibold">
                      {organization.smart_ai_enabled
                        ? formatLabel(organization.smart_ai_plan)
                        : "Off"}
                    </span>
                  </p>
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {formatDate(organization.created_at)}
                </td>

                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/customers/${organization.id}`}
                    className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                  >
                    View account
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
