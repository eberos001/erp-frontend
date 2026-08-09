import Link from "next/link"
import {
  requireSephomicAdmin,
} from "@/lib/admin/requireSephomicAdmin"

const administrationAreas = [
  {
    title: "Customer Accounts",
    description:
      "Create, edit, activate, disable, and manage customer organizations.",
    href: "/admin/customers",
    permission: "can_manage_customers",
  },
  {
    title: "Billing & Subscriptions",
    description:
      "Manage plans, billing cycles, payments, renewals, and account status.",
    href: "/admin/billing",
    permission: "can_manage_billing",
  },
  {
    title: "Plans & Features",
    description:
      "Control subscriptions, modules, entitlements, and administrative overrides.",
    href: "/admin/plans",
    permission: "can_manage_plans",
  },
  {
    title: "Support & Recovery",
    description:
      "Diagnose account issues, refresh settings, remove trial data, and run safe recovery actions.",
    href: "/admin/support",
    permission: "can_run_support_actions",
  },
  {
    title: "Administrative Audit",
    description:
      "Review platform-level customer, billing, feature, and support actions.",
    href: "/admin/audit",
    permission: "can_view_audit_logs",
  },
] as const

export default async function AdminPage() {
  const { administrator } =
    await requireSephomicAdmin()

  const availableAreas =
    administrationAreas.filter(
      (area) =>
        administrator[area.permission] === true
    )

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-blue-700">
          Platform Administration
        </p>

        <h2 className="mt-1 text-3xl font-bold text-slate-950">
          Administration Overview
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Manage Sephomic customer accounts,
          subscriptions, billing, feature access,
          support actions, and administrative activity
          from one protected operations center.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Administrator Role
          </p>

          <p className="mt-2 text-xl font-bold capitalize text-slate-950">
            {administrator.admin_role.replaceAll("_", " ")}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Account Status
          </p>

          <p className="mt-2 text-xl font-bold text-emerald-700">
            Active
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Available Controls
          </p>

          <p className="mt-2 text-xl font-bold text-slate-950">
            {availableAreas.length}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-950">
          Administration Areas
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {availableAreas.map((area) => (
            <Link
              key={area.href}
              href={area.href}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <h4 className="text-lg font-bold text-slate-950">
                {area.title}
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {area.description}
              </p>

              <p className="mt-4 text-sm font-semibold text-blue-700">
                Open area →
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="font-semibold text-amber-950">
          Protected internal system
        </h3>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          This administration center is separate from
          customer organization permissions. Access is
          limited to active Sephomic platform
          administrators.
        </p>
      </div>
    </section>
  )
}
