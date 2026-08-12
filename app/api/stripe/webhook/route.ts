import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

import { createClient } from "@supabase/supabase-js"

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error("Stripe secret key is not configured.")
  }

  return new Stripe(secretKey)
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()

  const signature = request.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe webhook configuration." },
      { status: 400 }
    )
  }

  const body = await request.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (error) {
    console.error("STRIPE WEBHOOK SIGNATURE ERROR:", error)

    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 }
    )
  }

  const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Supabase service-role configuration is missing."
  )
}

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

  try {
    if (
      event.type === "checkout.session.completed"
    ) {
      const session =
        event.data.object as Stripe.Checkout.Session

      const organizationId =
        session.metadata?.organization_id ||
        session.client_reference_id

      const tier =
        session.metadata?.subscription_tier

     if (
  organizationId &&
  session.customer &&
  session.subscription
) {
  const { error: checkoutUpdateError } =
    await supabase
      .from("organizations")
      .update({
        billing_customer_id:
          typeof session.customer === "string"
            ? session.customer
            : session.customer.id,
        billing_subscription_id:
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id,
        subscription_status: "active",
        subscription_tier:
          tier || undefined,
        access_status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", organizationId)

  if (checkoutUpdateError) {
  throw new Error(
    `Checkout synchronization failed: ${checkoutUpdateError.message}`
  )
}
}
}

if (
  event.type === "customer.subscription.updated" ||
  event.type === "customer.subscription.deleted"
) {
  const subscription =
    event.data.object as Stripe.Subscription

      const organizationId =
        subscription.metadata?.organization_id

      const tier =
        subscription.metadata?.subscription_tier

      if (organizationId) {
        const stripeStatus = subscription.status

        let accessStatus = "active"

        if (
          stripeStatus === "past_due" ||
          stripeStatus === "unpaid"
        ) {
          accessStatus = "restricted"
        }

        if (
          stripeStatus === "canceled" ||
          stripeStatus === "incomplete_expired"
        ) {
          accessStatus = "disabled"
        }

        await supabase
          .from("organizations")
          .update({
            billing_subscription_id:
              subscription.id,
            billing_customer_id:
              typeof subscription.customer === "string"
                ? subscription.customer
                : subscription.customer.id,
            subscription_status:
              stripeStatus,
            subscription_tier:
              tier || undefined,
            access_status: accessStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", organizationId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("STRIPE WEBHOOK PROCESSING ERROR:", error)

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    )
  }
}
