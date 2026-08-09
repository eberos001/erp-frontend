import Link from "next/link"
import type { ReactNode } from "react"
import type {
  SephomicAdministrator,
} from "@/lib/admin/requireSephomicAdmin"

type AdminShellProps = {
  administrator: SephomicAdministrator
  children: ReactNode
}

const navigationItems = [
  {
    label: "Overview",
    href: "/admin",
    permission: null,
  },
  {
    label: "Customers",
    href: "/admin/customers",
    permission: "can_manage_customers",
  },
  {
    label: "Billing",
    href: "/admin/billing",
    permission: "can_manage_billing",
  },
  {
    label: "Plans & Features",
    href: "/admin/plans",
    permission: "can_manage_plans",
  },
  {
    label: "Support",
    href: "/admin/support",
    permission: "can_run_support_actions",
  },
  {
    label: "Audit Log",
    href: "/admin/audit",
    permission: "can_view_audit_logs",
  },
] as const

export default function AdminShell({
  administrator,
  children,
}: AdminShellProps) {
  const visibleNavigationItems =
    navigationItems.filter((item) => {
      if (!item.permission) {
        return true
      }

      return administrator[item.permission] === true
    })

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Sephomic Internal Operations
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Customer Administration & Billing Center
            </h1>
          </div>

          <div className="text-sm">
            <p className="font-semibold">
              {administrator.full_name ||
                administrator.email}
            </p>

            <p className="text-slate-400">
              {administrator.admin_role
                .replaceAll("_", " ")
                .replace(/\b\w/g, (character) =>
                  character.toUpperCase()
                )}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-slate-200 bg-white p-5 lg:min-h-[calc(100vh-93px)] lg:border-b-0 lg:border-r">
          <nav className="space-y-2">
            {visibleNavigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 border-t border-slate-200 pt-5">
            <Link
              href="/dashboard"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              Return to ERP Dashboard
            </Link>
          </div>
        </aside>

        <main className="min-w-0 p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
