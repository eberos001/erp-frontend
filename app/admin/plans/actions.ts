"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireSephomicAdmin } from "@/lib/admin/requireSephomicAdmin"

type ModuleAssignmentInput = {
  moduleId: string
  enabled: boolean
}

export async function updateOrganizationModulesAction(
  organizationId: string,
  assignments: ModuleAssignmentInput[]
) {
  const { administrator } = await requireSephomicAdmin()

  if (
    !administrator.can_manage_plans &&
    !administrator.can_manage_features
  ) {
    return {
      success: false,
      message: "You do not have permission to manage features.",
    }
  }

  if (!organizationId) {
    return {
      success: false,
      message: "Organization ID is required.",
    }
  }

  const supabase = await createClient()

  for (const assignment of assignments) {
    const { error } = await supabase
      .from("organization_modules")
      .upsert(
        {
          organization_id: organizationId,
          module_id: assignment.moduleId,
          enabled: assignment.enabled,
        },
        {
          onConflict: "organization_id,module_id",
        }
      )

    if (error) {
      console.error("MODULE ASSIGNMENT ERROR:", {
        organizationId,
        moduleId: assignment.moduleId,
        enabled: assignment.enabled,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })

      return {
        success: false,
        message: error.message,
      }
    }
  }

  revalidatePath("/admin/plans")
  revalidatePath(`/admin/customers/${organizationId}`)
  revalidatePath("/dashboard")

  return {
    success: true,
    message: "Organization module access updated successfully.",
  }
}
