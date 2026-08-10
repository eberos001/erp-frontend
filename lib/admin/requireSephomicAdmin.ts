import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type SephomicAdministrator = {
  id: string
  user_id: string
  email: string
  full_name: string | null
  admin_role:
    | "platform_owner"
    | "platform_admin"
    | "billing_admin"
    | "support_admin"
    | "read_only"
  is_active: boolean
  can_manage_customers: boolean
  can_manage_billing: boolean
  can_manage_plans: boolean
  can_manage_features: boolean
  can_manage_users: boolean
  can_run_support_actions: boolean
  can_run_destructive_actions: boolean
  can_view_audit_logs: boolean
}

export async function requireSephomicAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login?next=/admin")
  }

  const { data: administrator, error: administratorError } =
    await supabase
      .from("sephomic_administrators")
      .select(
        `
          id,
          user_id,
          email,
          full_name,
          admin_role,
          is_active,
          can_manage_customers,
          can_manage_billing,
          can_manage_plans,
          can_manage_features,
          can_manage_users,
          can_run_support_actions,
          can_run_destructive_actions,
          can_view_audit_logs
        `
      )
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle()

  if (administratorError || !administrator) {
    redirect("/dashboard")
  }

  return {
    user,
    administrator:
      administrator as SephomicAdministrator,
  }
}
