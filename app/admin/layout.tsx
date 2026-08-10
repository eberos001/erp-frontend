import type { ReactNode } from "react"
import AdminShell from "@/components/admin/AdminShell"
import {
  requireSephomicAdmin,
} from "@/lib/admin/requireSephomicAdmin"

type AdminLayoutProps = {
  children: ReactNode
}

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const { administrator } =
    await requireSephomicAdmin()

  return (
    <AdminShell administrator={administrator}>
      {children}
    </AdminShell>
  )
}
