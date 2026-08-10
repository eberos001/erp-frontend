"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { createSubscriptionCheckoutAction } from "@/app/account/subscription/actions"

type OrganizationBillingState = {
  id: string
  name: string
  subscription_tier: string | null
  subscription_status: string | null
  access_status: string | null
  trial_ends_at: string | null
  billing_customer_id: string | null
  billing_subscription_id: string | null
}

  export default function SubscriptionClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode")

  const supabase = createClient()

  const [organization, setOrganization] =
    useState<OrganizationBillingState | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [checkoutLoading, setCheckoutLoading] =
  useState("")

const [checkoutMessage, setCheckoutMessage] =
  useState("")

  useEffect(() => {
    async function loadSubscriptionState() {
      setLoading(true)
      setError("")

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push("/login")
        return
      }

      const { data: membership, error: membershipError } =
        await supabase
          .from("team_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .maybeSingle()

      if (membershipError || !membership) {
        setError("Unable to locate your organization.")
        setLoading(false)
        return
      }

      const { data, error: organizationError } =
        await supabase
          .from("organizations")
          .select(`
            id,
            name,
            subscription_tier,
            subscription_status,
            access_status,
            trial_ends_at,
            billing_customer_id,
            billing_subscription_id
          `)
          .eq("id", membership.organization_id)
          .single()

      if (organizationError || !data) {
        setError(
          organizationError?.message ||
            "Unable to load subscription information."
        )
        setLoading(false)
        return
      }

      setOrganization(data as OrganizationBillingState)
      setLoading(false)
    }

    loadSubscriptionState()
  }, [router, supabase])
  async function startCheckout(
  tier: "starter" | "growth" | "professional",
  interval: "monthly" | "annual"
) {
  const checkoutKey = `${tier}-${interval}`

  setCheckoutLoading(checkoutKey)
  setCheckoutMessage("")

  const result =
    await createSubscriptionCheckoutAction(
      tier,
      interval
    )

  if (!result.success || !result.url) {
    setCheckoutMessage(result.message)
    setCheckoutLoading("")
    return
  }

  window.location.href = result.url
}

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          Loading subscription...
        </div>
      </main>
    )
  }

  if (error || !organization) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="rounded-xl bg-red-950/40 p-4 text-red-200">
            {error || "Subscription information is unavailable."}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-sm font-semibold text-slate-300 hover:text-white"
          >
            ← Return to Dashboard
          </button>

          <h1 className="mt-5 text-4xl font-bold">
            Subscription Management
          </h1>

          <p className="mt-2 text-slate-300">
            Manage your Sephomic plan, billing status, and service access.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Organization
              </p>
              <p className="mt-2 font-semibold">
                {organization.name}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Current Plan
              </p>
              <p className="mt-2 font-semibold capitalize">
                {organization.subscription_tier || "Not set"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Subscription
              </p>
              <p className="mt-2 font-semibold capitalize">
                {(organization.subscription_status || "Not set").replace(
                  "_",
                  " "
                )}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Access
              </p>
              <p className="mt-2 font-semibold capitalize">
                {organization.access_status || "Not set"}
              </p>
            </div>
          </div>
        </section>

        {mode === "upgrade" ? (
          <section className="rounded-2xl border border-blue-800 bg-blue-950/30 p-6">
            <h2 className="text-xl font-semibold">
              Upgrade Plan
            </h2>

            <p className="mt-2 text-sm text-blue-100">
              Select a higher Sephomic plan to increase capacity,
              reporting, support, and intelligence access.
            </p>
          </section>
        ) : mode === "cancel" ? (
          <section className="rounded-2xl border border-red-800 bg-red-950/30 p-6">
            <h2 className="text-xl font-semibold">
              Terminate Service
            </h2>

            <p className="mt-2 text-sm text-red-100">
              Service termination will require confirmation before
              any subscription or account access changes are applied.
            </p>
          </section>
        ) : mode === "billing" ? (
          <section className="rounded-2xl border border-amber-700 bg-amber-950/30 p-6">
            <h2 className="text-xl font-semibold">
              Billing Attention Required
            </h2>

            <p className="mt-2 text-sm text-amber-100">
              Update payment or billing information to restore or
              maintain subscription access.
            </p>
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
  <h2 className="text-xl font-semibold">
    Choose Your Sephomic Plan
  </h2>

  <p className="mt-2 text-sm text-slate-300">
    Choose monthly billing or save with annual billing paid upfront.
  </p>

  {checkoutMessage ? (
    <p className="mt-4 rounded-xl border border-red-800 bg-red-950/30 p-3 text-sm text-red-200">
      {checkoutMessage}
    </p>
  ) : null}

  <div className="mt-6 grid gap-5 lg:grid-cols-3">
    {[
      {
        tier: "starter" as const,
        name: "Starter",
        monthly: "$399/mo",
        annual: "$4,309/yr",
        users: "3 included users",
      },
      {
        tier: "growth" as const,
        name: "Growth",
        monthly: "$725/mo",
        annual: "$7,830/yr",
        users: "15 included users",
      },
      {
        tier: "professional" as const,
        name: "Professional",
        monthly: "$8,000/mo",
        annual: "$86,400/yr",
        users: "50 included users",
      },
    ].map((plan) => (
      <div
        key={plan.tier}
        className="rounded-2xl border border-slate-700 bg-slate-950 p-5"
      >
        <h3 className="text-xl font-bold">
          {plan.name}
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          {plan.users}
        </p>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={() =>
              startCheckout(
                plan.tier,
                "monthly"
              )
            }
            disabled={checkoutLoading !== ""}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkoutLoading ===
            `${plan.tier}-monthly`
              ? "Opening Checkout..."
              : `${plan.monthly} — Monthly`}
          </button>

          <button
            type="button"
            onClick={() =>
              startCheckout(
                plan.tier,
                "annual"
              )
            }
            disabled={checkoutLoading !== ""}
            className="w-full rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkoutLoading ===
            `${plan.tier}-annual`
              ? "Opening Checkout..."
              : `${plan.annual} — Annual`}
          </button>
        </div>
      </div>
    ))}
  </div>

  <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-5">
    <h3 className="font-semibold">
      Enterprise
    </h3>

    <p className="mt-1 text-sm text-slate-400">
      Custom pricing, dedicated support, custom SLA,
      and enterprise AI configuration.
    </p>

    <button
      type="button"
      onClick={() =>
        router.push("/support")
      }
      className="mt-4 rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
    >
      Contact Sales
    </button>
  </div>
</section>
        )}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Billing Connection
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs text-slate-400">
                Billing Customer
              </p>

              <p className="mt-2 text-sm font-medium">
                {organization.billing_customer_id || "Not connected"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs text-slate-400">
                Billing Subscription
              </p>

              <p className="mt-2 text-sm font-medium">
                {organization.billing_subscription_id || "Not connected"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
