import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { requireSephomicAdmin } from "@/lib/admin/requireSephomicAdmin"

export type CustomerTeamMember = {
  id: string
  user_id: string | null
  full_name: string | null
  email: string
  role: string
  is_active: boolean
  phone: string | null
  job_title: string | null
  created_at: string
}

export type CustomerOrganizationDetail = {
  id: string
  name: string
  slug: string | null
  contact_email: string | null
  phone: string | null
  website: string | null
  address: string | null
  subscription_tier: string | null
  subscription_status: string | null
  trial_ends_at: string | null
  billing_customer_id: string | null
  billing_subscription_id: string | null
  access_status: string | null
  seat_limit: number | null
  max_companies: number | null
  max_clients: number | null
  max_inventory_items: number | null
  max_monthly_invoices: number | null
  advanced_reports_enabled: boolean
  ai_assist_enabled: boolean
  smart_ai_enabled: boolean
  smart_ai_plan: string | null
  smart_ai_started_at: string | null
  smart_ai_expires_at: string | null
  smart_ai_recovery_enabled: boolean
  smart_ai_recovery_mode: string | null
  smart_ai_auto_retry_enabled: boolean
  smart_ai_max_auto_retries: number | null
  smart_ai_last_health_check_at: string | null
  executive_intelligence_enabled: boolean
  executive_intelligence_plan: string | null
  executive_intelligence_started_at: string | null
  executive_intelligence_expires_at: string | null
  created_at: string
  updated_at: string
  team_members: CustomerTeamMember[]
}

export async function getCustomerOrganization(
  organizationId: string
): Promise<CustomerOrganizationDetail> {
  const { administrator } = await requireSephomicAdmin()

  if (!administrator.can_manage_customers) {
    redirect("/admin")
  }

  const supabase = await createClient()

  const {
    data: organization,
    error: organizationError,
  } = await supabase
    .from("organizations")
    .select(`
      id,
      name,
      slug,
      contact_email,
      phone,
      website,
      address,
      subscription_tier,
      subscription_status,
      trial_ends_at,
      billing_customer_id,
      billing_subscription_id,
      access_status,
      seat_limit,
      max_companies,
      max_clients,
      max_inventory_items,
      max_monthly_invoices,
      advanced_reports_enabled,
      ai_assist_enabled,
      smart_ai_enabled,
      smart_ai_plan,
      smart_ai_started_at,
      smart_ai_expires_at,
      smart_ai_recovery_enabled,
      smart_ai_recovery_mode,
      smart_ai_auto_retry_enabled,
      smart_ai_max_auto_retries,
      smart_ai_last_health_check_at,
      executive_intelligence_enabled,
      executive_intelligence_plan,
      executive_intelligence_started_at,
      executive_intelligence_expires_at,
      created_at,
      updated_at
    `)
    .eq("id", organizationId)
    .maybeSingle()

  if (organizationError) {
    throw new Error(
      `Unable to load customer account: ${organizationError.message}`
    )
  }

  if (!organization) {
    notFound()
  }

  const {
    data: teamMembers,
    error: teamMembersError,
  } = await supabase
    .from("team_members")
    .select(`
      id,
      user_id,
      full_name,
      email,
      role,
      is_active,
      phone,
      job_title,
      created_at
    `)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true })

  if (teamMembersError) {
    throw new Error(
      `Unable to load customer team members: ${teamMembersError.message}`
    )
  }

  return {
    ...organization,
    team_members: teamMembers ?? [],
  } as CustomerOrganizationDetail
}
