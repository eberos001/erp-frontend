"use server"

import Stripe from "stripe"

import { createClient } from "@/lib/supabase/server"

type BillingInterval =
  | "monthly"
  | "annual"

type SubscriptionTier =
  | "starter"
  | "growth"
  | "professional"

type CheckoutResult = {
  success: boolean
  message: string
  url?: string
}

const lookupKeys: Record<
  SubscriptionTier,
  Record<BillingInterval, string>
> = {
  starter: {
    monthly: "sephomic_starter_monthly",
    annual: "sephomic_starter_annual",
  },
  growth: {
    monthly: "sephomic_growth_monthly",
    annual: "sephomic_growth_annual",
  },
  professional: {
    monthly: "sephomic_professional_monthly",
    annual: "sephomic_professional_annual",
  },
}

function getStripe() {
  const secretKey =
    process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error(
      "Stripe secret key is not configured."
    )
  }

  return new Stripe(secretKey)
}

export async function createSubscriptionCheckoutAction(
  tier: SubscriptionTier,
  interval: BillingInterval
): Promise<CheckoutResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        message:
          "You must be signed in to manage a subscription.",
      }
    }

    const {
      data: membership,
      error: membershipError,
    } = await supabase
      .from("team_members")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle()

    if (
      membershipError ||
      !membership
    ) {
      return {
        success: false,
        message:
          "Unable to identify your organization.",
      }
    }

    if (
      membership.role !== "owner" &&
      membership.role !== "admin"
    ) {
      return {
        success: false,
        message:
          "Only an organization owner or administrator can purchase or change a subscription.",
      }
    }

    const {
      data: organization,
      error: organizationError,
    } = await supabase
      .from("organizations")
      .select(`
        id,
        name,
        contact_email,
        billing_customer_id
      `)
      .eq(
        "id",
        membership.organization_id
      )
      .single()

    if (
      organizationError ||
      !organization
    ) {
      return {
        success: false,
        message:
          "Unable to load your organization.",
      }
    }

    const stripe = getStripe()

    let customerId =
      organization.billing_customer_id

    if (!customerId) {
      const customer =
        await stripe.customers.create({
          name: organization.name,
          email:
            organization.contact_email ||
            user.email ||
            undefined,
          metadata: {
            organization_id:
              organization.id,
            source: "sephomic",
          },
        })

      customerId = customer.id

      const {
        error: customerUpdateError,
      } = await supabase
        .from("organizations")
        .update({
          billing_customer_id:
            customer.id,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", organization.id)

      if (customerUpdateError) {
        return {
          success: false,
          message:
            "Stripe customer was created, but Sephomic could not save the billing reference.",
        }
      }
    }

    const lookupKey =
      lookupKeys[tier][interval]

    const prices =
      await stripe.prices.list({
        lookup_keys: [lookupKey],
        active: true,
        limit: 1,
      })

    const price =
      prices.data[0]

    if (!price) {
      return {
        success: false,
        message:
          `Stripe price not found for ${tier} ${interval}.`,
      }
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000"

    const session =
      await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        success_url:
          `${appUrl}/account/subscription?checkout=success`,
        cancel_url:
          `${appUrl}/account/subscription?checkout=cancelled`,
        client_reference_id:
          organization.id,
        metadata: {
          organization_id:
            organization.id,
          subscription_tier: tier,
          billing_interval:
            interval,
        },
        subscription_data: {
          metadata: {
            organization_id:
              organization.id,
            subscription_tier:
              tier,
            billing_interval:
              interval,
          },
        },
      })

    if (!session.url) {
      return {
        success: false,
        message:
          "Stripe Checkout did not return a payment URL.",
      }
    }

    return {
      success: true,
      message:
        "Stripe Checkout created successfully.",
      url: session.url,
    }
  } catch (error) {
    console.error(
      "STRIPE CHECKOUT ERROR:",
      error
    )

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to start Stripe Checkout.",
    }
  }
}