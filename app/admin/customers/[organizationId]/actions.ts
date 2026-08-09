"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

type UpdateCustomerAccountResult = {
  success: boolean
  message: string
}

export async function updateCustomerAccountAction(
  organizationId: string,
  formData: FormData
): Promise<UpdateCustomerAccountResult> {
  try {
    const supabase = await createClient()

    const name = String(formData.get("name") || "").trim()
    const subscriptionStatus = String(
      formData.get("subscription_status") || ""
    )
    const subscriptionTier = String(
      formData.get("subscription_tier") || ""
    )
    const accessStatus = String(
      formData.get("access_status") || ""
    )

    const seatLimitValue = Number(
  formData.get("seat_limit")
)

    if (!organizationId) {
      return {
        success: false,
        message: "Organization ID is missing.",
      }
    }

    if (!name) {
      return {
        success: false,
        message: "Customer name is required.",
      }
    }

    if (
      !Number.isInteger(seatLimitValue) ||
seatLimitValue < 1
    ) {
      return {
        success: false,
        message: "Maximum users must be at least 1.",
      }
    }

    const updates = {
      name,
      subscription_status: subscriptionStatus,
      subscription_tier: subscriptionTier,
      access_status: accessStatus,
      seat_limit: seatLimitValue,
      smart_ai_enabled:
        formData.get("smart_ai_enabled") === "on",
      executive_intelligence_enabled:
        formData.get(
          "executive_intelligence_enabled"
        ) === "on",
    }

    const { error } = await supabase.rpc(
  "sephomic_update_customer_account",
  {
    p_organization_id: organizationId,
    p_changes: updates,
  }
)

    if (error) {
      console.error(
        "CUSTOMER ACCOUNT UPDATE ERROR:",
        {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        }
      )

      return {
        success: false,
        message:
          error.message ||
          "Unable to update the customer account.",
      }
    }

    revalidatePath(
      `/admin/customers/${organizationId}`
    )
    revalidatePath("/admin/customers")
    revalidatePath("/admin")

    return {
      success: true,
      message:
        "Customer account updated successfully.",
    }
  } catch (error) {
    console.error(
      "CUSTOMER ACCOUNT ACTION ERROR:",
      error
    )

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    }
  }
}