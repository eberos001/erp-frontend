import CustomerAccountEditor from "@/components/admin/CustomerAccountEditor"
import CustomerAccountOverview from "@/components/admin/CustomerAccountOverview"
import {
  getCustomerOrganization,
} from "@/lib/admin/getCustomerOrganization"

type CustomerAccountPageProps = {
  params: Promise<{
    organizationId: string
  }>
}

export default async function CustomerAccountPage({
  params,
}: CustomerAccountPageProps) {
  const { organizationId } = await params

  const organization =
    await getCustomerOrganization(organizationId)

  return (
    <div className="space-y-8">
      <CustomerAccountOverview
        organization={organization}
      />

      <CustomerAccountEditor
        organization={organization}
      />
    </div>
  )
}