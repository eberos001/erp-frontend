"use client"

import { useMemo, useState, useTransition } from "react"

import { updateOrganizationModulesAction } from "@/app/admin/plans/actions"

type ModuleRecord = {
  id: string
  module_key: string
  name?: string | null
  description?: string | null
}

type OrganizationRecord = {
  id: string
  name: string
  subscription_tier: string | null
  access_status: string | null
}

type OrganizationModuleRecord = {
  organization_id: string
  module_id: string
  enabled: boolean
}

type OrganizationModuleEditorProps = {
  organizations: OrganizationRecord[]
  modules: ModuleRecord[]
  assignments: OrganizationModuleRecord[]
}

export default function OrganizationModuleEditor({
  organizations,
  modules,
  assignments,
}: OrganizationModuleEditorProps) {
  const [selectedOrganizationId, setSelectedOrganizationId] =
  useState("")

  const [isPending, startTransition] =
    useTransition()

  const [message, setMessage] =
    useState("")

 const [enabledModules, setEnabledModules] = useState<
  Record<string, boolean>
>({})

  const selectedOrganization = useMemo(
    () =>
      organizations.find(
        (organization) =>
          organization.id === selectedOrganizationId
      ),
    [organizations, selectedOrganizationId]
  )

  function loadOrganizationModules(
    organizationId: string
  ) {
    const nextState: Record<string, boolean> = {}

    for (const module of modules) {
      nextState[module.id] = assignments.some(
        (assignment) =>
          assignment.organization_id ===
            organizationId &&
          assignment.module_id === module.id &&
          assignment.enabled
      )
    }

    setEnabledModules(nextState)
  }

  function handleOrganizationChange(
    organizationId: string
  ) {
    setSelectedOrganizationId(organizationId)
    setMessage("")
    loadOrganizationModules(organizationId)
  }

  function toggleModule(
    moduleId: string
  ) {
    setEnabledModules((current) => ({
      ...current,
      [moduleId]: !current[moduleId],
    }))
  }

  function handleSave() {
    if (!selectedOrganizationId) {
      return
    }

    setMessage("")

    const payload = modules.map((module) => ({
      moduleId: module.id,
      enabled: enabledModules[module.id] ?? false,
    }))

    startTransition(async () => {
      const result =
        await updateOrganizationModulesAction(
          selectedOrganizationId,
          payload
        )

      setMessage(result.message)
    })
  }

  if (organizations.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          No customer organizations are available.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-950">
          Organization Feature Access
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          Enable or disable ERP modules for each customer
          organization.
        </p>
      </div>

      <div className="p-6">
        <label className="block max-w-xl">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Customer Organization
          </span>

          <select
  value={selectedOrganizationId}
  onChange={(event) =>
    handleOrganizationChange(event.target.value)
  }
  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-950"
>
  <option value="">
    Select a customer organization
  </option>

  {organizations.map((organization) => (
              <option
                key={organization.id}
                value={organization.id}
              >
                {organization.name}
              </option>
            ))}
          </select>
        </label>

        {selectedOrganization ? (
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
              Plan:{" "}
              {selectedOrganization.subscription_tier ||
                "Not set"}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
              Access:{" "}
              {selectedOrganization.access_status ||
                "Not set"}
            </span>
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const enabled =
              enabledModules[module.id] ?? false

            return (
              <button
                key={module.id}
                type="button"
                onClick={() =>
                  toggleModule(module.id)
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  enabled
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">
                      {module.name ||
                        module.module_key}
                    </p>

                    <p className="mt-1 font-mono text-xs text-slate-500">
                      {module.module_key}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      enabled
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {enabled
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </div>

                {module.description ? (
                  <p className="mt-3 text-xs leading-5 text-slate-600">
                    {module.description}
                  </p>
                ) : null}
              </button>
            )
          })}
        </div>

        {message ? (
          <p className="mt-6 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            {message}
          </p>
        ) : null}

        <div className="mt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={
  isPending || !selectedOrganizationId
}
            className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending
              ? "Saving..."
              : "Save Module Access"}
          </button>
        </div>
      </div>
    </section>
  )
}
