import { createClient } from "@/lib/supabase/server"
import { requireSephomicAdmin } from "@/lib/admin/requireSephomicAdmin"

export type CustomerOrganization = {
  id: string
  name: string
  slug: string | null
  contact_email: string | null
  phone: string | null
  subscription_tier: string | null
  subscription_status: string | null
  trial_ends_at: string | null
  access_status: string | null
  seat_limit: number | null
  advanced_reports_enabled: boolean
  ai_assist_enabled: boolean
  smart_ai_enabled: boolean
  smart_ai_plan: string | null
  executive_intelligence_enabled: boolean
  executive_intelligence_plan: string | null
  created_at: string
  member_count: number
  active_member_count: number
}

type OrganizationRow = Omit<
  CustomerOrganization,
  "member_count" | "active_member_count"
>

type TeamMemberRow = {
  organization_id: string
  is_active: boolean
}

export async function getCustomerOrganizations(): Promise<
  CustomerOrganization[]
> {
  await requireSephomicAdmin()

  const supabase = await createClient()

  const { data: organizations, error: organizationsError } =
    await supabase
      .from("organizations")
      .select(`
        id,
        name,
        slug,
        contact_email,
        phone,
        subscription_tier,
        subscription_status,
        trial_ends_at,
        access_status,
        seat_limit,
        advanced_reports_enabled,
        ai_assist_enabled,
        smart_ai_enabled,
        smart_ai_plan,
        executive_intelligence_enabled,
        executive_intelligence_plan,
        created_at
      `)
      .order("created_at", { ascending: false })

  if (organizationsError) {
    throw new Error(
      `Unable to load customer organizations: ${organizationsError.message}`
    )
  }

  const { data: teamMembers, error: teamMembersError } =
    await supabase
      .from("team_members")
      .select("organization_id, is_active")

  if (teamMembersError) {
    throw new Error(
      `Unable to load customer member counts: ${teamMembersError.message}`
    )
  }

  const memberCounts = new Map<
    string,
    {
      total: number
      active: number
    }
  >()

  for (const member of (teamMembers ?? []) as TeamMemberRow[]) {
    const current = memberCounts.get(member.organization_id) ?? {
      total: 0,
      active: 0,
    }

    current.total += 1

    if (member.is_active) {
      current.active += 1
    }

    memberCounts.set(member.organization_id, current)
  }

  return ((organizations ?? []) as OrganizationRow[]).map(
    (organization) => {
      const counts = memberCounts.get(organization.id) ?? {
        total: 0,
        active: 0,
      }

      return {
        ...organization,
        member_count: counts.total,
        active_member_count: counts.active,
      }
    }
  )
}
