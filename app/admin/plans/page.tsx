import { redirect } from "next/navigation"
import OrganizationModuleEditor from "@/components/admin/OrganizationModuleEditor"
import { getCustomerOrganizations } from "@/lib/admin/getCustomerOrganizations"

import { createClient } from "@/lib/supabase/server"
import { requireSephomicAdmin } from "@/lib/admin/requireSephomicAdmin"

type ModuleRecord = {
  id: string
  module_key: string
  name?: string | null
  description?: string | null
}

type OrganizationModuleRecord = {
  organization_id: string
  module_id: string
  enabled: boolean
}

export default async function PlansPage() {
  const { administrator } = await requireSephomicAdmin()

  if (!administrator.can_manage_plans) {
    redirect("/admin")
  }

  const supabase = await createClient()
  const organizations =
  await getCustomerOrganizations()

  const {
    data: moduleData,
    error: moduleError,
  } = await supabase
    .from("modules")
    .select("*")
    .order("module_key", { ascending: true })

  if (moduleError) {
    throw new Error(
      `Unable to load modules: ${moduleError.message}`
    )
  }

  const {
    data: organizationModuleData,
    error: organizationModuleError,
  } = await supabase
    .from("organization_modules")
    .select("*")

  if (organizationModuleError) {
    throw new Error(
      `Unable to load organization modules: ${organizationModuleError.message}`
    )
  }

  const modules = (moduleData ?? []) as ModuleRecord[]
  const organizationModules =
    (organizationModuleData ?? []) as OrganizationModuleRecord[]

  const enabledAssignments = organizationModules.filter(
    (item) => item.enabled
  ).length

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Entitlement Administration
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-950">
          Plans & Features
        </h2>

        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Review the live module registry and organization feature
          assignments used by Sephomic.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Registered Modules
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {modules.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Module Assignments
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {organizationModules.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Enabled Assignments
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {enabledAssignments}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-lg font-bold text-slate-950">
            Module Registry
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Module
                </th>

                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Key
                </th>

                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Enabled Organizations
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {modules.map((module) => {
                const enabledCount =
                  organizationModules.filter(
                    (item) =>
                      item.module_id === module.id &&
                      item.enabled
                  ).length

                return (
                  <tr key={module.id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-950">
                        {module.name || module.module_key}
                      </p>

                      {module.description ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {module.description}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {module.module_key}
                    </td>

                    <td className="px-6 py-4 text-slate-700">
                      {enabledCount}
                    </td>
                  </tr>
                )
              })}

                       {modules.length === 0 && (
            <tr>
              <td
                colSpan={3}
                className="px-6 py-10 text-center text-slate-500"
              >
                No modules found in the registry.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>

  <OrganizationModuleEditor
    organizations={organizations.map(
      (organization) => ({
        id: organization.id,
        name: organization.name,
        subscription_tier:
          organization.subscription_tier,
        access_status:
          organization.access_status,
      })
    )}
    modules={modules}
    assignments={organizationModules}
  />
</div>
)
}