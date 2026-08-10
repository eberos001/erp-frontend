"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireSephomicAdmin } from "@/lib/admin/requireSephomicAdmin"

type SupportActionResult = {
  success: boolean
  message: string
}

const allowedStatuses = [
  "open",
  "in_progress",
  "resolved",
  "closed",
]

export async function updateSupportRequestAction(
  requestId: string,
  formData: FormData
): Promise<SupportActionResult> {
  try {
    const { administrator } =
      await requireSephomicAdmin()

    if (!administrator.can_run_support_actions) {
      return {
        success: false,
        message:
          "You do not have permission to manage support requests.",
      }
    }

    const status = String(
      formData.get("status") || ""
    )

    const adminNotes = String(
      formData.get("admin_notes") || ""
    ).trim()

    if (!requestId) {
      return {
        success: false,
        message: "Support request ID is missing.",
      }
    }

    if (!allowedStatuses.includes(status)) {
      return {
        success: false,
        message: "Invalid support status.",
      }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from("support_requests")
      .update({
        status,
        admin_notes:
          adminNotes === "" ? null : adminNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (error) {
      console.error(
        "SUPPORT REQUEST UPDATE ERROR:",
        {
          requestId,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        }
      )

      return {
        success: false,
        message: error.message,
      }
    }

    revalidatePath("/admin/support")
    revalidatePath("/support")

    return {
      success: true,
      message:
        "Support request updated successfully.",
    }
  } catch (error) {
    console.error(
      "SUPPORT REQUEST ACTION ERROR:",
      error
    )

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update the support request.",
    }
  }
}
