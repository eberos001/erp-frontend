"use client"

export default function ExecutiveIntelligence() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Sephomic Executive Intelligence
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          Today&apos;s Executive Summary
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Executive Intelligence will analyze purchasing, inventory, sales,
          finance, and operational activity to identify risks, bottlenecks,
          and growth opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Risks needing attention
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            —
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Growth opportunities
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            —
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Recommendations
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            —
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-900">
          Intelligence engine connection pending
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          This module is ready for Sephomic&apos;s organization-scoped metrics
          and recommendation engine.
        </p>
      </div>
    </section>
  )
}