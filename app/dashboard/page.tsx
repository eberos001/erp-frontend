'use client'

import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ExecutiveIntelligencePanel from "./executive-intelligence/ExecutiveIntelligencePanel"

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000"

type Task = {
  id: string
  title: string
  status: string
  priority: string
  organization_id: string
  assigned_to: string | null
  due_date: string | null
  client_id: string | null
company_id?: string | null
}

type Client = {
  id: string
  name: string
  company_id?: string | null
  status?: string | null
}

type Company = {
  id: string
  name: string
}
type Supplier = {
  id: string
  organization_id: string
  company_id: string | null
  supplier_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  status: string
  notes: string | null
}
type PurchaseOrder = {
  id: string
  organization_id: string
  supplier_id: string | null
  company_id: string | null
  po_number: string
  status: string
  order_date: string | null
  expected_date: string | null
  total_amount: number | null
  notes: string | null
}
type SalesOrder = {
  id: string
  organization_id: string
  client_id: string | null
  company_id: string | null
  order_number: string
  status: string
  order_date: string | null
  expected_ship_date: string | null
  total_amount: number | null
  notes: string | null
  is_archived?: boolean | null
  created_at: string
  updated_at: string
}
type SalesOrderItem = {
  id: string
  organization_id: string
  sales_order_id: string
  inventory_item_id: string | null
  item_name: string
  quantity: number
  unit_price: number | null
  line_total: number | null
  fulfilled_quantity: number | null
  created_at: string
  updated_at: string
}
type PurchaseOrderItem = {
  id: string
  organization_id: string
  purchase_order_id: string
  inventory_item_id: string | null
  item_name: string
  quantity: number
  unit_cost: number | null
  line_total: number | null
  received_quantity: number | null
  created_at: string
  updated_at: string
}
type VendorBill = {
  id: string
  supplier_id: string | null
  purchase_order_id: string | null
  amount: number
  status: string
  due_date: string | null
  notes: string | null
  created_at: string
}
type VendorPayment = {
  id: string
  organization_id: string
  vendor_bill_id: string
  supplier_id: string | null
  amount: number | null
  payment_date: string | null
  payment_method: string | null
  notes: string | null
  created_at: string
}
type CustomerInvoice = {
  id: string
  organization_id: string
  sales_order_id: string | null
  client_id: string | null
  invoice_number: string
  amount: number
  status: string
  due_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

type CustomerInvoicePayment = {
  id: string
  organization_id: string
  customer_invoice_id: string
  amount: number
  payment_date: string | null
  payment_method: string | null
  notes: string | null
  created_at: string
}

type InventoryItem = {
  id: string
  organization_id: string
  company_id: string | null
  sku: string
  item_name: string
  description: string | null
  category: string | null
  unit: string | null
  quantity_on_hand: number
  reorder_level: number
  unit_cost: number
  status: string
}

type InventoryMovement = {
  id: string
  organization_id: string
  inventory_item_id: string
  purchase_order_id: string | null
  movement_type: string
  quantity: number
  unit_cost: number | null
  notes: string | null
  created_at: string
}

type Notification = {
  id: string
  organization_id: string
  title: string
  message: string
  type: string
  related_module: string | null
  related_id: string | null
  is_read: boolean
  created_at: string
}
type TeamMember = {
  organization_id: string
  id: string
  full_name: string
  email: string
  role?: string | null
  avatar_url?: string | null
  phone?: string | null
  job_title?: string | null
  is_active: boolean
}

type UserInvitation = {
  id: string
  organization_id: string
  email: string
  role: string
  status: string
  token: string | null
  token_used_at: string | null
  invited_by: string | null
  accepted_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

type OrganizationInvitation = {
  id: string
  organization_id: string
  email: string
  role: string
  status: string
  invited_by: string | null
  accepted_by: string | null
  accepted_at: string | null
  expires_at: string | null
  revoked_at: string | null
  created_at: string
  updated_at: string | null
}

type AiIncident = {
  id: string
  organization_id: string
  incident_code: string
  module: string
  source: string
  severity: "low" | "medium" | "high" | "critical"
  status: "open" | "investigating" | "resolved" | "ignored"
  title: string
  user_message: string | null
  technical_message: string | null
  context: Record<string, unknown>
  fingerprint: string | null
  occurrence_count: number
  first_seen_at: string
  last_seen_at: string
  resolved_at: string | null
  created_at: string
  updated_at: string
}
type AiRecommendation = {
  id: string
  organization_id: string
  incident_id: string
  recommendation_type: string
  summary: string
  rationale: string | null
  risk_level: "low" | "medium" | "high"
  requires_approval: boolean
  proposed_action: Record<string, unknown>
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "applied"
    | "failed"
approved_by: string | null
approved_at: string | null
applied_at: string | null
execution_started_at: string | null
execution_started_by: string | null
execution_token: string | null
created_at: string
updated_at: string
}

type AiActionLog = {
  id: string
  organization_id: string
  incident_id: string | null
  recommendation_id: string | null
  action_type: string
  result: "success" | "failed" | "cancelled"
  before_state: Record<string, unknown>
  after_state: Record<string, unknown>
  error_message: string | null
  performed_by: string | null
  created_at: string
}

type AuditLog = {
  id: string
  organization_id: string
  user_email: string | null
  user_role: string | null
  action: string
  module: string
  record_id: string | null
  record_type: string | null
  details: Record<string, any> | null
  created_at: string
}
export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [auditModuleFilter, setAuditModuleFilter] = useState("all")
  const [auditActionFilter, setAuditActionFilter] = useState("all")
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [salesOrderItems, setSalesOrderItems] = useState<SalesOrderItem[]>([])
  const [purchaseOrderItems, setPurchaseOrderItems] = useState<PurchaseOrderItem[]>([])
  const [lineItemPoId, setLineItemPoId] = useState("")
  const [lineItemInventoryItemId, setLineItemInventoryItemId] = useState("")
  const [lineItemName, setLineItemName] = useState("")
  const [lineItemQuantity, setLineItemQuantity] = useState(1)
  const [lineItemUnitCost, setLineItemUnitCost] = useState(0)
  const [vendorBills, setVendorBills] = useState<any[]>([])
  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>([])
  const [customerInvoices, setCustomerInvoices] = useState<CustomerInvoice[]>([])
  const [customerInvoicePayments, setCustomerInvoicePayments] = useState<CustomerInvoicePayment[]>([])
  const [newVendorPaymentBillId, setNewVendorPaymentBillId] = useState("")
  const [newVendorPaymentAmount, setNewVendorPaymentAmount] = useState("")
  const [newVendorPaymentDate, setNewVendorPaymentDate] = useState("")
  const [newVendorPaymentMethod, setNewVendorPaymentMethod] = useState("manual")
  const [newVendorPaymentNotes, setNewVendorPaymentNotes] = useState("")
  const [newCustomerInvoiceSalesOrderId, setNewCustomerInvoiceSalesOrderId] = useState("")
  const [newCustomerInvoiceNumber, setNewCustomerInvoiceNumber] = useState("")
  const [newCustomerInvoiceDueDate, setNewCustomerInvoiceDueDate] = useState("")
  const [newCustomerInvoiceNotes, setNewCustomerInvoiceNotes] = useState("")
  const [newCustomerPaymentInvoiceId, setNewCustomerPaymentInvoiceId] = useState("")
  const [newCustomerPaymentAmount, setNewCustomerPaymentAmount] = useState("")
  const [newCustomerPaymentDate, setNewCustomerPaymentDate] = useState("")
  const [newCustomerPaymentMethod, setNewCustomerPaymentMethod] = useState("manual")
  const [newCustomerPaymentNotes, setNewCustomerPaymentNotes] = useState("")
  const [newVendorBillSupplierId, setNewVendorBillSupplierId] = useState("")
  const [newVendorBillPurchaseOrderId, setNewVendorBillPurchaseOrderId] = useState("")
  const [newVendorBillAmount, setNewVendorBillAmount] = useState("")
  const [newVendorBillStatus, setNewVendorBillStatus] = useState("unpaid")
  const [newVendorBillDueDate, setNewVendorBillDueDate] = useState("")
  const [newVendorBillNotes, setNewVendorBillNotes] = useState("")
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [enabledModules, setEnabledModules] = useState<string[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [userInvitations, setUserInvitations] = useState<UserInvitation[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")
  const [loading, setLoading] = useState(true)
  const [creatingTask, setCreatingTask] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState("")
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileJobTitle, setProfileJobTitle] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)
  const [organizationName, setOrganizationName] = useState("")
  const [organizationEmail, setOrganizationEmail] = useState("")
  const [organizationPhone, setOrganizationPhone] = useState("")
  const [organizationWebsite, setOrganizationWebsite] = useState("")
  const [subscriptionTier, setSubscriptionTier] = useState("starter")
  const [subscriptionStatus, setSubscriptionStatus] = useState("active")
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)
  const [accessStatus, setAccessStatus] = useState("active")
  const [seatLimit, setSeatLimit] = useState(100)
  const [maxCompanies, setMaxCompanies] = useState(5)
  const [maxClients, setMaxClients] = useState(25)
  const [maxInventoryItems, setMaxInventoryItems] = useState(50)
  const [maxMonthlyInvoices, setMaxMonthlyInvoices] = useState(25)
  const [advancedReportsEnabled, setAdvancedReportsEnabled] = useState(false)
  const [aiAssistEnabled, setAiAssistEnabled] = useState(false)
  const [smartAiEnabled, setSmartAiEnabled] = useState(false)
  const [
  executiveIntelligenceEnabled,
  setExecutiveIntelligenceEnabled,
] = useState(false)

const [
  executiveIntelligencePlan,
  setExecutiveIntelligencePlan,
] = useState("none")

const [
  executiveIntelligenceStartedAt,
  setExecutiveIntelligenceStartedAt,
] = useState<string | null>(null)

const [
  executiveIntelligenceExpiresAt,
  setExecutiveIntelligenceExpiresAt,
] = useState<string | null>(null)

  const [smartAiPlan, setSmartAiPlan] = useState("none")

  const [smartAiStartedAt, setSmartAiStartedAt] =
  useState<string | null>(null)

  const [smartAiExpiresAt, setSmartAiExpiresAt] =
  useState<string | null>(null)
  const [smartAiRecoveryEnabled, setSmartAiRecoveryEnabled] =
  useState(false)

  const [smartAiRecoveryMode, setSmartAiRecoveryMode] =
  useState("off")

  const [smartAiAutoRetryEnabled, setSmartAiAutoRetryEnabled] =
  useState(false)

  const [smartAiMaxAutoRetries, setSmartAiMaxAutoRetries] =
  useState(1)

  const [smartAiLastHealthCheckAt, setSmartAiLastHealthCheckAt] =
  useState<string | null>(null)
  const [aiIncidents, setAiIncidents] =
  useState<AiIncident[]>([])
  const [aiRecommendations, setAiRecommendations] =
  useState<AiRecommendation[]>([])

  const [aiRecommendationLoading, setAiRecommendationLoading] =
  useState(false)

  const [aiRecommendationMessage, setAiRecommendationMessage] =
  useState("")
  const [aiActionLogs, setAiActionLogs] =
  useState<AiActionLog[]>([])

  const [aiActionLogLoading, setAiActionLogLoading] =
  useState(false)

  const [aiActionLogMessage, setAiActionLogMessage] =
  useState("")

  const [aiIncidentLoading, setAiIncidentLoading] =
  useState(false)

  const [aiIncidentMessage, setAiIncidentMessage] =
  useState("")
  const [organizationAddress, setOrganizationAddress] = useState("")

const [newTaskTitle, setNewTaskTitle] = useState('')
const [newTaskStatus, setNewTaskStatus] = useState('pending')
const [newTaskPriority, setNewTaskPriority] = useState('medium')
const [newTaskDueDate, setNewTaskDueDate] = useState('')
const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('')
const [newTaskClientId, setNewTaskClientId] = useState('')
const [newTaskCompanyId, setNewTaskCompanyId] = useState('')
const [newClientName, setNewClientName] = useState('')
const [newCompanyName, setNewCompanyName] = useState('')

const [newSupplierName, setNewSupplierName] = useState('')
const [newSupplierContact, setNewSupplierContact] = useState('')
const [newSupplierEmail, setNewSupplierEmail] = useState('')
const [newSupplierPhone, setNewSupplierPhone] = useState('')
const [newSupplierCompanyId, setNewSupplierCompanyId] = useState('')
const [newPoNumber, setNewPoNumber] = useState('')
const [newPoSupplierId, setNewPoSupplierId] = useState('')
const [newPoCompanyId, setNewPoCompanyId] = useState('')
const [newPoExpectedDate, setNewPoExpectedDate] = useState('')
const [newPoTotalAmount, setNewPoTotalAmount] = useState('')
const [newPoNotes, setNewPoNotes] = useState('')
const [newSalesOrderNumber, setNewSalesOrderNumber] = useState("")
const [newSalesOrderClientId, setNewSalesOrderClientId] = useState("")
const [newSalesOrderCompanyId, setNewSalesOrderCompanyId] = useState("")
const [newSalesOrderExpectedShipDate, setNewSalesOrderExpectedShipDate] = useState("")
const [newSalesOrderTotalAmount, setNewSalesOrderTotalAmount] = useState("")
const [newSalesOrderNotes, setNewSalesOrderNotes] = useState("")
const [salesLineOrderId, setSalesLineOrderId] = useState("")
const [salesLineInventoryItemId, setSalesLineInventoryItemId] = useState("")
const [salesLineItemName, setSalesLineItemName] = useState("")
const [salesLineQuantity, setSalesLineQuantity] = useState(1)
const [salesLineUnitPrice, setSalesLineUnitPrice] = useState(0)
const [purchaseOrderSearch, setPurchaseOrderSearch] = useState("")
const [purchaseOrderStatusFilter, setPurchaseOrderStatusFilter] = useState("all")
const [salesOrderSearch, setSalesOrderSearch] = useState("")
const [salesOrderStatusFilter, setSalesOrderStatusFilter] = useState("all")
const [newInventorySku, setNewInventorySku] = useState('')
const [inventorySearch, setInventorySearch] = useState("")
const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState("all")
const [showLowStockOnly, setShowLowStockOnly] = useState(false)
const [newInventoryName, setNewInventoryName] = useState('')
const [newInventoryCategory, setNewInventoryCategory] = useState('')
const [newInventoryQuantity, setNewInventoryQuantity] = useState('')
const [newInventoryReorderLevel, setNewInventoryReorderLevel] = useState('')
const [newInventoryUnitCost, setNewInventoryUnitCost] = useState('')
const [inventoryUploadRows, setInventoryUploadRows] = useState<any[]>([])
const [inventoryUploadErrors, setInventoryUploadErrors] = useState<string[]>([])
const [movementSearch, setMovementSearch] = useState("")
const [movementTypeFilter, setMovementTypeFilter] = useState("all")
const [uploadingInventory, setUploadingInventory] = useState(false)
const [inventoryUploadSuccess, setInventoryUploadSuccess] = useState('')
const [selectedInventoryFileName, setSelectedInventoryFileName] = useState("")
const [lastInventoryImportTime, setLastInventoryImportTime] = useState("")
const [updateExistingInventory, setUpdateExistingInventory] = useState(false)
const [movementItemId, setMovementItemId] = useState('')
const [movementType, setMovementType] = useState('adjustment')
const [movementQuantity, setMovementQuantity] = useState<number>(0)
const [movementNotes, setMovementNotes] = useState('')
const [receivePoId, setReceivePoId] = useState("")
const [receiveInventoryItemId, setReceiveInventoryItemId] = useState("")
const [receiveQuantity, setReceiveQuantity] = useState("")
const [receivePurchaseOrderItemId, setReceivePurchaseOrderItemId] = useState("")
const [receiveNotes, setReceiveNotes] = useState("")
const [receiveSuccess, setReceiveSuccess] = useState("")
const [activeModule, setActiveModule] = useState('Dashboard')

const [statusFilter, setStatusFilter] = useState('all')
const [priorityFilter, setPriorityFilter] = useState('all')
const [assigneeFilter, setAssigneeFilter] = useState('all')
const [taskViewFilter, setTaskViewFilter] = useState('all')
const [taskSearch, setTaskSearch] = useState('')

function hasModule(moduleKey: string) {
  return enabledModules.includes(moduleKey)
}
const enabledModuleCount = enabledModules.length

async function reportAiIncident({
  incidentCode,
  module,
  source,
  severity = "medium",
  title,
  userMessage,
  technicalMessage,
  context = {},
}: {
  incidentCode: string
  module: string
  source: string
  severity?: "low" | "medium" | "high" | "critical"
  title: string
  userMessage?: string
  technicalMessage?: string
  context?: Record<string, unknown>
}) {

  const smartAiPlanAllowsAccess =
  smartAiPlan === "assist" ||
  smartAiPlan === "advanced" ||
  smartAiPlan === "enterprise"

const smartAiAccessNotExpired =
  !smartAiExpiresAt ||
  new Date(smartAiExpiresAt).getTime() > Date.now()

const smartAiAccessIsAvailable =
  smartAiEnabled &&
  smartAiPlanAllowsAccess &&
  smartAiAccessNotExpired

if (!smartAiAccessIsAvailable) return

 const orgId =
  organizationId ||
  localStorage.getItem("erp_org_id")

if (!orgId) return

const incidentRecordIdentifier =
  context.customer_invoice_id ||
  context.vendor_bill_id ||
  context.sales_order_item_id ||
  context.purchase_order_item_id ||
  context.sales_order_id ||
  context.purchase_order_id ||
  context.inventory_item_id ||
  context.existing_client_id ||
  context.client_id ||
  "general"

const incidentFingerprint =
  `${module}:${source}:${incidentCode}:${String(
    incidentRecordIdentifier
  )}`

const {
  data: existingIncident,
  error: existingIncidentError,
} = await supabase
  .from("ai_incidents")
  .select("id, occurrence_count")
  .eq("organization_id", orgId)
  .eq("fingerprint", incidentFingerprint)
  .maybeSingle()

  if (existingIncidentError) {
    console.error(
      "AI INCIDENT LOOKUP ERROR:",
      existingIncidentError
    )
    return
  }
if (existingIncident) {
  const { error: updateIncidentError } =
    await supabase
      .from("ai_incidents")
      .update({
        severity,
        status: "open",
        title,
        user_message: userMessage || null,
        technical_message:
          technicalMessage || null,
        context,
        occurrence_count:
          Number(
            existingIncident.occurrence_count || 0
          ) + 1,
        last_seen_at:
          new Date().toISOString(),
        resolved_at: null,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", existingIncident.id)

  if (updateIncidentError) {
    console.error(
      "AI INCIDENT UPDATE ERROR:",
      updateIncidentError
    )
    return
  }

  await createSafeAiRecommendationForIncident({
    incidentId: existingIncident.id,
    incidentCode,
    module,
  })

  return
}
  
   const {
  data: insertedIncident,
  error: insertIncidentError,
} = await supabase
  .from("ai_incidents")
  .insert({
    organization_id: orgId,
    incident_code: incidentCode,
    module,
    source,
    severity,
    status: "open",
    title,
    user_message: userMessage || null,
    technical_message:
      technicalMessage || null,
    context,
    fingerprint:
    incidentFingerprint,
    occurrence_count: 1,
    first_seen_at:
      new Date().toISOString(),
    last_seen_at:
      new Date().toISOString(),
  })
  .select("id")
  .single()

if (
  insertIncidentError ||
  !insertedIncident
) {
  console.error(
    "AI INCIDENT INSERT ERROR:",
    insertIncidentError
  )
  return
}

await createSafeAiRecommendationForIncident({
  incidentId: insertedIncident.id,
  incidentCode,
  module,
})
}

async function createSafeAiRecommendationForIncident({
  incidentId,
  incidentCode,
  module,
}: {
  incidentId: string
  incidentCode: string
  module: string
}) {
  if (!canUseSmartAi) return

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) return

  type RecommendationDefinition = {
    recommendationType: string
    summary: string
    rationale: string
    riskLevel: "low" | "medium" | "high"
    requiresApproval: boolean
    actionType: string
  }

  const recommendationMap: Record<
    string,
    RecommendationDefinition
  > = {
    DASHBOARD_STALE_DATA: {
      recommendationType: "safe_refresh",
      summary: "Refresh ERP data",
      rationale:
        `Reload current ${module} data to clear potentially stale frontend state without changing business records.`,
      riskLevel: "low",
      requiresApproval: true,
      actionType: "refresh_erp_data",
    },

    DATA_REFRESH_RECOMMENDED: {
      recommendationType: "safe_refresh",
      summary: "Refresh ERP data",
      rationale:
        `Reload current ${module} data to restore the latest available business state.`,
      riskLevel: "low",
      requiresApproval: true,
      actionType: "refresh_erp_data",
    },

    VENDOR_PAYMENT_OVERPAYMENT_BLOCKED: {
      recommendationType: "review_vendor_payment",
      summary: "Review blocked vendor payment",
      rationale:
        "The attempted vendor payment exceeded the remaining bill balance. Confirm the bill, payment amount, and prior payments before retrying.",
      riskLevel: "high",
      requiresApproval: true,
      actionType: "review_vendor_payment",
    },

    CUSTOMER_PAYMENT_OVERPAYMENT_BLOCKED: {
      recommendationType: "review_customer_payment",
      summary: "Review blocked customer payment",
      rationale:
        "The attempted customer payment exceeded the invoice balance. Confirm the invoice, payment amount, and prior payment history before retrying.",
      riskLevel: "high",
      requiresApproval: true,
      actionType: "review_customer_payment",
    },

    DUPLICATE_VENDOR_PAYMENT_RISK: {
      recommendationType: "investigate_duplicate_payment",
      summary: "Investigate possible duplicate vendor payment",
      rationale:
        "A vendor payment may duplicate an existing payment. Review amount, date, method, supplier, and bill history before proceeding.",
      riskLevel: "high",
      requiresApproval: true,
      actionType: "review_duplicate_vendor_payment",
    },

    NEGATIVE_INVENTORY_RISK: {
      recommendationType: "protect_inventory_balance",
      summary: "Prevent negative inventory",
      rationale:
        "The requested operation could reduce inventory below zero. Review available stock, pending receipts, allocations, and transaction quantity.",
      riskLevel: "high",
      requiresApproval: true,
      actionType: "review_inventory_shortage",
    },

    SALES_FULFILLMENT_STOCK_SHORTAGE: {
      recommendationType: "review_fulfillment_shortage",
      summary: "Review sales fulfillment shortage",
      rationale:
        "The sales order cannot be fulfilled with current stock. Review inventory availability, incoming purchase orders, substitutions, or partial fulfillment.",
      riskLevel: "high",
      requiresApproval: true,
      actionType: "review_sales_fulfillment",
    },

    PURCHASE_ORDER_OVER_RECEIPT_BLOCKED: {
      recommendationType: "review_over_receipt",
      summary: "Review blocked purchase-order over-receipt",
      rationale:
        "The receiving quantity exceeded the remaining purchase-order quantity. Confirm supplier shipment quantities and the purchase-order line before retrying.",
      riskLevel: "high",
      requiresApproval: true,
      actionType: "review_purchase_order_receipt",
    },

    FINANCIAL_WRITE_FAILURE: {
      recommendationType: "investigate_financial_failure",
      summary: "Investigate failed financial transaction",
      rationale:
        "A financial record could not be completed successfully. Review the affected transaction and related records before attempting another write.",
      riskLevel: "high",
      requiresApproval: true,
      actionType: "review_financial_failure",
    },

    CLIENT_DUPLICATE_DETECTED: {
      recommendationType: "review_client_match",
      summary: "Review existing client match",
      rationale:
        "A matching client record was found within the duplicate-prevention window. Confirm that the existing record is the correct customer before continuing.",
      riskLevel: "medium",
      requiresApproval: true,
      actionType: "review_client_match",
    },

    OVERDUE_RECEIVABLE_RISK: {
      recommendationType: "review_overdue_receivable",
      summary: "Review overdue customer receivable",
      rationale:
        "A customer invoice is overdue and may create cash-flow or customer-retention risk. Review collection status, communications, and payment arrangements.",
      riskLevel: "medium",
      requiresApproval: true,
      actionType: "review_overdue_receivable",
    },

    ORDER_INVOICE_TOTAL_MISMATCH: {
      recommendationType: "review_total_mismatch",
      summary: "Review order and invoice total mismatch",
      rationale:
        "The customer invoice amount does not match the related sales-order value. Confirm discounts, taxes, adjustments, and line-item totals before proceeding.",
      riskLevel: "high",
      requiresApproval: true,
      actionType: "review_order_invoice_mismatch",
    },
  }

  const recommendationDefinition =
    recommendationMap[incidentCode]

  if (!recommendationDefinition) {
    return
  }

  const {
    data: existingRecommendation,
    error: lookupError,
  } = await supabase
    .from("ai_recommendations")
    .select("id, status")
    .eq("organization_id", orgId)
    .eq("incident_id", incidentId)
    .eq(
      "recommendation_type",
      recommendationDefinition.recommendationType
    )
    .in("status", ["pending", "approved"])
    .maybeSingle()

  if (lookupError) {
    console.error(
      "AI RECOMMENDATION LOOKUP ERROR:",
      lookupError
    )
    return
  }

  if (existingRecommendation) {
    return
  }

  const { error: insertError } = await supabase
    .from("ai_recommendations")
    .insert({
      organization_id: orgId,
      incident_id: incidentId,
      recommendation_type:
        recommendationDefinition.recommendationType,
      summary:
        recommendationDefinition.summary,
      rationale:
        recommendationDefinition.rationale,
      risk_level:
        recommendationDefinition.riskLevel,
      requires_approval:
        recommendationDefinition.requiresApproval,
      proposed_action: {
        action_type:
          recommendationDefinition.actionType,
        module,
        incident_code: incidentCode,
      },
      status: "pending",
    })

  if (insertError) {
    console.error(
      "AI RECOMMENDATION INSERT ERROR:",
      insertError
    )
    return
  }

  await loadAiRecommendations()
}
async function reportFinancialWriteFailure({
  source,
  title,
  technicalMessage,
  context = {},
}: {
  source: string
  title: string
  technicalMessage: string
  context?: Record<string, unknown>
}) {
  await reportAiIncident({
    incidentCode:
      "FINANCIAL_WRITE_FAILURE",
    module: "finance",
    source,
    severity: "high",
    title,
    userMessage:
      "A financial transaction could not be completed. Review the affected records before retrying.",
    technicalMessage,
    context,
  })
}
async function runSmartAiRiskScan() {
  if (
  !requireSmartAiPermission(
    "run the Smart AI risk scan"
  )
) {
  setAiIncidentMessage(
    "Smart AI Assist is not available for this organization."
  )
  return
}

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setAiIncidentMessage(
      "No organization is available for the Smart AI risk scan."
    )
    return
  }

  setAiIncidentLoading(true)
  setAiIncidentMessage(
    "Scanning financial, inventory, and fulfillment records..."
  )

  const [
    invoicesResult,
    invoicePaymentsResult,
    inventoryResult,
    salesItemsResult,
  ] = await Promise.all([
    supabase
      .from("customer_invoices")
      .select("*")
      .eq("organization_id", orgId),

    supabase
      .from("customer_invoice_payments")
      .select("*")
      .eq("organization_id", orgId),

    supabase
      .from("inventory_items")
      .select(
        "id, organization_id, sku, item_name, quantity_on_hand, reorder_level, unit_cost, status"
      )
      .eq("organization_id", orgId),

    supabase
      .from("sales_order_items")
      .select("*")
      .eq("organization_id", orgId),
  ])

  const scanError =
    invoicesResult.error ||
    invoicePaymentsResult.error ||
    inventoryResult.error ||
    salesItemsResult.error

  if (scanError) {
    console.error(
      "SMART AI RISK SCAN ERROR:",
      scanError
    )

    setAiIncidentMessage(
      "The Smart AI risk scan could not be completed."
    )
    setAiIncidentLoading(false)
    return
  }

  const scannedInvoices =
    (invoicesResult.data || []) as CustomerInvoice[]

  const scannedInvoicePayments =
    (invoicePaymentsResult.data || []) as CustomerInvoicePayment[]

  const scannedInventoryItems =
    (inventoryResult.data || []) as InventoryItem[]

  const scannedSalesOrderItems =
    (salesItemsResult.data || []) as SalesOrderItem[]

  let detectedRiskCount = 0

  for (const invoice of scannedInvoices) {
    const paidAmount =
      scannedInvoicePayments
        .filter(
          (payment) =>
            payment.customer_invoice_id === invoice.id
        )
        .reduce(
          (sum, payment) =>
            sum + Number(payment.amount || 0),
          0
        )

    const remainingBalance =
      Math.max(
        Number(invoice.amount || 0) - paidAmount,
        0
      )

    const dueDate =
      invoice.due_date
        ? new Date(invoice.due_date)
        : null

    const isOverdue =
      dueDate !== null &&
      dueDate.getTime() < Date.now() &&
      remainingBalance > 0

    if (isOverdue) {
      detectedRiskCount += 1

      await reportAiIncident({
        incidentCode:
          "OVERDUE_RECEIVABLE_RISK",
        module: "finance",
        source: "smart_ai_risk_scan",
        severity: "medium",
        title: "Overdue customer receivable",
        userMessage:
          "A customer invoice is overdue and still has an outstanding balance.",
        technicalMessage:
          `Invoice ${invoice.invoice_number} is overdue with a remaining balance of ${remainingBalance}.`,
        context: {
          customer_invoice_id:
            invoice.id,
          invoice_number:
            invoice.invoice_number,
          client_id:
            invoice.client_id,
          invoice_amount:
            Number(invoice.amount || 0),
          paid_amount:
            paidAmount,
          remaining_balance:
            remainingBalance,
          due_date:
            invoice.due_date,
          detection_source:
            "proactive_scan",
        },
      })
    }
  }

  for (const inventoryItem of scannedInventoryItems) {
    const quantityOnHand =
      Number(inventoryItem.quantity_on_hand || 0)

    if (quantityOnHand < 0) {
      detectedRiskCount += 1

      await reportAiIncident({
        incidentCode:
          "NEGATIVE_INVENTORY_RISK",
        module: "inventory",
        source: "smart_ai_risk_scan",
        severity: "critical",
        title: "Negative inventory detected",
        userMessage:
          "An inventory item has a quantity below zero and may indicate an incorrect transaction or fulfillment issue.",
        technicalMessage:
          `Inventory item ${inventoryItem.item_name} has quantity_on_hand ${quantityOnHand}.`,
        context: {
          inventory_item_id:
            inventoryItem.id,
          sku:
            inventoryItem.sku,
          item_name:
            inventoryItem.item_name,
          quantity_on_hand:
            quantityOnHand,
          reorder_level:
            Number(
              inventoryItem.reorder_level || 0
            ),
          unit_cost:
            Number(inventoryItem.unit_cost || 0),
          estimated_inventory_exposure:
            Math.abs(quantityOnHand) *
            Number(inventoryItem.unit_cost || 0),
          detection_source:
            "proactive_scan",
        },
      })
    }
  }

  for (const salesItem of scannedSalesOrderItems) {
    if (!salesItem.inventory_item_id) {
      continue
    }

    const inventoryItem =
      scannedInventoryItems.find(
        (item) =>
          item.id === salesItem.inventory_item_id
      )

    if (!inventoryItem) {
      continue
    }

    const orderedQuantity =
      Number(salesItem.quantity || 0)

    const fulfilledQuantity =
      Number(salesItem.fulfilled_quantity || 0)

    const remainingQuantity =
      Math.max(
        orderedQuantity - fulfilledQuantity,
        0
      )

    const availableStock =
      Number(inventoryItem.quantity_on_hand || 0)

    const hasFulfillmentShortage =
      remainingQuantity > 0 &&
      remainingQuantity > availableStock

    if (hasFulfillmentShortage) {
      detectedRiskCount += 1

      await reportAiIncident({
        incidentCode:
          "SALES_FULFILLMENT_STOCK_SHORTAGE",
        module: "sales",
        source: "smart_ai_risk_scan",
        severity: "high",
        title: "Sales fulfillment stock shortage",
        userMessage:
          "An open sales-order item requires more inventory than is currently available.",
        technicalMessage:
          `Remaining fulfillment quantity ${remainingQuantity} exceeds available stock ${availableStock}.`,
        context: {
          sales_order_id:
            salesItem.sales_order_id,
          sales_order_item_id:
            salesItem.id,
          inventory_item_id:
            salesItem.inventory_item_id,
          item_name:
            salesItem.item_name,
          ordered_quantity:
            orderedQuantity,
          fulfilled_quantity:
            fulfilledQuantity,
          remaining_quantity:
            remainingQuantity,
          available_stock:
            availableStock,
          shortage_quantity:
            remainingQuantity - availableStock,
          detection_source:
            "proactive_scan",
        },
      })
    }
  }

  const completedAt =
    new Date().toISOString()

  const { error: healthCheckUpdateError } =
    await supabase
      .from("organizations")
      .update({
        smart_ai_last_health_check_at:
          completedAt,
      })
      .eq("id", orgId)

  if (healthCheckUpdateError) {
    console.error(
      "SMART AI HEALTH CHECK UPDATE ERROR:",
      healthCheckUpdateError
    )
  } else {
    setSmartAiLastHealthCheckAt(completedAt)
  }

  await loadAiIncidents()
  await loadAiRecommendations()

  setAiIncidentMessage(
    detectedRiskCount === 0
      ? "Smart AI scan completed. No new financial, inventory, or fulfillment risks were detected."
      : `Smart AI scan completed. ${detectedRiskCount} risk${
          detectedRiskCount === 1 ? "" : "s"
        } detected or refreshed.`
  )

  setAiIncidentLoading(false)
}

async function loadAiIncidents() {
  if (!canUseSmartAi) {
    setAiIncidents([])
    setAiIncidentMessage("")
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setAiIncidents([])
    setAiIncidentMessage(
      "No organization is available for Smart AI Assist."
    )
    return
  }

  setAiIncidentLoading(true)
  setAiIncidentMessage("")

  const { data, error } = await supabase
    .from("ai_incidents")
    .select("*")
    .eq("organization_id", orgId)
    .order("last_seen_at", { ascending: false })

  if (error) {
    console.error(
      "AI INCIDENTS LOAD ERROR:",
      error
    )

    setAiIncidents([])
    setAiIncidentMessage(
      "Smart AI incidents could not be loaded."
    )
    setAiIncidentLoading(false)
    return
  }

  setAiIncidents(
    (data || []) as AiIncident[]
  )

  setAiIncidentLoading(false)
}

async function loadAiRecommendations() {
  if (!canUseSmartAi) {
    setAiRecommendations([])
    setAiRecommendationMessage("")
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setAiRecommendations([])
    setAiRecommendationMessage(
      "No organization is available for Smart AI recommendations."
    )
    return
  }

  setAiRecommendationLoading(true)
  setAiRecommendationMessage("")

  const { data, error } = await supabase
  .from("ai_recommendations")
  .select("*")
  .eq("organization_id", orgId)
  .order("created_at", { ascending: false })

  if (error) {
    console.error(
      "AI RECOMMENDATIONS LOAD ERROR:",
      error
    )

    setAiRecommendations([])
    setAiRecommendationMessage(
      "Smart AI recommendations could not be loaded."
    )
    setAiRecommendationLoading(false)
    return
  }

  setAiRecommendations(
    (data || []) as AiRecommendation[]
  )

  setAiRecommendationLoading(false)
}

async function loadAiActionLogs() {
  if (!canUseSmartAi) {
    setAiActionLogs([])
    setAiActionLogMessage("")
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setAiActionLogs([])
    setAiActionLogMessage(
      "No organization is available for Recovery Mode audit history."
    )
    return
  }

  setAiActionLogLoading(true)
  setAiActionLogMessage("")

  const { data, error } = await supabase
    .from("ai_action_logs")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(
      "AI ACTION LOGS LOAD ERROR:",
      error
    )

    setAiActionLogs([])
    setAiActionLogMessage(
      "Recovery Mode audit history could not be loaded."
    )
    setAiActionLogLoading(false)
    return
  }

  setAiActionLogs(
    (data || []) as AiActionLog[]
  )

  setAiActionLogLoading(false)
}

async function updateAiRecommendationStatus(
  recommendationId: string,
  status: "approved" | "rejected"
) {
  if (
  !requireSmartAiPermission(
    "approve or reject Smart AI recommendations"
  )
) {
  return
}

  setAiRecommendationMessage("")

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    setAiRecommendationMessage(
      "Your session could not be verified."
    )
    return
  }

  const { error } = await supabase
    .from("ai_recommendations")
    .update({
      status,
      approved_by:
        status === "approved"
          ? user.id
          : null,
      approved_at:
        status === "approved"
          ? new Date().toISOString()
          : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", recommendationId)

  if (error) {
    console.error(
      "AI RECOMMENDATION STATUS UPDATE ERROR:",
      error
    )

    setAiRecommendationMessage(
      "The recommendation status could not be updated."
    )
    return
  }

  setAiRecommendationMessage(
    status === "approved"
      ? "Recommendation approved. No repair has been applied yet."
      : "Recommendation rejected."
  )

  await loadAiRecommendations()
}

async function applySafeAiRecommendation(
  recommendation: AiRecommendation
) {
  if (
  !requireSmartAiPermission(
    "apply Smart AI recovery actions"
  )
) {
  return
}

  setAiRecommendationMessage("")

  if (recommendation.status !== "approved") {
    setAiRecommendationMessage(
      "This recommendation must be approved before it can be applied."
    )
    return
  }

  if (recommendation.risk_level !== "low") {
    setAiRecommendationMessage(
      "Only low-risk recovery actions can be applied automatically."
    )
    return
  }

  const actionType =
    typeof recommendation.proposed_action?.action_type === "string"
      ? recommendation.proposed_action.action_type
      : ""

  if (actionType !== "refresh_erp_data") {
    setAiRecommendationMessage(
      "This recovery action is not yet supported."
    )
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setAiRecommendationMessage(
      "No organization is available for this recovery action."
    )
    return
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    setAiRecommendationMessage(
      "Your session could not be verified."
    )
    return
  }
const executionToken = crypto.randomUUID()
const executionStartedAt = new Date().toISOString()

const {
  data: claimedRecommendation,
  error: claimError,
} = await supabase
  .from("ai_recommendations")
  .update({
    execution_started_at: executionStartedAt,
    execution_started_by: user.id,
    execution_token: executionToken,
    updated_at: executionStartedAt,
  })
  .eq("id", recommendation.id)
  .eq("organization_id", orgId)
  .eq("status", "approved")
  .is("execution_token", null)
  .select("id")
  .maybeSingle()

if (claimError) {
  console.error(
    "AI RECOMMENDATION EXECUTION CLAIM ERROR:",
    claimError
  )

  setAiRecommendationMessage(
    "The recovery action could not be started."
  )
  return
}

if (!claimedRecommendation) {
  setAiRecommendationMessage(
    "This recovery action is already running or has already been applied."
  )
  await loadAiRecommendations()
  return
}

  const startedAt = executionStartedAt

  try {
    await loadData()

    const { error: logError } = await supabase
      .from("ai_action_logs")
      .insert({
        organization_id: orgId,
        incident_id: recommendation.incident_id,
        recommendation_id: recommendation.id,
        action_type: "refresh_erp_data",
        result: "success",
        before_state: {
          started_at: startedAt,
        },
        after_state: {
          completed_at: new Date().toISOString(),
        },
        error_message: null,
        performed_by: user.id,
      })

    if (logError) {
      console.error(
        "AI ACTION LOG INSERT ERROR:",
        logError
      )
    }

    const appliedAt = new Date().toISOString()

const {
  data: appliedRecommendation,
  error: recommendationUpdateError,
} = await supabase
  .from("ai_recommendations")
  .update({
    status: "applied",
    applied_at: appliedAt,
    updated_at: appliedAt,
  })
  .eq("id", recommendation.id)
  .eq("organization_id", orgId)
  .eq("status", "approved")
  .eq("execution_token", executionToken)
  .select("id")
  .maybeSingle()

    if (recommendationUpdateError) {
  console.error(
    "AI RECOMMENDATION APPLY UPDATE ERROR:",
    recommendationUpdateError
  )

  setAiRecommendationMessage(
    "The recovery completed, but its final status could not be recorded."
  )

  await loadAiRecommendations()
  await loadAiActionLogs()
  return
}

if (!appliedRecommendation) {
  setAiRecommendationMessage(
    "The recovery action was not finalized because its execution lock no longer matched."
  )

  await loadAiRecommendations()
  await loadAiActionLogs()
  return
}

    setAiRecommendationMessage(
      "ERP data refreshed successfully. The recovery action was logged."
    )

    await loadAiRecommendations()
    await loadAiActionLogs()
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown recovery error"

    console.error(
      "SAFE AI RECOVERY ACTION ERROR:",
      error
    )

    await supabase
      .from("ai_action_logs")
      .insert({
        organization_id: orgId,
        incident_id: recommendation.incident_id,
        recommendation_id: recommendation.id,
        action_type: "refresh_erp_data",
        result: "failed",
        before_state: {
          started_at: startedAt,
        },
        after_state: {},
        error_message: errorMessage,
        performed_by: user.id,
      })
      const { error: releaseLockError } =
  await supabase
    .from("ai_recommendations")
    .update({
      execution_started_at: null,
      execution_started_by: null,
      execution_token: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", recommendation.id)
    .eq("organization_id", orgId)
    .eq("status", "approved")
    .eq("execution_token", executionToken)

if (releaseLockError) {
  console.error(
    "AI RECOMMENDATION LOCK RELEASE ERROR:",
    releaseLockError
  )
}

    setAiRecommendationMessage(
      "The recovery action failed and was recorded in the audit history."
    )

    await loadAiActionLogs()
  }
}

async function updateAiIncidentStatus(
  incidentId: string,
  status: "investigating" | "resolved" | "ignored"
) {
  if (
  !requireSmartAiPermission(
    "change Smart AI incident status"
  )
) {
  return
}

  setAiIncidentMessage("")

  const resolvedAt =
    status === "resolved"
      ? new Date().toISOString()
      : null

  const { error } = await supabase
    .from("ai_incidents")
    .update({
      status,
      resolved_at: resolvedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", incidentId)

  if (error) {
    console.error(
      "AI INCIDENT STATUS UPDATE ERROR:",
      error
    )

    setAiIncidentMessage(
      "The incident status could not be updated."
    )
    return
  }

  setAiIncidentMessage(
    status === "resolved"
      ? "Incident marked as resolved."
      : status === "ignored"
        ? "Incident ignored."
        : "Incident moved to investigation."
  )

  await loadAiIncidents()
}

async function loadData() {
  setLoading(true)
  setError('')

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    router.push('/login')
    return
  }

  setEmail(user.email || user.user_metadata?.email || "No email found")
  if (user.email) {
  await acceptPendingInvitationForUser(
    user.id,
    user.email
  )
}

  let { data: memberData } = await supabase
  .from("team_members")
  .select("organization_id")
  .eq("user_id", user.id)
  .maybeSingle()

if (!memberData) {
  setError("No team member record found.")
  setLoading(false)
  return
}
   const loadedOrgId = memberData.organization_id
setOrganizationId(loadedOrgId)
localStorage.setItem("erp_org_id", loadedOrgId)
const { data: moduleData, error: moduleError } = await supabase
  .from("organization_modules")
  .select(`
    enabled,
    modules (
      module_key
    )
  `)
  .eq("organization_id", loadedOrgId)
  .eq("enabled", true);

if (moduleError) {
  console.error("Module load error:", moduleError);
} else {
  const keys =
    moduleData
      ?.map((item: any) => item.modules?.module_key)
      .filter(Boolean) || [];

  setEnabledModules(keys);
}
const { data: organizationData, error: organizationError } = await supabase
  .from("organizations")
.select(
  "name, contact_email, phone, website, address, subscription_tier, subscription_status, trial_ends_at, access_status, seat_limit, max_companies, max_clients, max_inventory_items, max_monthly_invoices, advanced_reports_enabled, ai_assist_enabled, smart_ai_enabled, smart_ai_plan, smart_ai_started_at, smart_ai_expires_at, smart_ai_recovery_enabled, smart_ai_recovery_mode, smart_ai_auto_retry_enabled, smart_ai_max_auto_retries, smart_ai_last_health_check_at, executive_intelligence_enabled, executive_intelligence_plan, executive_intelligence_started_at, executive_intelligence_expires_at"
)
  .eq("id", loadedOrgId)
  .single()

if (organizationError) {
  console.error("ORGANIZATION LOAD ERROR:", organizationError)
} else {
setOrganizationName(organizationData?.name || "")
setOrganizationEmail(organizationData?.contact_email || "")
setOrganizationPhone(organizationData?.phone || "")
setOrganizationWebsite(organizationData?.website || "")
setSubscriptionTier(
  organizationData?.subscription_tier || "starter"
)

setSubscriptionStatus(
  organizationData?.subscription_status || "active"
)

setTrialEndsAt(
  organizationData?.trial_ends_at || null
)

setAccessStatus(
  organizationData?.access_status || "active"
)
setSeatLimit(
  Number(organizationData?.seat_limit || 100)
)
setMaxCompanies(
  Number(organizationData?.max_companies || 5)
)

setMaxClients(
  Number(organizationData?.max_clients || 25)
)

setMaxInventoryItems(
  Number(organizationData?.max_inventory_items || 50)
)

setMaxMonthlyInvoices(
  Number(organizationData?.max_monthly_invoices || 25)
)

setAdvancedReportsEnabled(
  organizationData?.advanced_reports_enabled ?? false
)

setAiAssistEnabled(
  organizationData?.ai_assist_enabled ?? false
)
setSmartAiEnabled(
  organizationData?.smart_ai_enabled ?? false
)
setSmartAiExpiresAt(
  organizationData?.smart_ai_expires_at || null
)


setSmartAiLastHealthCheckAt(
  organizationData?.smart_ai_last_health_check_at || null
)

setSmartAiPlan(
  organizationData?.smart_ai_plan || "none"
)

setExecutiveIntelligenceEnabled(
  organizationData?.executive_intelligence_enabled ?? false
)

setExecutiveIntelligencePlan(
  organizationData?.executive_intelligence_plan || "none"
)

setExecutiveIntelligenceStartedAt(
  organizationData?.executive_intelligence_started_at || null
)

setExecutiveIntelligenceExpiresAt(
  organizationData?.executive_intelligence_expires_at || null
)

setSmartAiStartedAt(
  organizationData?.smart_ai_started_at || null
)

setSmartAiExpiresAt(
  organizationData?.smart_ai_expires_at || null
)
setSmartAiRecoveryEnabled(
  organizationData?.smart_ai_recovery_enabled || false
)

setSmartAiRecoveryMode(
  organizationData?.smart_ai_recovery_mode || "off"
)

setSmartAiAutoRetryEnabled(
  organizationData?.smart_ai_auto_retry_enabled || false
)

setSmartAiMaxAutoRetries(
  Number(organizationData?.smart_ai_max_auto_retries || 1)
)

setSmartAiLastHealthCheckAt(
  organizationData?.smart_ai_last_health_check_at || null
)
}

const [
  tasksResult,
  clientsResult,
  companiesResult,
  suppliersResult,
] = await Promise.all([
  supabase
    .from("tasks")
    .select(
      "id, title, status, priority, organization_id, assigned_to, due_date, client_id, company_id"
    )
    .eq("organization_id", loadedOrgId)
    .order("created_at", { ascending: false }),

  supabase
    .from("clients")
    .select("id, name, company_id, status")
    .eq("organization_id", loadedOrgId)
    .order("created_at", { ascending: false }),

  supabase
    .from("companies")
    .select("id, name")
    .eq("organization_id", loadedOrgId)
    .order("created_at", { ascending: false }),

  supabase
    .from("suppliers")
    .select(
      "id, organization_id, company_id, supplier_name, contact_name, email, phone, website, address, status, notes"
    )
    .eq("organization_id", loadedOrgId)
    .order("created_at", { ascending: false }),
])

const { data: tasksData, error: tasksError } = tasksResult
const { data: clientsData, error: clientsError } = clientsResult
const { data: companiesData, error: companiesError } = companiesResult
const { data: suppliersData, error: suppliersError } = suppliersResult

if (tasksError) {
  console.error("TASKS LOAD ERROR:", tasksError)
  setError(tasksError.message)
}

if (clientsError) {
  console.error("CLIENTS LOAD ERROR:", clientsError)
  setError(clientsError.message)
}

if (companiesError) {
  console.error("COMPANIES LOAD ERROR:", companiesError)
  setError(companiesError.message)
}

if (suppliersError) {
  console.error("SUPPLIERS LOAD ERROR:", suppliersError)
  setError(suppliersError.message)
}
const [
  purchaseOrdersResult,
  salesOrdersResult,
  salesOrderItemsResult,
  vendorBillsResult,
  vendorPaymentsResult,
  purchaseOrderItemsResult,
  customerInvoicesResult,
  customerInvoicePaymentsResult,
] = await Promise.all([
  supabase
    .from("purchase_orders")
    .select(
      "id, organization_id, supplier_id, company_id, po_number, status, order_date, expected_date, total_amount, notes"
    )
    .eq("organization_id", loadedOrgId)
    .order("created_at", { ascending: false }),

  supabase
    .from("sales_orders")
    .select("*")
    .eq("organization_id", loadedOrgId)
    .order("created_at", { ascending: false }),

  supabase
    .from("sales_order_items")
    .select("*")
    .eq("organization_id", loadedOrgId)
    .order("created_at", { ascending: false }),

  supabase
    .from("vendor_bills")
    .select("*")
    .eq("organization_id", loadedOrgId)
    .order("created_at", { ascending: false }),

  supabase
    .from("vendor_payments")
    .select("*")
    .eq("organization_id", loadedOrgId)
    .order("created_at", { ascending: false }),

  supabase
    .from("purchase_order_items")
    .select("*")
    .eq("organization_id", loadedOrgId)
    .order("created_at", { ascending: false }),

  supabase
    .from("customer_invoices")
    .select("*")
    .eq("organization_id", loadedOrgId)
    .order("created_at", { ascending: false }),

  supabase
    .from("customer_invoice_payments")
    .select("*")
    .eq("organization_id", loadedOrgId)
    .order("created_at", { ascending: false }),
])

const {
  data: purchaseOrdersData,
  error: purchaseOrdersError,
} = purchaseOrdersResult

const {
  data: salesOrdersData,
  error: salesOrdersError,
} = salesOrdersResult

const {
  data: salesOrderItemsData,
  error: salesOrderItemsError,
} = salesOrderItemsResult

const {
  data: vendorBillsData,
  error: vendorBillsError,
} = vendorBillsResult

const {
  data: vendorPaymentsData,
  error: vendorPaymentsError,
} = vendorPaymentsResult

const {
  data: purchaseOrderItemsData,
  error: purchaseOrderItemsError,
} = purchaseOrderItemsResult

const {
  data: customerInvoicesData,
  error: customerInvoicesError,
} = customerInvoicesResult

const {
  data: customerInvoicePaymentsData,
  error: customerInvoicePaymentsError,
} = customerInvoicePaymentsResult

if (purchaseOrdersError) {
  console.error(
    "PURCHASE ORDERS LOAD ERROR:",
    purchaseOrdersError
  )
  setError(purchaseOrdersError.message)
} else {
  setPurchaseOrders(purchaseOrdersData || [])
}

if (salesOrdersError) {
  console.error(
    "SALES ORDERS LOAD ERROR:",
    salesOrdersError
  )
  setError(salesOrdersError.message)
} else {
  setSalesOrders(salesOrdersData || [])
}

if (salesOrderItemsError) {
  console.error(
    "SALES ORDER ITEMS LOAD ERROR:",
    salesOrderItemsError
  )
  setError(salesOrderItemsError.message)
} else {
  setSalesOrderItems(salesOrderItemsData || [])
}

if (vendorBillsError) {
  console.error(
    "VENDOR BILLS LOAD ERROR:",
    vendorBillsError
  )
  setError(vendorBillsError.message)
} else {
  setVendorBills(vendorBillsData || [])
}

if (vendorPaymentsError) {
  console.error(
    "VENDOR PAYMENTS LOAD ERROR:",
    vendorPaymentsError
  )
  setError(vendorPaymentsError.message)
} else {
  setVendorPayments(vendorPaymentsData || [])
}

if (purchaseOrderItemsError) {
  console.error(
    "PURCHASE ORDER ITEMS LOAD ERROR:",
    purchaseOrderItemsError
  )
  setError(purchaseOrderItemsError.message)
} else {
  setPurchaseOrderItems(purchaseOrderItemsData || [])
}

if (customerInvoicesError) {
  console.error(
    "CUSTOMER INVOICES LOAD ERROR:",
    customerInvoicesError
  )
  setError(customerInvoicesError.message)
} else {
  setCustomerInvoices(customerInvoicesData || [])
}

if (customerInvoicePaymentsError) {
  console.error(
    "CUSTOMER INVOICE PAYMENTS LOAD ERROR:",
    customerInvoicePaymentsError
  )
  setError(customerInvoicePaymentsError.message)
} else {
  setCustomerInvoicePayments(
    customerInvoicePaymentsData || []
  )
}
const { data: inventoryItemsData, error: inventoryItemsError } = await supabase
  .from('inventory_items')
  .select(
    'id, organization_id, company_id, sku, item_name, description, category, unit, quantity_on_hand, reorder_level, unit_cost, status'
  )
  .eq('organization_id', loadedOrgId)
  .order('created_at', { ascending: false })

if (inventoryItemsError) {
  console.error("INVENTORY ITEMS LOAD ERROR:", inventoryItemsError)
  setError(inventoryItemsError.message)
}
const {

  data: inventoryMovementsData,
  error: inventoryMovementsError,
} = await supabase
  .from("inventory_movements")
.select("*")
.eq("organization_id", loadedOrgId)
.order("created_at", { ascending: false })

if (inventoryMovementsError) {
  console.error(
    "INVENTORY MOVEMENTS LOAD ERROR:",
    inventoryMovementsError
  )
  setError(inventoryMovementsError.message)
} else {
  setInventoryMovements(inventoryMovementsData || [])
}
const { data: notificationsData, error: notificationsError } = await supabase
  .from("notifications")
  .select("*")
  .eq("organization_id", loadedOrgId)
  .order("created_at", { ascending: false })

if (notificationsError) {
  console.error("NOTIFICATIONS LOAD ERROR:", notificationsError)
  setError(notificationsError.message)
} else {
  setNotifications(notificationsData || [])
}
const { data: auditLogsData, error: auditLogsError } = await supabase
  .from("audit_logs")
  .select(
    "id, organization_id, user_email, user_role, action, module, record_id, record_type, details, created_at"
  )
  .eq("organization_id", loadedOrgId)
  .order("created_at", { ascending: false })
  .limit(100)

if (auditLogsError) {
  console.error("AUDIT LOGS LOAD ERROR:", auditLogsError)
  setError(auditLogsError.message)
} else {
  setAuditLogs(auditLogsData || [])
}
const {
  data: teamData,
  error: teamError,
} = await supabase
  .from("team_members")
  .select(
    "id, organization_id, user_id, full_name, email, role, is_active, avatar_url, phone, job_title"
  )
  .eq("organization_id", loadedOrgId)
  .order("created_at", { ascending: true })

  if (teamError) {
  console.error(
    "TEAM MEMBERS LOAD ERROR:",
    teamError
  )
  setError(teamError.message)
}

const {
  data: invitationData,
  error: invitationError,
} = await supabase
  .from("user_invitations")
  .select("*")
  .eq("organization_id", loadedOrgId)
  .order("created_at", { ascending: false })

if (invitationError) {
  console.error(
    "USER INVITATIONS LOAD ERROR:",
    invitationError
  )
  setError(invitationError.message)
} else {
  setUserInvitations(invitationData || [])
}

setTasks(tasksData || [])
setClients(clientsData || [])
setCompanies(companiesData || [])
setSuppliers(suppliersData || [])
setInventoryItems(inventoryItemsData || [])
setTeamMembers(teamData || [])

const currentProfile = teamData?.find(
  (member) => member.email === (user.email || user.user_metadata?.email)
)

setProfileName(currentProfile?.full_name || "")
setProfilePhone(currentProfile?.phone || "")
setProfileJobTitle(currentProfile?.job_title || "")

setLoading(false)
}

useEffect(() => {
  loadData()
}, [])

async function recordAuditLog({
  action,
  module,
  recordId = null,
  recordType = null,
  details = null,
}: {
  action: string
  module: string
  recordId?: string | null
  recordType?: string | null
  details?: Record<string, unknown> | null
}) {
  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) return

  const { error } = await supabase.from("audit_logs").insert({
    organization_id: orgId,
    user_email: email,
    user_role: currentRole,
    action,
    module,
    record_id: recordId,
    record_type: recordType,
    details,
  })

  if (error) {
    console.error("AUDIT LOG ERROR:", error.message)
  }
}

async function acceptPendingInvitationForUser(
  userId: string,
  userEmail: string
) {

  const {
    data: acceptedOrgId,
    error,
  } = await supabase.rpc("accept_pending_user_invitation")

 if (error) {
  console.error("INVITATION ACCEPT RPC ERROR RAW:", error)

  console.error(
    "INVITATION ACCEPT RPC ERROR DETAILS:",
    JSON.stringify(
      {
        message: error.message ?? "No message returned",
        details: error.details ?? "No details returned",
        hint: error.hint ?? "No hint returned",
        code: error.code ?? "No code returned",
      },
      null,
      2
    )
  )

  return null
}

  if (!acceptedOrgId) {
    return null
  }
const {
  data: acceptedMember,
  error: memberError,
} = await supabase
  .from("team_members")
  .select("id, role")
  .eq("organization_id", acceptedOrgId)
  .eq("user_id", userId)
  .maybeSingle()

if (memberError) {
  console.error(
    "ACCEPTED MEMBER LOAD ERROR:",
    memberError
  )
}

const { error: auditError } =
  await supabase
    .from("audit_logs")
    .insert({
      organization_id: acceptedOrgId,
      user_email:
        userEmail.trim().toLowerCase(),
      user_role:
        acceptedMember?.role || "member",
      action: "accepted",
      module: "Team",
      record_id:
        acceptedMember?.id || null,
      record_type: "user_invitation",
      details: {
        email:
          userEmail.trim().toLowerCase(),
        role:
          acceptedMember?.role || "member",
        status: "accepted",
      },
    })

if (auditError) {
  console.error(
    "INVITATION ACCEPT AUDIT ERROR:",
    auditError
  )
}

return acceptedOrgId
}

async function handleCreateTask(e: React.FormEvent) {
  e.preventDefault()


  if (!newTaskTitle.trim()) return

  setCreatingTask(true)
  setError("")


  let orgIdForInsert =
  organizationId ||
  localStorage.getItem("erp_org_id") ||
  ""

  if (!orgIdForInsert) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: memberData } = await supabase
        .from("team_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single()

      orgIdForInsert = memberData?.organization_id ?? ""
    }
  }

  if (!orgIdForInsert) {
  setError("No organization loaded yet. Please refresh and log in again.")
  setCreatingTask(false)
  return
}

const taskPayload = {
  organization_id: orgIdForInsert,
  title: newTaskTitle,
  description: "Created from dashboard",
  status: newTaskStatus,
  priority: newTaskPriority,
  due_date: newTaskDueDate === "" ? null : newTaskDueDate,
  assigned_to: newTaskAssignedTo === "" ? null : newTaskAssignedTo,
  client_id: newTaskClientId === "" ? null : newTaskClientId,
  workflow_id: null,
  workflow_step_id: null,
  completed_at: null,
}

const { data: insertedTasks, error: insertError } = await supabase
  .from("tasks")
  .insert(taskPayload)
  .select("id, title, status, due_date")

if (insertError) {
  console.error("CREATE TASK ERROR FULL:", insertError)
  setError(insertError.message)
  setCreatingTask(false)
  return
}
const insertedTask = insertedTasks?.[0]
await recordAuditLog({
  action: "created",
  module: "Tasks",
  recordId: insertedTask?.id || null,
  recordType: "task",
  details: {
    title: newTaskTitle,
    status: newTaskStatus,
    priority: newTaskPriority,
  },
})

const insertedDueDate = insertedTask?.due_date
  ? new Date(insertedTask.due_date)
  : null

if (
  insertedTask &&
  insertedDueDate &&
  insertedDueDate < new Date() &&
  insertedTask.status !== "completed"
) {
  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      organization_id: orgIdForInsert,
      title: "Late task",
      message: `${insertedTask.title} is past due.`,
      type: "warning",
      related_module: "Tasks",
      related_id: insertedTask.id,
      is_read: false,
    })

  if (notificationError) {
    setError(notificationError.message)
    setCreatingTask(false)
    return
  }
}

setCreatingTask(false)
setNewTaskTitle("")
setNewTaskDueDate("")
setNewTaskAssignedTo("")
setNewTaskClientId("")

await loadData()
}

 async function handleCreateClient(e: React.FormEvent) {
  e.preventDefault()
  setError("")
  setSuccessMessage("")

  const trimmedClientName = newClientName.trim()

  if (!trimmedClientName) {
    setError("Client name is required.")
    return
  }
  if (clientLimitReached) {
  setError(
    `Your ${subscriptionTier} plan allows up to ${maxClients} clients. Upgrade your plan to add more clients.`
  )
  return
}

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError("No organization loaded. Please refresh and log in again.")
    return
  }

  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const { data: existingClients, error: existingClientError } = await supabase
    .from("clients")
    .select("*")
    .eq("organization_id", orgId)
    .gte("created_at", twelveMonthsAgo.toISOString())

  if (existingClientError) {
    setError(existingClientError.message)
    return
  }

  const existingClient = existingClients?.find(
    (client) =>
      client.name.trim().toLowerCase() ===
      trimmedClientName.toLowerCase()
  )

  if (existingClient) {
  setNewClientName("")
  setSuccessMessage(
    "Existing customer record found and reused. No duplicate client was created."
  )

  await reportAiIncident({
    incidentCode:
      "CLIENT_DUPLICATE_DETECTED",
    module: "clients",
    source: "create_client",
    severity: "medium",
    title: "Possible duplicate client detected",
    userMessage:
      "A matching client record was found and reused instead of creating a duplicate.",
    technicalMessage:
      `Client name "${trimmedClientName}" matched an existing client record within the 12-month duplicate-prevention window.`,
    context: {
      existing_client_id:
        existingClient.id,
      existing_client_name:
        existingClient.name,
      attempted_client_name:
        trimmedClientName,
      duplicate_window_months:
        12,
      action_taken:
        "existing_record_reused",
    },
  })

  await loadData()
  return
}

  const { data: insertedClients, error } = await supabase
  .from("clients")
  .insert({
    organization_id: orgId,
    name: trimmedClientName,
  })
  .select("id, name")
  const insertedClient = insertedClients?.[0]

await recordAuditLog({
  action: "created",
  module: "Clients",
  recordId: insertedClient?.id || null,
  recordType: "client",
  details: {
    name: trimmedClientName,
  },
})

  if (error) {
    setError(error.message)
    return
  }

  setNewClientName("")
  setSuccessMessage("Customer created successfully.")
  await loadData()
}

async function markAllNotificationsRead() {
  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError("No organization loaded. Please refresh and log in again.")
    return
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("organization_id", orgId)
    .eq("is_read", false)

  if (error) {
    setError(error.message)
    return
  }

  setSuccessMessage("Notifications marked as read.")
  await loadData()
}
async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)

  if (error) {
    console.error("Notification update error:", error)
    return
  }

  await loadData()
}
function exportToCsv(filename: string, rows: Record<string, any>[]) {
  if (rows.length === 0) {
    setError("No data available to export.")
    return
  }

  const headers = Object.keys(rows[0])

  const csvRows = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header]

          if (value === null || value === undefined) {
            return ""
          }

          return `"${String(value).replace(/"/g, '""')}"`
        })
        .join(",")
    ),
  ]

  const csvContent = csvRows.join("\n")
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
function exportAdvancedReportToCsv(
  filename: string,
  rows: Record<string, any>[]
) {
  if (!advancedReportsEnabled) {
    setError(
      "Advanced report exports require an upgraded plan."
    )
    return
  }

  exportToCsv(filename, rows)
}

async function updateClient(
  clientId: string,
  updates: Partial<Client>
): Promise<boolean> {
  setError("")

  const { error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", clientId)

  if (error) {
    setError(error.message)
    return false
  }

  await loadData()
  return true
}
async function archiveClient(clientId: string) {
  if (
  !requireAdminPermission(
    "archive clients"
  )
) {
  return
}
  const confirmed = window.confirm(
    "Archive this client? It will be hidden from active client views but kept for audit history."
  )

  if (!confirmed) return

  setSuccessMessage("")

  const updated = await updateClient(clientId, {
    status: "inactive",
  })

  if (!updated) return

  setSuccessMessage("Client archived successfully.")
}
async function restoreClient(clientId: string) {
  if (
  !requireAdminPermission(
    "restore clients"
  )
) {
  return
}
  const confirmed = window.confirm(
    "Restore this client? It will return to active client views."
  )

  if (!confirmed) return

  setSuccessMessage("")

  const updated = await updateClient(clientId, {
    status: "active",
  })

  if (!updated) return

  setSuccessMessage("Client restored successfully.")
}

async function handleCreateCompany(e: React.FormEvent) {
  e.preventDefault()

  if (!newCompanyName.trim()) return

  if (companyLimitReached) {
  setError(
    `Your ${subscriptionTier} plan allows up to ${maxCompanies} compan${
      maxCompanies === 1 ? "y" : "ies"
    }. Upgrade your plan to add more companies.`
  )
  return
}

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError("No organization loaded. Please refresh and log in again.")
    return
  }

  const { data: insertedCompanies, error } = await supabase
  .from("companies")
  .insert({
    organization_id: orgId,
    name: newCompanyName,
  })
  .select("id, name")

  if (error) {
    setError(error.message)
    return
  }
  const insertedCompany = insertedCompanies?.[0]

await recordAuditLog({
  action: "created",
  module: "Companies",
  recordId: insertedCompany?.id || null,
  recordType: "company",
  details: {
    name: newCompanyName,
  },
})

  setNewCompanyName("")
  await loadData()
}

async function createInvitation(e: React.FormEvent) {
  e.preventDefault()
  setError("")
  setSuccessMessage("")

  if (
    !requireAdminPermission(
      "invite users"
    )
  ) {
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError("No organization loaded. Please refresh and log in again.")
    return
  }
  if (seatLimitReached) {
  setError(
    `Your organization has reached its seat limit (${seatLimit}). Upgrade your plan or free a seat before inviting another user.`
  )
  return
}

  const normalizedEmail = inviteEmail.trim().toLowerCase()

  if (!normalizedEmail) {
    setError("Invite email is required.")
    return
  }

  const emailLooksValid =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    normalizedEmail
  )

if (!emailLooksValid) {
  setError(
    "Please enter a valid email address."
  )
  return
}

  const duplicateMember = teamMembers.find(
    (member) =>
      member.email?.trim().toLowerCase() === normalizedEmail
  )

  if (duplicateMember) {
    setError("This user is already a member of the organization.")
    return
  }

  const duplicateInvitation =
  userInvitations.find(
    (invitation) =>
      invitation.email
        .trim()
        .toLowerCase() === normalizedEmail &&
      invitation.status === "pending" &&
      !isInvitationExpired(invitation)
  )

  if (duplicateInvitation) {
    setError("A pending invitation already exists for this email.")
    return
  }

  const inviteToken =
  `${crypto.randomUUID()}-${crypto.randomUUID()}`

const expiresAt =
  new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString()

const { data: insertedInvitations, error } = await supabase
  .from("user_invitations")
  .insert({
    organization_id: orgId,
    email: normalizedEmail,
    role: inviteRole,
    status: "pending",
    token: inviteToken,
    expires_at: expiresAt,
  })
  .select(
    "id, email, role, status, expires_at"
  )

  if (error) {
    setError(error.message)
    return
  }

  const insertedInvitation = insertedInvitations?.[0]

  await recordAuditLog({
    action: "created",
    module: "Team",
    recordId: insertedInvitation?.id || null,
    recordType: "user_invitation",

    details: {
  email: normalizedEmail,
  role: inviteRole,
  status: "pending",
  expires_at: expiresAt,
},
  })

  setInviteEmail("")
  setInviteRole("member")
  setSuccessMessage("Invitation created successfully.")
  await loadData()
}

async function revokeInvitation(
  invitationId: string
) {
  setError("")
  setSuccessMessage("")

  if (
    !requireAdminPermission(
      "revoke invitations"
    )
  ) {
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError(
      "No organization loaded. Please refresh and log in again."
    )
    return
  }

  const invitation = userInvitations.find(
    (item) => item.id === invitationId
  )

  if (!invitation) {
    setError("Invitation could not be found.")
    return
  }

  if (invitation.status !== "pending") {
    setError(
      "Only pending invitations can be revoked."
    )
    return
  }

  const confirmed = window.confirm(
    "Revoke this invitation? The invited user will no longer be able to accept it."
  )

  if (!confirmed) return

  const {
  data: updatedInvitations,
  error,
} = await supabase
  .from("user_invitations")
  .update({
    status: "revoked",
    updated_at: new Date().toISOString(),
  })
  .eq("id", invitationId)
  .eq("organization_id", orgId)
  .eq("status", "pending")
  .select("id")

  if (error) {
    setError(error.message)
    return
  }
  if (!updatedInvitations?.length) {
  setError(
    "The invitation was not revoked. It may already have changed status."
  )
  return
}

  await recordAuditLog({
    action: "revoked",
    module: "Team",
    recordId: invitationId,
    recordType: "user_invitation",
    details: {
      email: invitation.email,
      role: invitation.role,
      previous_status: "pending",
      status: "revoked",
    },
  })

  setSuccessMessage(
    "Invitation revoked successfully."
  )

  await loadData()
}

async function resendInvitation(
  invitation: UserInvitation
) {
  setError("")
  setSuccessMessage("")

  if (
    !requireAdminPermission(
      "resend invitations"
    )
  ) {
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError(
      "No organization loaded. Please refresh and log in again."
    )
    return
  }

  if (seatLimitReached) {
    setError(
      `Your organization has reached its seat limit (${seatLimit}). Upgrade your plan or free a seat before resending this invitation.`
    )
    return
  }

  const existingMember = teamMembers.find(
    (member) =>
      member.email?.trim().toLowerCase() ===
      invitation.email.trim().toLowerCase()
  )

  if (existingMember) {
    setError("This user is already a team member.")
    return
  }

  const invitationHasExpired =
  isInvitationExpired(invitation)

const canResendInvitation =
  invitation.status === "revoked" ||
  invitation.status === "expired" ||
  (
    invitation.status === "pending" &&
    invitationHasExpired
  )

if (!canResendInvitation) {
  setError(
    "Only revoked or expired invitations can be resent."
  )
  return
}

  const newToken =
    `${crypto.randomUUID()}-${crypto.randomUUID()}`

  const newExpiresAt =
    new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString()

  const {
  data: updatedInvitations,
  error,
} = await supabase
  .from("user_invitations")
  .update({
    status: "pending",
    token: newToken,
    expires_at: newExpiresAt,
    accepted_at: null,
    token_used_at: null,
    updated_at: new Date().toISOString(),
  })
  .eq("id", invitation.id)
  .eq("organization_id", orgId)
  .select("id")

  if (error) {
    setError(error.message)
    return
  }
  if (!updatedInvitations?.length) {
  setError(
    "The invitation was not updated. It may no longer be available."
  )
  return
}

  await recordAuditLog({
    action: "resent",
    module: "Team",
    recordId: invitation.id,
    recordType: "user_invitation",
    details: {
      email: invitation.email,
      role: invitation.role,
      status: "pending",
      expires_at: newExpiresAt,
    },
  })

  setSuccessMessage("Invitation resent successfully.")
  await loadData()
}

async function updateCompany(
  companyId: string,
  updates: Partial<Company>
) {
  if (
    !requirePermission(
      canManageCompanies,
      "You do not have permission to update companies."
    )
  ) {
    return
  }

  setError("")

  const { error } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", companyId)

  if (error) {
    console.error("UPDATE COMPANY ERROR:", error)
    setError(error.message)
    return
  }

  await loadData()
}

async function deleteCompany(companyId: string) {
  if (
  !requireAdminPermission(
    "delete companies"
  )
) {
  return
}
  setError("")
  setSuccessMessage("")

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError(
      "No organization loaded. Please refresh and log in again."
    )
    return
  }

  const [
    clientsResult,
    suppliersResult,
    tasksResult,
    purchaseOrdersResult,
    inventoryItemsResult,
    salesOrdersResult,
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("company_id", companyId),

    supabase
      .from("suppliers")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("company_id", companyId),

    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("company_id", companyId),

    supabase
      .from("purchase_orders")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("company_id", companyId),

    supabase
      .from("inventory_items")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("company_id", companyId),

    supabase
      .from("sales_orders")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("company_id", companyId),
  ])

  const dependencyError =
    clientsResult.error ||
    suppliersResult.error ||
    tasksResult.error ||
    purchaseOrdersResult.error ||
    inventoryItemsResult.error ||
    salesOrdersResult.error

  if (dependencyError) {
    setError(dependencyError.message)
    return
  }

  const linkedRecordCount =
    (clientsResult.count || 0) +
    (suppliersResult.count || 0) +
    (tasksResult.count || 0) +
    (purchaseOrdersResult.count || 0) +
    (inventoryItemsResult.count || 0) +
    (salesOrdersResult.count || 0)

  if (linkedRecordCount > 0) {
    setError(
      `This company cannot be deleted because it is linked to ${linkedRecordCount} business record${
        linkedRecordCount === 1 ? "" : "s"
      }. Remove or reassign those links first.`
    )
    return
  }

  const confirmed = window.confirm(
    "Delete this company? This action cannot be undone."
  )

  if (!confirmed) return

  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("organization_id", orgId)
    .eq("id", companyId)

  if (error) {
    setError(error.message)
    return
  }

  setSuccessMessage("Company deleted successfully.")
  await loadData()
}

async function handleCreateSupplier(e: React.FormEvent) {
  e.preventDefault()
  setError("")

  if (!requirePurchasingPermission("create suppliers")) {
    return
  }

  if (!newSupplierName.trim()) return
    const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError(
      "No organization loaded. Please refresh and log in again."
    )
    return
  }

  const { error } = await supabase.from("suppliers").insert({
    organization_id: orgId,
    company_id: newSupplierCompanyId === "" ? null : newSupplierCompanyId,
    supplier_name: newSupplierName,
    contact_name: newSupplierContact === "" ? null : newSupplierContact,
    email: newSupplierEmail === "" ? null : newSupplierEmail,
    phone: newSupplierPhone === "" ? null : newSupplierPhone,
    status: "active",
  })

  if (error) {
    setError(error.message)
    return
  }

  setNewSupplierName("")
  setNewSupplierContact("")
  setNewSupplierEmail("")
  setNewSupplierPhone("")
  setNewSupplierCompanyId("")

  await loadData()
}

async function updateSupplier(supplierId: string, updates: Partial<Supplier>) {
  if (!requirePurchasingPermission("update suppliers")) {
    return
  }

  const { error } = await supabase
    .from("suppliers")
    .update(updates)
    .eq("id", supplierId)

  if (error) {
    setError(error.message)
    return
  }

  await loadData()
}
async function archiveSupplier(supplierId: string) {
  if (
  !requireAdminPermission(
    "archive suppliers"
  )
) {
  return
}
  const confirmed = window.confirm(
    "Archive this supplier? It will be hidden from active purchasing views but kept for audit history."
  )

  if (!confirmed) return

  await updateSupplier(supplierId, {
    status: "archived",
  })

  setSuccessMessage("Supplier archived successfully.")
}

async function restoreSupplier(supplierId: string) {
  if (
  !requireAdminPermission(
    "restore suppliers"
  )
) {
  return
}
  const confirmed = window.confirm(
    "Restore this supplier? It will return to active purchasing views."
  )

  if (!confirmed) return

  await updateSupplier(supplierId, {
    status: "active",
  })

  setSuccessMessage("Supplier restored successfully.")
}

async function handleCreatePurchaseOrder(e: React.FormEvent) {
  e.preventDefault()
  setError("")

  if (!requirePurchasingPermission("create purchase orders")) {
    return
  }

  if (!newPoNumber.trim()) return

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError("No organization loaded. Please refresh and log in again.")
    return
  }

  const { data: insertedPurchaseOrders, error } = await supabase
  .from("purchase_orders")
  .insert({
    organization_id: orgId,
    supplier_id: newPoSupplierId === "" ? null : newPoSupplierId,
    company_id: newPoCompanyId === "" ? null : newPoCompanyId,
    po_number: newPoNumber,
    status: "draft",
    expected_date: newPoExpectedDate === "" ? null : newPoExpectedDate,
    total_amount:
      newPoTotalAmount === "" ? 0 : Number(newPoTotalAmount),
    notes: newPoNotes === "" ? null : newPoNotes,
    })
  .select("id, po_number, status, total_amount")

  if (error) {
    setError(error.message)
    return
  }
  const insertedPurchaseOrder = insertedPurchaseOrders?.[0]

await recordAuditLog({
  action: "created",
  module: "Purchasing",
  recordId: insertedPurchaseOrder?.id || null,
  recordType: "purchase_order",
  details: {
    po_number: newPoNumber,
    status: "draft",
    total_amount:
      newPoTotalAmount === ""
        ? 0
        : Number(newPoTotalAmount),
  },
})

  setNewPoNumber("")
  setNewPoSupplierId("")
  setNewPoCompanyId("")
  setNewPoExpectedDate("")
  setNewPoTotalAmount("")
  setNewPoNotes("")

 await loadData()
}

async function createPurchaseOrderItem(e: React.FormEvent) {
  e.preventDefault()
  setError("")

  if (!requirePurchasingPermission("create purchase order items")) {
    return
  }
  setError("")

    const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError("No organization loaded. Please refresh and log in again.")
    return
  }

  if (!lineItemPoId) {
    setError("Please select a purchase order.")
    return
  }

  if (!lineItemName.trim()) {
    setError("Item name is required.")
    return
  }

  if (Number(lineItemQuantity) <= 0) {
    setError("Quantity must be greater than zero.")
    return
  }

  if (Number(lineItemUnitCost) < 0) {
    setError("Unit cost cannot be negative.")
    return
  }

  const { data: insertedPurchaseOrderItems, error: insertError } = await supabase
  .from("purchase_order_items")
  .insert({
    organization_id: orgId,
    purchase_order_id: lineItemPoId,
    inventory_item_id: lineItemInventoryItemId || null,
    item_name: lineItemName.trim(),
    quantity: Number(lineItemQuantity),
    unit_cost: Number(lineItemUnitCost),
    received_quantity: 0,
  })
  .select("id, item_name, quantity, unit_cost")
  if (insertError) {
    setError(insertError.message)
    return
  }
  const insertedPurchaseOrderItem = insertedPurchaseOrderItems?.[0]

await recordAuditLog({
  action: "created",
  module: "Purchasing",
  recordId: insertedPurchaseOrderItem?.id || null,
  recordType: "purchase_order_item",
  details: {
    purchase_order_id: lineItemPoId,
    item_name: lineItemName.trim(),
    quantity: Number(lineItemQuantity),
    unit_cost: Number(lineItemUnitCost),
  },
})
  setError("")
  setSuccessMessage("Purchase order line item added successfully.")

  setLineItemPoId("")
  setLineItemInventoryItemId("")
  setLineItemName("")
  setLineItemQuantity(1)
  setLineItemUnitCost(0)

  await loadData()
}
async function createSalesOrder(e: React.FormEvent) {
  e.preventDefault()
  setError("")
  setSuccessMessage("")

  if (
    !requireSalesPermission(
      "create sales orders"
    )
  ) {
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError("No organization loaded. Please refresh and log in again.")
    return
  }

  if (!newSalesOrderNumber.trim()) {
    setError("Sales order number is required.")
    return
  }

  const { data: insertedSalesOrders, error } = await supabase
  .from("sales_orders")
  .insert({
      organization_id: orgId,
      client_id:
        newSalesOrderClientId === "" ? null : newSalesOrderClientId,
      company_id:
        newSalesOrderCompanyId === "" ? null : newSalesOrderCompanyId,
      order_number: newSalesOrderNumber,
      status: "draft",
      expected_ship_date:
        newSalesOrderExpectedShipDate === ""
          ? null
          : newSalesOrderExpectedShipDate,
      total_amount:
        newSalesOrderTotalAmount === ""
          ? null
          : Number(newSalesOrderTotalAmount),
      notes:
        newSalesOrderNotes === "" ? null : newSalesOrderNotes,
        })
    .select("id, order_number, status, total_amount")

  if (error) {
    setError(error.message)
    return
  }
  const insertedSalesOrder = insertedSalesOrders?.[0]

await recordAuditLog({
  action: "created",
  module: "Sales",
  recordId: insertedSalesOrder?.id || null,
  recordType: "sales_order",
  details: {
    order_number: newSalesOrderNumber,
    status: "draft",
    total_amount:
      newSalesOrderTotalAmount === ""
        ? null
        : Number(newSalesOrderTotalAmount),
  },
})

  setNewSalesOrderNumber("")
  setNewSalesOrderClientId("")
  setNewSalesOrderCompanyId("")
  setNewSalesOrderExpectedShipDate("")
  setNewSalesOrderTotalAmount("")
  setNewSalesOrderNotes("")
  setSuccessMessage("Sales order created successfully.")

  await loadData()
}
async function createSalesOrderItem(e: React.FormEvent) {
  e.preventDefault()
  setError("")
  setSuccessMessage("")

  if (
    !requireSalesPermission(
      "create sales-order line items"
    )
  ) {
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError("No organization loaded. Please refresh and log in again.")
    return
  }

  if (!salesLineOrderId) {
    setError("Please select a sales order.")
    return
  }

  if (!salesLineItemName.trim()) {
    setError("Item name is required.")
    return
  }

  if (Number(salesLineQuantity) <= 0) {
    setError("Quantity must be greater than zero.")
    return
  }

  if (Number(salesLineUnitPrice) < 0) {
    setError("Unit price cannot be negative.")
    return
  }

  const { data: insertedSalesOrderItems, error: insertError } = await supabase
  .from("sales_order_items")
  .insert({
      organization_id: orgId,
      sales_order_id: salesLineOrderId,
      inventory_item_id:
        salesLineInventoryItemId === ""
          ? null
          : salesLineInventoryItemId,
      item_name: salesLineItemName.trim(),
      quantity: Number(salesLineQuantity),
      unit_price: Number(salesLineUnitPrice),
      fulfilled_quantity: 0,
        })
    .select("id, sales_order_id, item_name, quantity, unit_price")

  if (insertError) {
    setError(insertError.message)
    return
  }
  const insertedSalesOrderItem = insertedSalesOrderItems?.[0]

await recordAuditLog({
  action: "created",
  module: "Sales",
  recordId: insertedSalesOrderItem?.id || null,
  recordType: "sales_order_item",
  details: {
    sales_order_id: salesLineOrderId,
    inventory_item_id:
      salesLineInventoryItemId === ""
        ? null
        : salesLineInventoryItemId,
    item_name: salesLineItemName.trim(),
    quantity: Number(salesLineQuantity),
    unit_price: Number(salesLineUnitPrice),
  },
})

  setSalesLineOrderId("")
  setSalesLineInventoryItemId("")
  setSalesLineItemName("")
  setSalesLineQuantity(1)
  setSalesLineUnitPrice(0)
  setSuccessMessage("Sales order line item added successfully.")

  await loadData()
}
async function fulfillSalesOrderItem(item: SalesOrderItem) {
  setError("")
  setSuccessMessage("")

  if (
    !requireSalesPermission(
      "fulfill sales orders"
    )
  ) {
    return
  }

  const orderedQuantity = Number(item.quantity || 0)
  const fulfilledQuantity = Number(item.fulfilled_quantity || 0)
  const remainingQuantity = orderedQuantity - fulfilledQuantity

  if (remainingQuantity <= 0) {
    setError("This sales order item has already been fulfilled.")
    return
  }

  if (item.inventory_item_id) {
    const inventoryItem = inventoryItems.find(
      (inventoryItem) => inventoryItem.id === item.inventory_item_id
    )

    if (!inventoryItem) {
      setError("Linked inventory item could not be found.")
      return
    }

    const currentStock = Number(inventoryItem.quantity_on_hand || 0)

    if (remainingQuantity > currentStock) {
  setError(
    `Cannot fulfill ${remainingQuantity}. Only ${currentStock} available in inventory.`
  )

  await reportAiIncident({
    incidentCode:
      "SALES_FULFILLMENT_STOCK_SHORTAGE",
    module: "sales",
    source: "fulfill_sales_order_item",
    severity: "high",
    title: "Sales fulfillment stock shortage",
    userMessage:
      "A sales order fulfillment was blocked because available inventory was insufficient.",
    technicalMessage:
      `Requested fulfillment quantity ${remainingQuantity} exceeded available stock ${currentStock}.`,
    context: {
      sales_order_id:
        item.sales_order_id,
      sales_order_item_id:
        item.id,
      inventory_item_id:
        item.inventory_item_id,
      item_name:
        item.item_name,
      ordered_quantity:
        orderedQuantity,
      fulfilled_quantity:
        fulfilledQuantity,
      requested_quantity:
        remainingQuantity,
      available_stock:
        currentStock,
      shortage_quantity:
        remainingQuantity - currentStock,
    },
  })

  return
}

    const newInventoryQuantity = currentStock - remainingQuantity

    const { error: inventoryUpdateError } = await supabase
      .from("inventory_items")
      .update({
        quantity_on_hand: newInventoryQuantity,
      })
      .eq("id", item.inventory_item_id)

    if (inventoryUpdateError) {
      setError(inventoryUpdateError.message)
      return
    }

    const { error: movementError } = await supabase
      .from("inventory_movements")
      .insert({
        organization_id: item.organization_id,
        inventory_item_id: item.inventory_item_id,
        movement_type: "out",
        quantity: remainingQuantity,
        unit_cost: inventoryItem.unit_cost || 0,
        notes: `Fulfilled sales order item: ${item.item_name}`,
      })

    if (movementError) {
      setError(movementError.message)
      return
    }
  }

  const newFulfilledQuantity = fulfilledQuantity + remainingQuantity

  const { error } = await supabase
    .from("sales_order_items")
    .update({
      fulfilled_quantity: newFulfilledQuantity,
    })
    .eq("id", item.id)

  if (error) {
    setError(error.message)
    return
  }
  const relatedItems = salesOrderItems.filter(
  (salesItem) => salesItem.sales_order_id === item.sales_order_id
)

const allItemsFulfilled = relatedItems.every((salesItem) => {
  if (salesItem.id === item.id) {
    return newFulfilledQuantity >= Number(salesItem.quantity || 0)
  }

  return (
    Number(salesItem.fulfilled_quantity || 0) >=
    Number(salesItem.quantity || 0)
  )
})

if (allItemsFulfilled && relatedItems.length > 0) {
  const { error: orderUpdateError } = await supabase
    .from("sales_orders")
    .update({
      status: "completed",
    })
    .eq("id", item.sales_order_id)

  if (orderUpdateError) {
    setError(orderUpdateError.message)
    return
  }
}

  setSuccessMessage("Sales order item fulfilled successfully.")
  await loadData()
}

async function updateSalesOrder(
  salesOrderId: string,
  updates: Partial<SalesOrder>
) {
  if (
  !requireSalesPermission(
    "update sales orders"
  )
) {
  return
}
  const { error } = await supabase
    .from("sales_orders")
    .update(updates)
    .eq("id", salesOrderId)

  if (error) {
    setError(error.message)
    return
  }

  await loadData()
}
async function archiveSalesOrder(salesOrderId: string) {
  if (
  !requireAdminPermission(
    "archive sales orders"
  )
) {
  return
}
  const confirmed = window.confirm(
    "Archive this sales order? It will be hidden from active sales views but kept for audit history."
  )

  if (!confirmed) return

  const { error } = await supabase
    .from("sales_orders")
    .update({ is_archived: true })
    .eq("id", salesOrderId)

  if (error) {
    setError(error.message)
    return
  }

  setSuccessMessage("Sales order archived successfully.")
  await loadData()
}
async function restoreSalesOrder(salesOrderId: string) {
  if (
  !requireAdminPermission(
    "restore sales orders"
  )
) {
  return
}
  const confirmed = window.confirm(
    "Restore this sales order? It will return to active sales views."
  )

  if (!confirmed) return

  const { error } = await supabase
    .from("sales_orders")
    .update({ is_archived: false })
    .eq("id", salesOrderId)

  if (error) {
    setError(error.message)
    return
  }

  setSuccessMessage("Sales order restored successfully.")
  await loadData()
}
async function updatePurchaseOrderItem(
  purchaseOrderItemId: string,
  updates: Partial<PurchaseOrderItem>
) {
  if (
  !requirePurchasingPermission(
    "update purchase-order line items"
  )
) {
  return
}
  const { error } = await supabase
    .from("purchase_order_items")
    .update(updates)
    .eq("id", purchaseOrderItemId)

  if (error) {
    setError(error.message)
    return
  }

  setError("")
  await loadData()
}
async function updatePurchaseOrder(
  purchaseOrderId: string,
  updates: Partial<PurchaseOrder>
) {
  if (
  !requirePurchasingPermission(
    "update purchase orders"
  )
) {
  return
}
  const { error } = await supabase
    .from("purchase_orders")
    .update(updates)
    .eq("id", purchaseOrderId)

  if (error) {
    setError(error.message)
    return
  }

  await loadData()
}

async function handleCreateInventoryItem(e: React.FormEvent) {
  e.preventDefault()
  setError("")
  setSuccessMessage("")

  if (
    !requireInventoryPermission(
      "create inventory items"
    )
  ) {
    return
  }

  if (!newInventorySku.trim() || !newInventoryName.trim()) return
  if (inventoryItemLimitReached) {
  setError(
    `Your ${subscriptionTier} plan allows up to ${maxInventoryItems} inventory items. Upgrade your plan to add more inventory items.`
  )
  return
}

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError("No organization loaded. Please refresh and log in again.")
    return
  }

  const { data: insertedInventoryItems, error } = await supabase
  .from("inventory_items")
  .insert({
    organization_id: orgId,
    sku: newInventorySku,
    item_name: newInventoryName,
    category:
      newInventoryCategory === "" ? null : newInventoryCategory,
    quantity_on_hand:
      newInventoryQuantity === "" ? 0 : Number(newInventoryQuantity),
    reorder_level:
      newInventoryReorderLevel === ""
        ? 0
        : Number(newInventoryReorderLevel),
    unit_cost:
      newInventoryUnitCost === ""
        ? 0
        : Number(newInventoryUnitCost),
    })
  .select("id, sku, item_name, quantity_on_hand, unit_cost")

  if (error) {
    setError(error.message)
    return
  }
  const insertedInventoryItem = insertedInventoryItems?.[0]

await recordAuditLog({
  action: "created",
  module: "Inventory",
  recordId: insertedInventoryItem?.id || null,
  recordType: "inventory_item",
  details: {
    sku: newInventorySku,
    item_name: newInventoryName,
    quantity_on_hand:
      newInventoryQuantity === ""
        ? 0
        : Number(newInventoryQuantity),
    unit_cost:
      newInventoryUnitCost === ""
        ? 0
        : Number(newInventoryUnitCost),
  },
})

  setNewInventorySku("")
  setNewInventoryName("")
  setNewInventoryCategory("")
  setNewInventoryQuantity("")
  setNewInventoryReorderLevel("")
  setNewInventoryUnitCost("")

  await loadData()
}

async function updateInventoryItem(
  inventoryItemId: string,
  updates: Partial<InventoryItem>
) {
  if (
    !requireInventoryPermission(
      "update inventory items"
    )
  ) {
    return
  }

  const currentItem = inventoryItems.find(
    (item) => item.id === inventoryItemId
  )

  const { error } = await supabase
    .from("inventory_items")
    .update(updates)
    .eq("id", inventoryItemId)

  if (error) {
    setError(error.message)
    return
  }

  const updatedItem = {
    ...currentItem,
    ...updates,
  } as InventoryItem

  const quantityOnHand = Number(updatedItem.quantity_on_hand || 0)
  const reorderLevel = Number(updatedItem.reorder_level || 0)

  if (
    currentItem &&
    reorderLevel > 0 &&
    quantityOnHand > reorderLevel
  ) {
    const { error: notificationUpdateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("related_module", "Inventory")
      .eq("related_id", inventoryItemId)
      .eq("title", "Low stock alert")
      .eq("is_read", false)

    if (notificationUpdateError) {
      setError(notificationUpdateError.message)
      return
    }
  }

  await loadData()
}
async function archiveInventoryItem(inventoryItemId: string) {
  if (
  !requireAdminPermission(
    "archive inventory items"
  )
) {
  return
}
  const confirmed = window.confirm(
    "Archive this inventory item? It will be hidden from active inventory views but kept for audit history."
  )

  if (!confirmed) return

  await updateInventoryItem(inventoryItemId, {
    status: "archived",
  })
  await recordAuditLog({
  action: "archived",
  module: "Inventory",
  recordId: inventoryItemId,
  recordType: "inventory_item",
  details: {
    status: "archived",
  },
})

  setSuccessMessage("Inventory item archived successfully.")
}

async function restoreInventoryItem(inventoryItemId: string) {
  if (
  !requireAdminPermission(
    "restore inventory items"
  )
) {
  return
}
  const confirmed = window.confirm(
    "Restore this inventory item? It will return to active inventory views."
  )

  if (!confirmed) return

  await updateInventoryItem(inventoryItemId, {
    status: "active",
  })
  await recordAuditLog({
  action: "restored",
  module: "Inventory",
  recordId: inventoryItemId,
  recordType: "inventory_item",
  details: {
    status: "active",
  },
})

  setSuccessMessage("Inventory item restored successfully.")
}

async function handleCreateInventoryMovement(e: React.FormEvent) {
  e.preventDefault()
  setError("")
  setSuccessMessage("")

  if (
    !requireInventoryPermission(
      "create inventory movements"
    )
  ) {
    return
  }

  if (!movementItemId) return

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError("No organization loaded. Please refresh and log in again.")
    return
  }

  const selectedItem = inventoryItems.find(
    (item) => item.id === movementItemId
  )
if (movementType === "out" && selectedItem) {
  const currentQuantity = Number(selectedItem.quantity_on_hand || 0)
  const requestedQuantity = Number(movementQuantity || 0)

  if (requestedQuantity > currentQuantity) {
    setError(
      `Cannot stock out ${requestedQuantity}. Only ${currentQuantity} available.`
    )
    return
  }
}
  if (!selectedItem) {
    setError("Inventory item not found.")
    return
  }

  const quantityValue = Number(movementQuantity)

  if (quantityValue <= 0) {
    setError("Movement quantity must be greater than zero.")
    return
  }

  if (
    movementType === "out" &&
    quantityValue > Number(selectedItem.quantity_on_hand || 0)
  ) {
    setError("Stock out quantity cannot exceed current quantity on hand.")
    return
  }

  const { error: movementError } = await supabase
    .from("inventory_movements")
    .insert({
      organization_id: orgId,
      inventory_item_id: movementItemId,
      movement_type: movementType,
      quantity: quantityValue,
      unit_cost: selectedItem.unit_cost || 0,
      notes: movementNotes === "" ? null : movementNotes,
    })

  if (movementError) {
    setError(movementError.message)
    return
  }

  const newQuantity =
    movementType === "out"
      ? Number(selectedItem.quantity_on_hand || 0) - quantityValue
      : Number(selectedItem.quantity_on_hand || 0) + quantityValue

  const { error: updateError } = await supabase
    .from("inventory_items")
    .update({
      quantity_on_hand: newQuantity,
    })
    .eq("id", movementItemId)

  if (updateError) {
    setError(updateError.message)
    return
  }
    if (newQuantity <= Number(selectedItem.reorder_level || 0)) {
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        organization_id: orgId,
        title: "Low stock alert",
        message: `${selectedItem.item_name} is at or below its reorder level.`,
        type: "warning",
        related_module: "Inventory",
        related_id: selectedItem.id,
        is_read: false,
      })

        if (notificationError) {
      setError(notificationError.message)
      return
    }
  } else {
    const { error: notificationUpdateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("related_module", "Inventory")
      .eq("related_id", selectedItem.id)
      .eq("title", "Low stock alert")
      .eq("is_read", false)

    if (notificationUpdateError) {
      setError(notificationUpdateError.message)
      return
    }
  }

  setMovementItemId("") 
  setMovementType("in")
  setMovementQuantity(0)
  setMovementNotes("")

   await loadData()
}

async function handleCreateVendorBill() {
  setError("")
  setSuccessMessage("")

  if (
    !requireFinancePermission(
      "create vendor bills"
    )
  ) {
    return
  }

  const orgId = organizationId || localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError("No organization loaded. Please refresh and log in again.")
    return
  }

  if (!newVendorBillSupplierId) {
    setError("Please select a supplier.")
    return
  }

  if (!newVendorBillAmount || Number(newVendorBillAmount) <= 0) {
    setError("Bill amount must be greater than zero.")
    return
  }

  const { data: insertedVendorBills, error } = await supabase
  .from("vendor_bills")
  .insert({
      organization_id: orgId,
      supplier_id: newVendorBillSupplierId,
      purchase_order_id:
        newVendorBillPurchaseOrderId === ""
          ? null
          : newVendorBillPurchaseOrderId,
      amount: Number(newVendorBillAmount),
      status: newVendorBillStatus,
      due_date:
        newVendorBillDueDate === ""
          ? null
          : newVendorBillDueDate,
      notes:
        newVendorBillNotes.trim() === ""
          ? null
          : newVendorBillNotes.trim(),
        })
    .select("id, supplier_id, amount, status, due_date")

  if (error) {
  setError(error.message)

  await reportFinancialWriteFailure({
    source:
      "create_vendor_bill",
    title:
      "Vendor bill creation failed",
    technicalMessage:
      error.message,
    context: {
      supplier_id:
        newVendorBillSupplierId,
      purchase_order_id:
        newVendorBillPurchaseOrderId || null,
      attempted_amount:
        Number(newVendorBillAmount || 0),
      attempted_status:
        newVendorBillStatus,
      due_date:
        newVendorBillDueDate || null,
      failure_stage:
        "vendor_bill_insert",
    },
  })

  return
}
 const insertedVendorBill = insertedVendorBills?.[0]

await recordAuditLog({
  action: "created",
  module: "Finance",
  recordId: insertedVendorBill?.id || null,
  recordType: "vendor_bill",
  details: {
    supplier_id: newVendorBillSupplierId,
    purchase_order_id:
      newVendorBillPurchaseOrderId === ""
        ? null
        : newVendorBillPurchaseOrderId,
    amount: Number(newVendorBillAmount),
    status: newVendorBillStatus,
    due_date:
      newVendorBillDueDate === ""
        ? null
        : newVendorBillDueDate,
  },
})

  setNewVendorBillSupplierId("")
  setNewVendorBillPurchaseOrderId("")
  setNewVendorBillAmount("")
  setNewVendorBillStatus("unpaid")
  setNewVendorBillDueDate("")
  setNewVendorBillNotes("")
  setError("")
  setSuccessMessage("Vendor bill created successfully.")


  await loadData()
}

async function updateVendorBill(
  id: string,
  updates: Partial<VendorBill>
) {
  if (
    !requireFinancePermission(
      "update vendor bills"
    )
  ) {
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  const currentBill = vendorBills.find((bill) => bill.id === id)

  const { error } = await supabase
    .from("vendor_bills")
    .update(updates)
    .eq("id", id)

  if (error) {
    setError(error.message)
    return
  }

  const updatedBill = {
    ...currentBill,
    ...updates,
  } as VendorBill

  const dueDate = updatedBill.due_date
    ? new Date(updatedBill.due_date)
    : null

  const isOverdue =
    dueDate &&
    dueDate < new Date() &&
    getVendorBillCalculatedStatus(updatedBill) !== "paid" &&
    updatedBill.status !== "archived"

  if (orgId && currentBill && isOverdue) {
    const existingOverdueNotification = notifications.find(
      (notification) =>
        notification.related_module === "Finance" &&
        notification.related_id === id &&
        notification.title === "Overdue vendor bill" &&
        !notification.is_read
    )

    if (!existingOverdueNotification) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          organization_id: orgId,
          title: "Overdue vendor bill",
          message: `A vendor bill for $${Number(
            updatedBill.amount || 0
          ).toFixed(2)} is overdue.`,
          type: "warning",
          related_module: "Finance",
          related_id: id,
          is_read: false,
        })

      if (notificationError) {
        setError(notificationError.message)
        return
      }
    }
  } else if (currentBill) {
    const { error: notificationUpdateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("related_module", "Finance")
      .eq("related_id", id)
      .eq("title", "Overdue vendor bill")
      .eq("is_read", false)

    if (notificationUpdateError) {
      setError(notificationUpdateError.message)
      return
    }
  }

  setError("")
  await loadData()
}
async function archiveVendorBill(billId: string) {
  if (
    !requireAdminPermission(
      "archive vendor bills"
    )
  ) {
    return
  }
  const confirmed = window.confirm(
    "Archive this vendor bill? It will be hidden from active finance views but kept for audit history."
  )

  if (!confirmed) return

  await updateVendorBill(billId, {
    status: "archived",
  })
  await recordAuditLog({
  action: "archived",
  module: "Finance",
  recordId: billId,
  recordType: "vendor_bill",
  details: {
    status: "archived",
  },
})

  setSuccessMessage("Vendor bill archived successfully.")
}

async function restoreVendorBill(billId: string) {
  if (
    !requireAdminPermission(
      "restore vendor bills"
    )
  ) {
    return
  }
  const confirmed = window.confirm(
    "Restore this vendor bill? It will return to active finance views."
  )

  if (!confirmed) return

  await updateVendorBill(billId, {
    status: "unpaid",
  })
  await recordAuditLog({
  action: "restored",
  module: "Finance",
  recordId: billId,
  recordType: "vendor_bill",
  details: {
    status: "unpaid",
  },
})

  setSuccessMessage("Vendor bill restored successfully.")
}

async function createCustomerInvoice() {
  setError("")
setSuccessMessage("")

if (
  !requireFinancePermission(
    "create customer invoices"
  )
) {
  return
}
if (monthlyInvoiceLimitReached) {
  setError(
    `Your ${subscriptionTier} plan allows up to ${maxMonthlyInvoices} customer invoices per month. Upgrade your plan to continue creating invoices.`
  )
  return
}

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError("No organization loaded. Please refresh and log in again.")
    return
  }

  if (!newCustomerInvoiceSalesOrderId) {
    setError("Please select a completed sales order.")
    return
  }

  const selectedSalesOrder = salesOrders.find(
    (order) => order.id === newCustomerInvoiceSalesOrderId
  )

  if (!selectedSalesOrder) {
    setError("Selected sales order could not be found.")
    return
  }

  if (selectedSalesOrder.status !== "completed") {
    setError("Only completed sales orders can be invoiced.")
    return
  }

  const existingInvoice = customerInvoices.find(
    (invoice) =>
      invoice.sales_order_id === selectedSalesOrder.id &&
      invoice.status !== "cancelled"
  )

  if (existingInvoice) {
    setError("This sales order already has an active invoice.")
    return
  }

  const invoiceAmount = getSalesOrderItemTotal(selectedSalesOrder.id)

  if (invoiceAmount <= 0) {
    setError("Invoice amount must be greater than zero.")
    return
  }
  const recordedSalesOrderTotal =
  Number(selectedSalesOrder.total_amount || 0)

const hasRecordedSalesOrderTotal =
  recordedSalesOrderTotal > 0

const totalDifference =
  Math.abs(
    recordedSalesOrderTotal - invoiceAmount
  )

if (
  hasRecordedSalesOrderTotal &&
  totalDifference > 0.01
) {
  setError(
    "The sales order total does not match its line-item total. Review the order before creating an invoice."
  )

  await reportAiIncident({
    incidentCode:
      "ORDER_INVOICE_TOTAL_MISMATCH",
    module: "finance",
    source: "create_customer_invoice",
    severity: "high",
    title: "Sales order and invoice total mismatch",
    userMessage:
      "Invoice creation was blocked because the sales-order total did not match the calculated line-item value.",
    technicalMessage:
      `Recorded sales-order total ${recordedSalesOrderTotal} did not match calculated invoice amount ${invoiceAmount}.`,
    context: {
      sales_order_id:
        selectedSalesOrder.id,
      order_number:
        selectedSalesOrder.order_number,
      client_id:
        selectedSalesOrder.client_id,
      recorded_order_total:
        recordedSalesOrderTotal,
      calculated_line_item_total:
        invoiceAmount,
      difference:
        totalDifference,
      attempted_invoice_number:
        newCustomerInvoiceNumber.trim() || null,
    },
  })

  return
}

  const invoiceNumber =
    newCustomerInvoiceNumber.trim() ||
    `INV-${selectedSalesOrder.order_number}`

  const { data: insertedCustomerInvoices, error } = await supabase
  .from("customer_invoices")
  .insert({
      organization_id: orgId,
      sales_order_id: selectedSalesOrder.id,
      client_id: selectedSalesOrder.client_id,
      invoice_number: invoiceNumber,
      amount: invoiceAmount,
      status: "draft",
      due_date:
        newCustomerInvoiceDueDate === ""
          ? null
          : newCustomerInvoiceDueDate,
      notes:
        newCustomerInvoiceNotes.trim() === ""
          ? null
          : newCustomerInvoiceNotes.trim(),
        })
    .select("id, sales_order_id, client_id, invoice_number, amount, status")

  if (error) {
    setError(error.message)
    return
  }
  const insertedCustomerInvoice = insertedCustomerInvoices?.[0]

await recordAuditLog({
  action: "created",
  module: "Finance",
  recordId: insertedCustomerInvoice?.id || null,
  recordType: "customer_invoice",
  details: {
    sales_order_id: selectedSalesOrder.id,
    client_id: selectedSalesOrder.client_id,
    invoice_number: invoiceNumber,
    amount: invoiceAmount,
    status: "draft",
    due_date:
      newCustomerInvoiceDueDate === ""
        ? null
        : newCustomerInvoiceDueDate,
  },
})

  setNewCustomerInvoiceSalesOrderId("")
  setNewCustomerInvoiceNumber("")
  setNewCustomerInvoiceDueDate("")
  setNewCustomerInvoiceNotes("")
  setSuccessMessage("Customer invoice created successfully.")

  await loadData()
}
async function updateCustomerInvoice(
  id: string,
  updates: Partial<CustomerInvoice>
) {
  if (!requireFinancePermission("update customer invoices")) {
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  const currentInvoice = customerInvoices.find(
    (invoice) => invoice.id === id
  )

  const { error } = await supabase
    .from("customer_invoices")
    .update(updates)
    .eq("id", id)

  if (error) {
    setError(error.message)
    return
  }

  const updatedInvoice = {
    ...currentInvoice,
    ...updates,
  } as CustomerInvoice

  const dueDate = updatedInvoice.due_date
    ? new Date(updatedInvoice.due_date)
    : null

  const isOverdue =
    dueDate &&
    dueDate < new Date() &&
    getCustomerInvoiceCalculatedStatus(updatedInvoice) !== "paid" &&
    updatedInvoice.status !== "cancelled"

  if (orgId && currentInvoice && isOverdue) {
    const existingOverdueNotification = notifications.find(
      (notification) =>
        notification.related_module === "Finance" &&
        notification.related_id === id &&
        notification.title === "Overdue customer invoice" &&
        !notification.is_read
    )

    if (!existingOverdueNotification) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          organization_id: orgId,
          title: "Overdue customer invoice",
          message: `A customer invoice for $${Number(
            updatedInvoice.amount || 0
          ).toFixed(2)} is overdue.`,
          type: "warning",
          related_module: "Finance",
          related_id: id,
          is_read: false,
        })

      if (notificationError) {
        setError(notificationError.message)
        return
      }
      await reportAiIncident({
  incidentCode:
    "OVERDUE_RECEIVABLE_RISK",
  module: "finance",
  source: "update_customer_invoice",
  severity: "medium",
  title: "Overdue customer receivable",
  userMessage:
    "A customer invoice is overdue and may create cash-flow or customer-retention risk.",
  technicalMessage:
    `Invoice ${updatedInvoice.invoice_number} is overdue with a remaining balance of ${getCustomerInvoiceBalance(updatedInvoice)}.`,
  context: {
    customer_invoice_id:
      id,
    invoice_number:
      updatedInvoice.invoice_number,
    client_id:
      updatedInvoice.client_id,
    invoice_amount:
      Number(updatedInvoice.amount || 0),
    remaining_balance:
      getCustomerInvoiceBalance(updatedInvoice),
    due_date:
      updatedInvoice.due_date,
    calculated_status:
      getCustomerInvoiceCalculatedStatus(
        updatedInvoice
      ),
  },
})
    }
    } else if (currentInvoice) {
    const { error: notificationUpdateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("related_module", "Finance")
      .eq("related_id", id)
      .eq("title", "Overdue customer invoice")
      .eq("is_read", false)

    if (notificationUpdateError) {
      setError(notificationUpdateError.message)
      return
    }
  }

  setError("")
  await loadData()
}
async function archiveCustomerInvoice(invoiceId: string) {
  if (
    !requireAdminPermission(
      "archive customer invoices"
    )
  ) {
    return
  }

  const confirmed = window.confirm(
    "Archive this customer invoice? It will be hidden from active finance views but kept for audit history."
  )

  if (!confirmed) return

  const { error } = await supabase
    .from("customer_invoices")
    .update({ is_archived: true })
    .eq("id", invoiceId)

  if (error) {
    setError(error.message)
    return
  }
  await recordAuditLog({
  action: "archived",
  module: "Finance",
  recordId: invoiceId,
  recordType: "customer_invoice",
  details: {
    is_archived: true,
  },
})

  setSuccessMessage("Customer invoice archived successfully.")
  await loadData()
}

async function restoreCustomerInvoice(invoiceId: string) {
  if (
    !requireAdminPermission(
      "restore customer invoices"
    )
  ) {
    return
  }

  const confirmed = window.confirm(
    "Restore this customer invoice? It will return to active finance views."
  )

  if (!confirmed) return

  const { error } = await supabase
    .from("customer_invoices")
    .update({ is_archived: false })
    .eq("id", invoiceId)

  if (error) {
    setError(error.message)
    return
  }
  await recordAuditLog({
  action: "restored",
  module: "Finance",
  recordId: invoiceId,
  recordType: "customer_invoice",
  details: {
    is_archived: false,
  },
})

  setSuccessMessage("Customer invoice restored successfully.")
  await loadData()
}
async function createCustomerInvoicePayment() {
  setError("")
  setSuccessMessage("")

  if (
    !requireFinancePermission(
      "create customer payments"
    )
  ) {
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError("No organization loaded. Please refresh and log in again.")
    return
  }

  if (!newCustomerPaymentInvoiceId) {
    setError("Please select a customer invoice.")
    return
  }

  if (!newCustomerPaymentAmount || Number(newCustomerPaymentAmount) <= 0) {
    setError("Payment amount must be greater than zero.")
    return
  }

  const selectedInvoice = customerInvoices.find(
    (invoice) => invoice.id === newCustomerPaymentInvoiceId
  )

  if (!selectedInvoice) {
    setError("Please select a valid customer invoice.")
    return
  }

  const paymentAmount = Number(newCustomerPaymentAmount)
  const invoiceBalance = getCustomerInvoiceBalance(selectedInvoice)

  if (paymentAmount > invoiceBalance) {
  setError(
    `Payment cannot exceed remaining invoice balance of $${invoiceBalance.toFixed(2)}.`
  )

  await reportAiIncident({
    incidentCode:
      "CUSTOMER_PAYMENT_OVERPAYMENT_BLOCKED",
    module: "finance",
    source: "create_customer_invoice_payment",
    severity: "high",
    title: "Customer payment overpayment blocked",
    userMessage:
      "A customer payment was blocked because it exceeded the remaining invoice balance.",
    technicalMessage:
      `Attempted payment ${paymentAmount} exceeded invoice balance ${invoiceBalance}.`,
    context: {
      customer_invoice_id:
        newCustomerPaymentInvoiceId,
      invoice_number:
        selectedInvoice.invoice_number,
      invoice_amount:
        Number(selectedInvoice.amount || 0),
      remaining_balance:
        invoiceBalance,
      attempted_payment:
        paymentAmount,
      payment_method:
        newCustomerPaymentMethod,
    },
  })

  return
}

  const { data: insertedCustomerPayments, error } = await supabase
  .from("customer_invoice_payments")
  .insert({
      organization_id: orgId,
      customer_invoice_id: newCustomerPaymentInvoiceId,
      amount: paymentAmount,
      payment_date:
        newCustomerPaymentDate === ""
          ? null
          : newCustomerPaymentDate,
      payment_method: newCustomerPaymentMethod,
      notes:
        newCustomerPaymentNotes.trim() === ""
          ? null
          : newCustomerPaymentNotes.trim(),
        })
    .select("id, customer_invoice_id, amount, payment_method, payment_date")

  if (error) {
  setError(error.message)

  await reportFinancialWriteFailure({
    source:
      "create_customer_invoice_payment_insert",
    title:
      "Customer payment write failed",
    technicalMessage:
      error.message,
    context: {
      customer_invoice_id:
        newCustomerPaymentInvoiceId,
      attempted_payment:
        paymentAmount,
      payment_method:
        newCustomerPaymentMethod,
      payment_date:
        newCustomerPaymentDate || null,
      failure_stage:
        "payment_insert",
    },
  })

  return
}
const insertedCustomerPayment = insertedCustomerPayments?.[0]

await recordAuditLog({
  action: "created",
  module: "Finance",
  recordId: insertedCustomerPayment?.id || null,
  recordType: "customer_payment",
  details: {
    customer_invoice_id: newCustomerPaymentInvoiceId,
    invoice_number: selectedInvoice.invoice_number,
    amount: paymentAmount,
    payment_method: newCustomerPaymentMethod,
    payment_date:
      newCustomerPaymentDate === ""
        ? null
        : newCustomerPaymentDate,
  },
})

  const newPaidAmount =
    getCustomerInvoicePaidAmount(newCustomerPaymentInvoiceId) +
    paymentAmount

  const selectedInvoiceAmount = Number(selectedInvoice.amount || 0)

  const newInvoiceStatus =
    newPaidAmount >= selectedInvoiceAmount
      ? "paid"
      : newPaidAmount > 0
      ? "partial"
      : "draft"

  const { error: invoiceUpdateError } = await supabase
    .from("customer_invoices")
    .update({
      status: newInvoiceStatus,
    })
    .eq("id", newCustomerPaymentInvoiceId)

  if (invoiceUpdateError) {
  setError(invoiceUpdateError.message)

  await reportFinancialWriteFailure({
    source:
      "create_customer_invoice_payment_status_update",
    title:
      "Customer invoice status update failed",
    technicalMessage:
      invoiceUpdateError.message,
    context: {
      customer_invoice_id:
        newCustomerPaymentInvoiceId,
      payment_amount:
        paymentAmount,
      calculated_invoice_status:
        newInvoiceStatus,
      failure_stage:
        "invoice_status_update",
    },
  })

  return
}

  setNewCustomerPaymentInvoiceId("")
  setNewCustomerPaymentAmount("")
  setNewCustomerPaymentDate("")
  setNewCustomerPaymentMethod("manual")
  setNewCustomerPaymentNotes("")
  setSuccessMessage("Customer payment recorded successfully.")

  await loadData()
}
async function handleCreateVendorPayment() {
  setError("")
  setSuccessMessage("")

  if (
    !requireFinancePermission(
      "create vendor payments"
    )
  ) {
    return
  }

  const orgId = organizationId || localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError("No organization loaded. Please refresh and log in again.")
    return
  }

  if (!newVendorPaymentBillId) {
    setError("Please select a vendor bill.")
    return
  }

  if (!newVendorPaymentAmount || Number(newVendorPaymentAmount) <= 0) {
    setError("Payment amount must be greater than zero.")
    return
  }
  const selectedBill = vendorBills.find(
  (bill) => bill.id === newVendorPaymentBillId
)

if (!selectedBill) {
  setError("Please select a valid vendor bill.")
  return
}

const paymentAmount = Number(newVendorPaymentAmount)
const billBalance = getVendorBillBalance(selectedBill)

if (paymentAmount > billBalance) {
  setError(
    `Payment cannot exceed remaining bill balance of $${billBalance.toFixed(2)}.`
  )

  await reportAiIncident({
    incidentCode:
      "VENDOR_PAYMENT_OVERPAYMENT_BLOCKED",
    module: "finance",
    source: "handle_create_vendor_payment",
    severity: "high",
    title: "Vendor payment overpayment blocked",
    userMessage:
      "A vendor payment was blocked because it exceeded the remaining bill balance.",
    technicalMessage:
      `Attempted payment ${paymentAmount} exceeded vendor bill balance ${billBalance}.`,
    context: {
      vendor_bill_id:
        newVendorPaymentBillId,
      supplier_id:
        selectedBill.supplier_id || null,
      bill_amount:
        Number(selectedBill.amount || 0),
      remaining_balance:
        billBalance,
      attempted_payment:
        paymentAmount,
      payment_method:
        newVendorPaymentMethod,
    },
  })

  return
}
const duplicatePaymentDate =
  newVendorPaymentDate === ""
    ? null
    : newVendorPaymentDate

let duplicatePaymentQuery = supabase
  .from("vendor_payments")
  .select(
    "id, amount, payment_date, payment_method, created_at"
  )
  .eq("organization_id", orgId)
  .eq("vendor_bill_id", newVendorPaymentBillId)
  .eq("amount", paymentAmount)
  .eq("payment_method", newVendorPaymentMethod)

if (duplicatePaymentDate) {
  duplicatePaymentQuery =
    duplicatePaymentQuery.eq(
      "payment_date",
      duplicatePaymentDate
    )
} else {
  duplicatePaymentQuery =
    duplicatePaymentQuery.is(
      "payment_date",
      null
    )
}

const {
  data: possibleDuplicatePayments,
  error: duplicatePaymentLookupError,
} = await duplicatePaymentQuery.limit(1)

if (duplicatePaymentLookupError) {
  console.error(
    "DUPLICATE VENDOR PAYMENT LOOKUP ERROR:",
    duplicatePaymentLookupError
  )
}

if (
  !duplicatePaymentLookupError &&
  possibleDuplicatePayments &&
  possibleDuplicatePayments.length > 0
) {
  const possibleDuplicate =
    possibleDuplicatePayments[0]

  setError(
    "A possible duplicate vendor payment was detected. Review the existing payment before continuing."
  )

  await reportAiIncident({
    incidentCode:
      "DUPLICATE_VENDOR_PAYMENT_RISK",
    module: "finance",
    source: "handle_create_vendor_payment",
    severity: "high",
    title: "Possible duplicate vendor payment",
    userMessage:
      "A vendor payment was blocked because it matched an existing payment for the same bill.",
    technicalMessage:
      `Payment amount ${paymentAmount}, method ${newVendorPaymentMethod}, and payment date ${duplicatePaymentDate || "null"} matched an existing vendor payment.`,
    context: {
      vendor_bill_id:
        newVendorPaymentBillId,
      supplier_id:
        selectedBill.supplier_id || null,
      existing_payment_id:
        possibleDuplicate.id,
      attempted_payment:
        paymentAmount,
      payment_method:
        newVendorPaymentMethod,
      payment_date:
        duplicatePaymentDate,
      existing_payment_created_at:
        possibleDuplicate.created_at,
    },
  })

  return
}

  const { data: insertedVendorPayments, error } = await supabase
  .from("vendor_payments")
  .insert({
      organization_id: orgId,
      vendor_bill_id: newVendorPaymentBillId,
      amount: paymentAmount,
      payment_date:
        newVendorPaymentDate === ""
          ? null
          : newVendorPaymentDate,
      payment_method: newVendorPaymentMethod,
      notes:
        newVendorPaymentNotes.trim() === ""
          ? null
          : newVendorPaymentNotes.trim(),
        })
    .select("id, vendor_bill_id, amount, payment_method, payment_date")

 if (error) {
  setError(error.message)

  await reportFinancialWriteFailure({
    source:
      "create_vendor_payment_insert",
    title:
      "Vendor payment write failed",
    technicalMessage:
      error.message,
    context: {
      vendor_bill_id:
        newVendorPaymentBillId,
      supplier_id:
        selectedBill.supplier_id || null,
      attempted_payment:
        paymentAmount,
      payment_method:
        newVendorPaymentMethod,
      payment_date:
        newVendorPaymentDate || null,
      failure_stage:
        "payment_insert",
    },
  })

  return
}
const insertedVendorPayment = insertedVendorPayments?.[0]

await recordAuditLog({
  action: "created",
  module: "Finance",
  recordId: insertedVendorPayment?.id || null,
  recordType: "vendor_payment",
  details: {
    vendor_bill_id: newVendorPaymentBillId,
    supplier_id: selectedBill.supplier_id || null,
    amount: paymentAmount,
    payment_method: newVendorPaymentMethod,
    payment_date:
      newVendorPaymentDate === ""
        ? null
        : newVendorPaymentDate,
  },
})

  const newPaidAmount =
  getVendorBillPaidAmount(newVendorPaymentBillId) + paymentAmount

const selectedBillAmount = Number(selectedBill.amount || 0)

const newBillStatus =
  newPaidAmount >= selectedBillAmount
    ? "paid"
    : newPaidAmount > 0
    ? "partial"
    : "unpaid"

const { error: billUpdateError } = await supabase
  .from("vendor_bills")
  .update({
    status: newBillStatus,
  })
  .eq("id", newVendorPaymentBillId)

if (billUpdateError) {
  setError(billUpdateError.message)

  await reportFinancialWriteFailure({
    source:
      "create_vendor_payment_status_update",
    title:
      "Vendor bill status update failed",
    technicalMessage:
      billUpdateError.message,
    context: {
      vendor_bill_id:
        newVendorPaymentBillId,
      payment_amount:
        paymentAmount,
      calculated_bill_status:
        newBillStatus,
      failure_stage:
        "vendor_bill_status_update",
    },
  })

  return
}

  setNewVendorPaymentBillId("")
  setNewVendorPaymentAmount("")
  setNewVendorPaymentDate("")
  setNewVendorPaymentMethod("manual")
  setNewVendorPaymentNotes("")
  setError("")
  setSuccessMessage("Vendor payment recorded successfully.")

  await loadData()
}
async function handleReceiveInventory(e: React.FormEvent) {
  e.preventDefault()

  setError("")
  setReceiveSuccess("")

  if (!requirePurchasingPermission("receive purchase-order inventory")) {
    return
  }

  if (!receivePoId) {
    setError("Please select a purchase order.")
    return
  }

  if (!receivePurchaseOrderItemId) {
    setError("Please select a purchase order item.")
    return
  }

  const selectedPOItem = purchaseOrderItems.find(
    (item) => item.id === receivePurchaseOrderItemId
  )

  if (!selectedPOItem) {
    setError("Please select a purchase order item.")
    return
  }

const orderedQty = Number(selectedPOItem.quantity || 0)
const alreadyReceivedQty = Number(selectedPOItem.received_quantity || 0)
const remainingQty = orderedQty - alreadyReceivedQty
const quantity = Number(receiveQuantity)

if (!quantity || quantity <= 0) {
  setError("Receive quantity must be greater than 0.")
  return
}

if (quantity > remainingQty) {
  setError(
    `Cannot receive ${quantity}. Only ${remainingQty} remaining on this purchase order item.`
  )

  await reportAiIncident({
    incidentCode:
      "PURCHASE_ORDER_OVER_RECEIPT_BLOCKED",
    module: "purchasing",
    source: "receive_inventory",
    severity: "high",
    title: "Purchase-order over-receipt blocked",
    userMessage:
      "A receiving transaction was blocked because the quantity exceeded the remaining purchase-order quantity.",
    technicalMessage:
      `Attempted receipt quantity ${quantity} exceeded remaining quantity ${remainingQty}.`,
    context: {
      purchase_order_id:
        receivePoId,
      purchase_order_item_id:
        receivePurchaseOrderItemId,
      inventory_item_id:
        receiveInventoryItemId || null,
      item_name:
        selectedPOItem.item_name,
      ordered_quantity:
        orderedQty,
      already_received:
        alreadyReceivedQty,
      remaining_quantity:
        remainingQty,
      attempted_receipt:
        quantity,
      excess_quantity:
        quantity - remainingQty,
    },
  })

  return
}

 // existing receive logic continues below here

const selectedPo = purchaseOrders.find(
  (po) => po.id === receivePoId
)

if (selectedPo?.status === "received") {
  setError("This purchase order has already been received.")
  return
}

if (!receiveInventoryItemId) {
  setError("Please select an inventory item.")
  return
}

if (!quantity || quantity <= 0) {
  setError("Receiving quantity must be greater than zero.")
  return
}

const item = inventoryItems.find(
  (inventoryItem) => inventoryItem.id === receiveInventoryItemId
)

if (!item) {
  setError("Selected inventory item could not be found.")
  return
}

const currentQuantity = Number(item.quantity_on_hand || 0)
const newQuantity = currentQuantity + quantity

const { data: insertedInventoryMovements, error: movementError } = await supabase
  .from("inventory_movements")
  .insert({
    organization_id: organizationId || localStorage.getItem("erp_org_id"),
    inventory_item_id: receiveInventoryItemId,
    movement_type: "in",
    quantity,
    notes:
      receiveNotes ||
      `Received from purchase order ${
        purchaseOrders.find((po) => po.id === receivePoId)?.po_number || ""
      }`,
    })
  .select("id, inventory_item_id, movement_type, quantity")

if (movementError) {
  setError(movementError.message)
  return
}
const insertedInventoryMovement = insertedInventoryMovements?.[0]

await recordAuditLog({
  action: "created",
  module: "Inventory",
  recordId: insertedInventoryMovement?.id || null,
  recordType: "inventory_movement",
  details: {
    source: "purchase_order_receiving",
    purchase_order_id: receivePoId,
    purchase_order_item_id: receivePurchaseOrderItemId,
    inventory_item_id: receiveInventoryItemId,
    movement_type: "in",
    quantity,
    previous_quantity: currentQuantity,
    new_quantity: newQuantity,
  },
})

const { error: updateInventoryError } = await supabase
  .from("inventory_items")
  .update({
    quantity_on_hand: newQuantity,
  })
  .eq("id", receiveInventoryItemId)

if (updateInventoryError) {
  setError(updateInventoryError.message)
  return
}

const newReceivedQty = alreadyReceivedQty + quantity

const { error: poItemUpdateError } = await supabase
  .from("purchase_order_items")
  .update({
    received_quantity: newReceivedQty,
  })
  .eq("id", receivePurchaseOrderItemId)

if (poItemUpdateError) {
  console.error("PO ITEM RECEIVE UPDATE ERROR:", poItemUpdateError)
  setError(poItemUpdateError.message)
  return
}

const newStatus = newReceivedQty >= orderedQty ? "received" : "ordered"

const { error: updatePoError } = await supabase
  .from("purchase_orders")
  .update({
    status: newStatus,
  })
  .eq("id", receivePoId)

if (updatePoError) {
  setError(updatePoError.message)
  return
}

setReceivePoId("")
setReceiveInventoryItemId("")
setReceiveQuantity("")
setReceiveNotes("")
setError("")

setReceiveSuccess("Inventory received successfully.")

await loadData()
}

async function handleInventoryFileUpload(
  e: React.ChangeEvent<HTMLInputElement>
) {

  const file = e.target.files?.[0]

if (!file) {
  setSelectedInventoryFileName("")
  setInventoryUploadErrors(["No file selected."])
  return
}

setSelectedInventoryFileName(file.name)

  setInventoryUploadSuccess("")
  setInventoryUploadErrors([])
  setInventoryUploadRows([])
  setError("")

  let rows: any[] = []

if (file.name.toLowerCase().endsWith(".csv")) {
  const text = await file.text()

  const normalized = text.replace(/\r/g, "").trim()

  const lines = normalized
    .split("\n")
    .filter((line) => line.trim() !== "")

  if (lines.length < 2) {
    setInventoryUploadErrors(["CSV file contains no data rows."])
    return
  }

  const headers = lines[0]
    .split(",")
    .map((header) => header.trim().toLowerCase())

  rows = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]
      .split(",")
      .map((value) => value.trim())

    const row: any = {}

    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })

    rows.push(row)
  }
} else {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]

  rows = XLSX.utils.sheet_to_json<any>(worksheet, {
    defval: "",
  })
}

  const errors: string[] = []

  const cleanedRows = rows.map((row, index) => {
  const sku = String(row.sku || row.SKU || "").trim()
  const itemName = String(
      row.item_name || row["Item Name"] || row.name || ""
    ).trim()

    const category = String(row.category || row.Category || "").trim()

    const quantity = Number(
      row.quantity_on_hand ||
        row["Quantity On Hand"] ||
        row.quantity ||
        0
    )
    const reorderLevel = Number(
  row.reorder_level ||
    row["Reorder Level"] ||
    row.reorder ||
    0
)

const unitCost = Number(
  row.unit_cost ||
    row["Unit Cost"] ||
    row.cost ||
    0
)
    if (!sku) {
      errors.push(`Row ${index + 2}: Missing SKU`)
    }

    if (!itemName) {
      errors.push(`Row ${index + 2}: Missing item name`)
    }

    return {
      sku,
      item_name: itemName,
      category: category || null,
      quantity_on_hand: Number.isNaN(quantity) ? 0 : quantity,
      reorder_level: Number.isNaN(reorderLevel) ? 0 : reorderLevel,
      unit_cost: Number.isNaN(unitCost) ? 0 : unitCost,
    }
  })

  const validationErrors: string[] = []

cleanedRows.forEach((row, index) => {
  if (!row.sku) {
    validationErrors.push(`Row ${index + 1}: SKU is required.`)
  }

  if (!row.item_name) {
    validationErrors.push(`Row ${index + 1}: Item name is required.`)
  }

  if (row.quantity_on_hand < 0) {
    validationErrors.push(`Row ${index + 1}: Quantity cannot be negative.`)
  }

  if (row.reorder_level < 0) {
    validationErrors.push(`Row ${index + 1}: Reorder level cannot be negative.`)
  }

  if (row.unit_cost < 0) {
    validationErrors.push(`Row ${index + 1}: Unit cost cannot be negative.`)
  }
})
if (validationErrors.length > 0) {
  setInventoryUploadErrors(validationErrors)
  setInventoryUploadRows([])
  return
}
setInventoryUploadErrors([])
setInventoryUploadRows(cleanedRows)
setInventoryUploadSuccess(`${cleanedRows.length} row(s) ready to preview.`)
e.target.value = ""
}

async function importInventoryRows() {
  if (inventoryUploadErrors.length > 0) {
    setError("Fix upload errors before importing.")
    return
  }

  if (inventoryUploadRows.length === 0) {
    setError("No inventory rows ready to import.")
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError("No organization loaded. Please refresh and log in again.")
    return
  }

  setUploadingInventory(true)
  setError("")
const existingSkus = inventoryItems.map((item) => item.sku.toLowerCase())

const duplicateRows = inventoryUploadRows.filter((row) =>
  existingSkus.includes(String(row.sku).toLowerCase())
)

if (duplicateRows.length > 0 && !updateExistingInventory) {
  setError(
  `Duplicate SKU(s) found: ${duplicateRows
    .map((row) => row.sku)
    .join(", ")}. Remove them from the upload file or check "Update existing SKUs" before importing.`
)
  setUploadingInventory(false)
  return
}

  const rowsToInsert = inventoryUploadRows.map((row) => ({
  organization_id: orgId,
  sku: row.sku,
  item_name: row.item_name,
  category: row.category,
  quantity_on_hand: row.quantity_on_hand,
  reorder_level: row.reorder_level,
  unit_cost: row.unit_cost,
}))

let importError = null

if (updateExistingInventory) {
  const { error } = await supabase
    .from("inventory_items")
    .upsert(rowsToInsert, {
      onConflict: "organization_id,sku",
    })

  importError = error
} else {
  const { error } = await supabase
    .from("inventory_items")
    .insert(rowsToInsert)

  importError = error
}

if (importError) {
  setError(importError.message)
  setUploadingInventory(false)
  return
}

setInventoryUploadRows([])
setInventoryUploadErrors([])
setUploadingInventory(false)
setInventoryUploadSuccess("Inventory import completed successfully.")
setLastInventoryImportTime(new Date().toLocaleString())
const fileInput = document.getElementById(
  "inventory-upload-input"
) as HTMLInputElement | null

if (fileInput) {
  fileInput.value = ""
}

await loadData()
  }

async function updateMyProfile(e: React.FormEvent) {
  e.preventDefault()

  if (!currentTeamMember?.id) {
    setError("No profile found for this user.")
    return
  }

  const { error } = await supabase
    .from("team_members")
    .update({
      full_name: profileName,
      phone: profilePhone,
      job_title: profileJobTitle,
    })
    .eq("id", currentTeamMember.id)

  if (error) {
    setError(error.message)
    return
  }

  setProfileSaved(true)
await loadData()
}

async function resendUserInvitation(
  invitation: UserInvitation
) {
  setError("")
  setSuccessMessage("")

  if (
    !requireAdminPermission(
      "resend user invitations"
    )
  ) {
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError(
      "No organization loaded. Please refresh and log in again."
    )
    return
  }

  if (seatLimitReached) {
    setError(
      `Your organization has reached its seat limit (${seatLimit}). Upgrade your plan or free a seat before resending this invitation.`
    )
    return
  }

  const existingMember = teamMembers.find(
    (member) =>
      member.email
        ?.trim()
        .toLowerCase() ===
      invitation.email
        .trim()
        .toLowerCase()
  )

  if (existingMember) {
    setError(
      "This user is already a team member."
    )
    return
  }

  if (invitation.status === "accepted") {
    setError(
      "Accepted invitations cannot be resent."
    )
    return
  }

  const newToken =
    `${crypto.randomUUID()}-${crypto.randomUUID()}`

  const newExpiresAt =
    new Date(
      Date.now() +
        7 * 24 * 60 * 60 * 1000
    ).toISOString()

  const { error } = await supabase
    .from("user_invitations")
    .update({
      status: "pending",
      token: newToken,
      expires_at: newExpiresAt,
      accepted_at: null,
      token_used_at: null,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", invitation.id)
    .eq("organization_id", orgId)

  if (error) {
    console.error(
      "RESEND USER INVITATION ERROR:",
      error
    )
    setError(error.message)
    return
  }

  await recordAuditLog({
    action: "resent",
    module: "Team",
    recordId: invitation.id,
    recordType: "user_invitation",
    details: {
      email: invitation.email,
      role: invitation.role,
      previous_status:
        invitation.status,
      status: "pending",
      expires_at: newExpiresAt,
    },
  })

  setSuccessMessage(
    "User invitation resent successfully."
  )

  await loadData()
}

async function updateOrganizationProfile(e: React.FormEvent) {
  e.preventDefault()
  setError("")
  setSuccessMessage("")

  if (
    !requirePermission(
      canManageSettings,
      "You do not have permission to update organization settings."
    )
  ) {
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError(
      "No organization loaded. Please refresh and log in again."
    )
    return
  }

  if (!organizationName.trim()) {
    setError("Organization name is required.")
    return
  }

  const { error } = await supabase
    .from("organizations")
    .update({
      name: organizationName.trim(),
      contact_email:
        organizationEmail.trim() === ""
          ? null
          : organizationEmail.trim(),
      phone:
        organizationPhone.trim() === ""
          ? null
          : organizationPhone.trim(),
      website:
        organizationWebsite.trim() === ""
          ? null
          : organizationWebsite.trim(),
      address:
        organizationAddress.trim() === ""
          ? null
          : organizationAddress.trim(),
    })
    .eq("id", orgId)

  if (error) {
    setError(error.message)
    return
  }

  setSuccessMessage(
    "Organization profile saved successfully."
  )

  await loadData()
}

async function updateUserRole(
  memberId: string,
  newRole: string
) {
  setError("")
  setSuccessMessage("")

  if (
    !requireAdminPermission(
      "change team-member roles"
    )
  ) {
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError(
      "No organization loaded. Please refresh and log in again."
    )
    return
  }

  const allowedRoles = [
    "admin",
    "manager",
    "accounting",
    "sales",
    "warehouse",
    "purchasing",
    "member",
  ]

  const normalizedRole =
    newRole.trim().toLowerCase()

  if (!allowedRoles.includes(normalizedRole)) {
    setError(
      "The selected role is not supported."
    )
    return
  }

  const selectedMember = teamMembers.find(
    (member) => member.id === memberId
  )

  if (!selectedMember) {
    setError(
      "The selected team member could not be found."
    )
    return
  }

  if (
    selectedMember.organization_id !== orgId
  ) {
    setError(
      "You cannot update a user outside your organization."
    )
    return
  }

  if (
    selectedMember.id ===
    currentTeamMember?.id
  ) {
    setError(
      "You cannot change your own role."
    )
    return
  }

  if (selectedMember.role === "owner") {
    setError(
      "The organization owner role cannot be changed here."
    )
    return
  }

  if (selectedMember.role === normalizedRole) {
    return
  }

  const confirmed = window.confirm(
    `Change ${selectedMember.email || "this user"} from ${
      selectedMember.role
    } to ${normalizedRole}?`
  )

  if (!confirmed) return

  const { data: updatedMembers, error } =
    await supabase
      .from("team_members")
      .update({
        role: normalizedRole,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", memberId)
      .eq("organization_id", orgId)
      .neq("role", "owner")
      .select(
        "id, email, role, organization_id"
      )

  if (error) {
    console.error(
      "UPDATE USER ROLE ERROR:",
      error
    )
    setError(error.message)
    return
  }

  const updatedMember =
    updatedMembers?.[0]

  if (!updatedMember) {
    setError(
      "The role was not changed. The user may be protected or no longer available."
    )
    return
  }

  await recordAuditLog({
    action: "role_changed",
    module: "Team",
    recordId: memberId,
    recordType: "team_member",
    details: {
      email: selectedMember.email,
      previous_role:
        selectedMember.role,
      new_role: normalizedRole,
    },
  })

  setSuccessMessage(
    "Team member role updated successfully."
  )

  await loadData()
}

async function deactivateTeamMember(
  memberId: string
) {
  setError("")
  setSuccessMessage("")

  if (
    !requireAdminPermission(
      "deactivate team members"
    )
  ) {
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError(
      "No organization loaded. Please refresh and log in again."
    )
    return
  }

  const selectedMember = teamMembers.find(
    (member) => member.id === memberId
  )

  if (!selectedMember) {
    setError(
      "The selected team member could not be found."
    )
    return
  }

  if (
    selectedMember.organization_id !== orgId
  ) {
    setError(
      "You cannot deactivate a user outside your organization."
    )
    return
  }

  if (
    selectedMember.id ===
    currentTeamMember?.id
  ) {
    setError(
      "You cannot deactivate your own account."
    )
    return
  }

  if (selectedMember.role === "owner") {
    setError(
      "The organization owner cannot be deactivated."
    )
    return
  }

  if (selectedMember.is_active === false) {
    setError(
      "This team member is already inactive."
    )
    return
  }

  if (selectedMember.role === "admin") {
    const activeAdmins = teamMembers.filter(
      (member) =>
        member.organization_id === orgId &&
        member.role === "admin" &&
        member.is_active !== false
    )

    if (activeAdmins.length <= 1) {
      setError(
        "The last active administrator cannot be deactivated."
      )
      return
    }
  }

  const confirmed = window.confirm(
    `Deactivate ${
      selectedMember.email || "this team member"
    }? They will lose access to this organization.`
  )

  if (!confirmed) return

  const {
    data: updatedMembers,
    error,
  } = await supabase
    .from("team_members")
    .update({
      is_active: false,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", memberId)
    .eq("organization_id", orgId)
    .neq("role", "owner")
    .eq("is_active", true)
    .select(
      "id, email, role, is_active, organization_id"
    )

  if (error) {
    console.error(
      "DEACTIVATE TEAM MEMBER ERROR:",
      error
    )
    setError(error.message)
    return
  }

  const updatedMember =
    updatedMembers?.[0]

  if (!updatedMember) {
    setError(
      "The team member was not deactivated. They may be protected or already inactive."
    )
    return
  }

  await recordAuditLog({
    action: "deactivated",
    module: "Team",
    recordId: memberId,
    recordType: "team_member",
    details: {
      email: selectedMember.email,
      role: selectedMember.role,
      previous_is_active: true,
      new_is_active: false,
    },
  })

  setSuccessMessage(
    "Team member deactivated successfully."
  )

  await loadData()
}

async function reactivateTeamMember(
  memberId: string
) {
  setError("")
  setSuccessMessage("")

  if (
    !requireAdminPermission(
      "reactivate team members"
    )
  ) {
    return
  }

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError(
      "No organization loaded. Please refresh and log in again."
    )
    return
  }

  const selectedMember = teamMembers.find(
    (member) => member.id === memberId
  )

  if (!selectedMember) {
    setError(
      "The selected team member could not be found."
    )
    return
  }

  if (
    selectedMember.organization_id !== orgId
  ) {
    setError(
      "You cannot reactivate a user outside your organization."
    )
    return
  }

  if (selectedMember.is_active !== false) {
  setError(
    "This team member is already active."
  )
  return
}

const organizationSeatLimit = seatLimit

const activeMemberCount =
  teamMembers.filter(
    (member) =>
      member.organization_id === orgId &&
      member.is_active !== false
  ).length

const validPendingInvitationCount =
  userInvitations.filter(
    (invitation) =>
      invitation.status === "pending" &&
      !isInvitationExpired(invitation)
  ).length

const usedSeats =
  activeMemberCount +
  validPendingInvitationCount

if (usedSeats >= organizationSeatLimit) {
  setError(
    `Your organization has reached its ${organizationSeatLimit}-seat limit. Deactivate another member, revoke a pending invitation, or upgrade the plan before reactivating this user.`
  )
  return
}
  const confirmed = window.confirm(
    `Reactivate ${
      selectedMember.email || "this team member"
    }? Their organization access will be restored.`
  )

  if (!confirmed) return

  const {
    data: updatedMembers,
    error,
  } = await supabase
    .from("team_members")
    .update({
      is_active: true,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", memberId)
    .eq("organization_id", orgId)
    .eq("is_active", false)
    .select(
      "id, email, role, is_active, organization_id"
    )

  if (error) {
    console.error(
      "REACTIVATE TEAM MEMBER ERROR:",
      error
    )
    setError(error.message)
    return
  }

  const updatedMember =
    updatedMembers?.[0]

  if (!updatedMember) {
    setError(
      "The team member was not reactivated. They may already be active or no longer available."
    )
    return
  }

  await recordAuditLog({
    action: "reactivated",
    module: "Team",
    recordId: memberId,
    recordType: "team_member",
    details: {
      email: selectedMember.email,
      role: selectedMember.role,
      previous_is_active: false,
      new_is_active: true,
    },
  })

  setSuccessMessage(
    "Team member reactivated successfully."
  )

  await loadData()
}
  async function handleUpdateTaskStatus(taskId: string, status: string) {
    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)

    if (error) {
      setError(error.message)
      return
    }

    await loadData()
  }

async function updateTask(taskId: string, updates: Partial<Task>) {
  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  const currentTask = tasks.find((task) => task.id === taskId)

  const { error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)

  if (error) {
    setError(error.message)
    return
  }

  const updatedTask = {
    ...currentTask,
    ...updates,
  } as Task

  const dueDate = updatedTask.due_date
    ? new Date(updatedTask.due_date)
    : null

  const isLate =
    dueDate &&
    dueDate < new Date() &&
    updatedTask.status !== "completed"

  if (orgId && currentTask && isLate) {
    const existingLateTaskNotification = notifications.find(
      (notification) =>
        notification.related_module === "Tasks" &&
        notification.related_id === taskId &&
        notification.title === "Late task" &&
        !notification.is_read
    )

    if (!existingLateTaskNotification) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          organization_id: orgId,
          title: "Late task",
          message: `${updatedTask.title} is past due.`,
          type: "warning",
          related_module: "Tasks",
          related_id: taskId,
          is_read: false,
        })

      if (notificationError) {
        setError(notificationError.message)
        return
      }
    }
    } else if (currentTask) {
    const { error: notificationUpdateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("related_module", "Tasks")
      .eq("related_id", taskId)
      .eq("title", "Late task")
      .eq("is_read", false)

    if (notificationUpdateError) {
      setError(notificationUpdateError.message)
      return
    }
  }

  setError("")
  await loadData()
}

async function deleteTask(taskId: string) {
  const confirmed = window.confirm("Delete this task?");
  if (!confirmed) return;

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) {
    setError(error.message);
    return;
  }

  await loadData();
}

async function handleLogout() {
  await supabase.auth.signOut();
  router.push('/login');
}
const totalPurchaseOrders = purchaseOrders.length

const openPurchaseOrders = purchaseOrders.filter(
  (po) =>
    po.status === "draft" ||
    po.status === "ordered"
).length

const activePurchaseOrderValue = purchaseOrders
  .filter(
    (po) =>
      po.status === "ordered" ||
      po.status === "received"
  )
  .reduce(
    (sum, po) => sum + Number(po.total_amount || 0),
    0
  )
  const activePurchaseOrders = purchaseOrders.filter(
  (po) => po.status !== "cancelled"
)

  const filteredPurchaseOrders = activePurchaseOrders.filter((po) => {
  const matchesSearch =
    purchaseOrderSearch.trim() === "" ||
    po.po_number
      ?.toLowerCase()
      .includes(purchaseOrderSearch.toLowerCase()) ||
    po.notes
      ?.toLowerCase()
      .includes(purchaseOrderSearch.toLowerCase())

  const matchesStatus =
    purchaseOrderStatusFilter === "all" ||
    po.status === purchaseOrderStatusFilter

  return matchesSearch && matchesStatus
})
const draftPurchaseOrderList = purchaseOrders.filter(
  (po) => po.status === "draft"
)

const orderedPurchaseOrderList = purchaseOrders.filter(
  (po) => po.status === "ordered"
)

const receivedPurchaseOrderList = purchaseOrders.filter(
  (po) => po.status === "received"
)

const cancelledPurchaseOrderList = purchaseOrders.filter(
  (po) => po.status === "cancelled"
)

const receivedPurchaseOrderValue = receivedPurchaseOrderList.reduce(
  (sum, po) => sum + Number(po.total_amount || 0),
  0
)

const totalUnitsReceived = purchaseOrderItems.reduce(
  (sum, item) => sum + Number(item.received_quantity || 0),
  0
)
 const unpaidVendorBills = vendorBills.filter(
  (bill) => getVendorBillCalculatedStatus(bill) === "unpaid"
)

const unpaidVendorBillValue = unpaidVendorBills.reduce(
  (sum, bill) => sum + Number(bill.amount || 0),
  0
)
const paidVendorBills = vendorBills.filter(
  (bill) => getVendorBillCalculatedStatus(bill) === "paid"
)

const partialVendorBills = vendorBills.filter(
  (bill) => getVendorBillCalculatedStatus(bill) === "partial"
)

const totalVendorBillValue = vendorBills.reduce(
  (sum, bill) => sum + Number(bill.amount || 0),
  0
)
const totalVendorPaymentValue = vendorPayments.reduce(
  (sum, payment) => sum + Number(payment.amount || 0),
  0
)

const outstandingVendorBillValue =
  totalVendorBillValue - totalVendorPaymentValue

function getVendorBillPaidAmount(vendorBillId: string) {
  return vendorPayments
    .filter((payment) => payment.vendor_bill_id === vendorBillId)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
}

function getVendorBillBalance(bill: any) {
  const paidAmount = getVendorBillPaidAmount(bill.id)
  return Number(bill.amount || 0) - paidAmount
}
function getVendorBillCalculatedStatus(bill: any) {
  const paidAmount = getVendorBillPaidAmount(bill.id)
  const billAmount = Number(bill.amount || 0)

  if (paidAmount >= billAmount) return "paid"
  if (paidAmount > 0) return "partial"
  return "unpaid"
}
const activeVendorBills = vendorBills.filter(
  (bill) => bill.status !== "archived"
)
const archivedVendorBills = vendorBills.filter(
  (bill) => bill.status === "archived"
)
const today = new Date()

const overdueVendorBills = activeVendorBills.filter((bill) => {
  if (!bill.due_date || getVendorBillCalculatedStatus(bill) === "paid") {
    return false
  }

  const dueDate = new Date(bill.due_date)

  return dueDate < today
})
const riskCount = overdueVendorBills.length


const dueSoonVendorBills = activeVendorBills.filter((bill) => {
  if (!bill.due_date || getVendorBillCalculatedStatus(bill) === "paid") return false

  const dueDate = new Date(bill.due_date)
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(today.getDate() + 7)

  return dueDate >= today && dueDate <= sevenDaysFromNow
})

const overdueVendorBillValue = overdueVendorBills.reduce(
  (sum, bill) => sum + Number(bill.amount || 0),
  0
)

const activeInventoryItems = inventoryItems.filter(
  (item) => item.status !== "archived"
)

const archivedInventoryItems = inventoryItems.filter(
  (item) => item.status === "archived"
)

const totalInventoryValue = activeInventoryItems.reduce(
  (sum, item) =>
    sum +
    Number(item.quantity_on_hand || 0) *
      Number(item.unit_cost || 0),
  0
)

const lowStockInventoryItems = activeInventoryItems.filter(
  (item) =>
    Number(item.quantity_on_hand || 0) <=
    Number(item.reorder_level || 0)
)

const inventoryLowStockRate =
  activeInventoryItems.length === 0
    ? 0
    : Math.round(
        (lowStockInventoryItems.length / activeInventoryItems.length) * 100
      )

const totalInventoryQuantity = activeInventoryItems.reduce(
  (sum, item) => sum + Number(item.quantity_on_hand || 0),
  0
)
const orderedPurchaseOrders = purchaseOrders.filter(
  (po) => po.status === "ordered"
).length

const receivedPurchaseOrders = purchaseOrders.filter(
  (po) => po.status === "received"
).length

const orderedPurchaseOrderValue = purchaseOrders
  .filter((po) => po.status === "ordered")
  .reduce((sum, po) => sum + Number(po.total_amount || 0), 0)

const totalTasks = tasks.length;
const pendingTasks = tasks.filter((task) => task.status === "pending").length;
const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length;
const completedTasks = tasks.filter((task) => task.status === "completed").length;
const openWorkOrders = tasks.filter((task) => task.status !== "completed").length;
const taskCompletionRate =
  totalTasks === 0
    ? 0
    : Math.round((completedTasks / totalTasks) * 100)

const activeClients = clients.filter(
  (client) => client.status !== "inactive"
)

const archivedClients = clients.filter(
  (client) => client.status === "inactive"
)

const totalClients = activeClients.length;
const totalCompanies = companies.length;
const activeSuppliers = suppliers.filter(
  (supplier) => supplier.status !== "archived"
)

const archivedSuppliers = suppliers.filter(
  (supplier) => supplier.status === "archived"
)
const filteredAuditLogs = auditLogs.filter((log) => {
  const matchesModule =
    auditModuleFilter === "all" ||
    log.module === auditModuleFilter

  const matchesAction =
    auditActionFilter === "all" ||
    log.action === auditActionFilter

  return matchesModule && matchesAction
})

const activeTeamMembers = teamMembers.filter(
  (member) => member.is_active !== false
).length

function isInvitationExpired(
  invitation: UserInvitation
) {
  if (!invitation.expires_at) {
    return false
  }

  return (
    new Date(invitation.expires_at).getTime() <=
    Date.now()
  )
}

  const pendingInvitations =
    userInvitations.filter(
    (invitation) =>
      invitation.status === "pending" &&
      !isInvitationExpired(invitation)
  )

const usedSeats =
  activeTeamMembers + pendingInvitations.length

const seatsRemaining =
  Math.max(seatLimit - usedSeats, 0)

const seatLimitReached =
  usedSeats >= seatLimit

  const companyLimitReached =
  companies.length >= maxCompanies

const clientLimitReached =
  activeClients.length >= maxClients

const inventoryItemLimitReached =
  activeInventoryItems.length >= maxInventoryItems

const monthlyInvoiceLimitReached =
  customerInvoices.length >= maxMonthlyInvoices
const currentTeamMember = teamMembers.find(
  (member) =>
    member.email?.trim().toLowerCase() ===
    email.trim().toLowerCase()
)

const currentRole =
  currentTeamMember?.role?.trim().toLowerCase() || "member"

const isOwner = currentRole === "owner"

const isAdmin =
  isOwner ||
  currentRole === "admin"

const isManager =
  currentRole === "manager"

const isAccounting =
  currentRole === "accounting"

const isSales =
  currentRole === "sales"

const isWarehouse =
  currentRole === "warehouse"

const isPurchasing =
  currentRole === "purchasing"

const isMember =
  currentRole === "member"

const smartAiPlanIsActive =
  smartAiPlan === "assist" ||
  smartAiPlan === "advanced" ||
  smartAiPlan === "enterprise"

const smartAiNotExpired =
  !smartAiExpiresAt ||
  new Date(smartAiExpiresAt).getTime() > Date.now()

const canUseSmartAi =
  isAdmin &&
  smartAiEnabled &&
  smartAiPlanIsActive &&
  smartAiNotExpired

  const executiveIntelligencePlanIsActive =
  executiveIntelligencePlan === "trial" ||
  executiveIntelligencePlan === "starter" ||
  executiveIntelligencePlan === "growth" ||
  executiveIntelligencePlan === "professional" ||
  executiveIntelligencePlan === "enterprise"

const executiveIntelligenceNotExpired =
  !executiveIntelligenceExpiresAt ||
  new Date(
    executiveIntelligenceExpiresAt
  ).getTime() > Date.now()

const canUseExecutiveIntelligence =
  isAdmin &&
  executiveIntelligenceEnabled &&
  executiveIntelligencePlanIsActive &&
  executiveIntelligenceNotExpired


  const recoveryModeIsConfigured =
  smartAiRecoveryMode === "monitor" ||
  smartAiRecoveryMode === "assist" ||
  smartAiRecoveryMode === "recovery"

const recoveryModeIsArmed =
  canUseSmartAi &&
  smartAiRecoveryEnabled &&
  recoveryModeIsConfigured

const recoveryAutoRetryIsAvailable =
  recoveryModeIsArmed &&
  smartAiAutoRetryEnabled &&
  smartAiMaxAutoRetries > 0

const activeAiIncidents = aiIncidents.filter(
  (incident) =>
    incident.status === "open" ||
    incident.status === "investigating"
)

const criticalAiIncidents = activeAiIncidents.filter(
  (incident) => incident.severity === "critical"
)

const highRiskAiIncidents = activeAiIncidents.filter(
  (incident) =>
    incident.severity === "high" ||
    incident.severity === "critical"
)

const smartAiSystemStatus =
  criticalAiIncidents.length > 0
    ? "critical"
    : highRiskAiIncidents.length > 0
      ? "attention"
      : recoveryModeIsArmed
        ? "stable"
        : "inactive"

  useEffect(() => {
  if (!organizationId) return

  loadAiIncidents()
  loadAiRecommendations()
  loadAiActionLogs()
}, [organizationId, canUseSmartAi])

const canManageSettings =
  isAdmin

const canManageTeam =
  isAdmin

const canManageFinance =
  isAdmin ||
  isAccounting

const canManageSales =
  isAdmin ||
  isManager ||
  isSales

  const canManageCompanies =
  isAdmin ||
  isManager ||
  isSales

const canManageInventory =
  isAdmin ||
  isManager ||
  isWarehouse

const canManagePurchasing =
  isAdmin ||
  isManager ||
  isPurchasing

const canViewReports =
  isAdmin ||
  isManager ||
  isAccounting ||
  isSales ||
  isWarehouse ||
  isPurchasing

const canEditTask = (task: Task) =>
  isAdmin || isManager || task.assigned_to === currentTeamMember?.id

const hasActiveAccess = accessStatus === "active"

const hasUsableSubscription =
  subscriptionStatus === "active" ||
  subscriptionStatus === "trialing"

const isAccessRestricted =
  !hasActiveAccess || !hasUsableSubscription

const accessRestrictionMessage =
  accessStatus === "suspended"
    ? "Your organization access is temporarily suspended. Contact support to restore access."
    : accessStatus === "disabled"
      ? "Your organization access has been disabled. Contact support for assistance."
      : subscriptionStatus === "past_due"
        ? "Your subscription is past due. Update billing to restore full access."
        : subscriptionStatus === "cancelled"
          ? "Your subscription has been cancelled. Reactivate your plan to restore full access."
          : subscriptionStatus === "inactive"
            ? "Your subscription is inactive. Activate a plan to restore full access."
            : ""

function requirePermission(
  allowed: boolean,
  message: string
) {
  if (isAccessRestricted) {
    setError(
      accessRestrictionMessage ||
        "Your organization does not currently have access to this action."
    )
    return false
  }

  if (!allowed) {
    setError(message)
    return false
  }

  return true
}

function requireAdminPermission(
  actionName: string
) {
  return requirePermission(
    isAdmin,
    `Only an administrator can ${actionName}.`
  )
}

function requireFinancePermission(
  actionName: string
) {
  return requirePermission(
    canManageFinance,
    `You do not have permission to ${actionName}.`
  )
}

function requireSalesPermission(
  actionName: string
) {
  return requirePermission(
    canManageSales,
    `You do not have permission to ${actionName}.`
  )
}

function requireInventoryPermission(
  actionName: string
) {
  return requirePermission(
    canManageInventory,
    `You do not have permission to ${actionName}.`
  )
}

function requirePurchasingPermission(
  actionName: string
) {
  return requirePermission(
    canManagePurchasing,
    `You do not have permission to ${actionName}.`
  )
}

function requireSmartAiPermission(
  actionName: string
) {
  return requirePermission(
    canUseSmartAi,
    `You do not have permission to ${actionName}.`
  )
}

 const filteredTasks = tasks.filter((task) => {
  const matchesStatus =
    statusFilter === "all" || task.status === statusFilter

  const matchesPriority =
    priorityFilter === "all" || task.priority === priorityFilter

  const matchesAssignee =
    assigneeFilter === "all" ||
    (assigneeFilter === "unassigned" && !task.assigned_to) ||
    task.assigned_to === assigneeFilter

  const matchesTaskView =
    taskViewFilter === "all" ||
    (taskViewFilter === "mine" &&
      task.assigned_to === currentTeamMember?.id)

  return (
    matchesStatus &&
    matchesPriority &&
    matchesAssignee &&
    matchesTaskView
  )
})

const inventoryCategories = Array.from(
  new Set(
    inventoryItems
      .map((item: any) => item.category)
      .filter((category: any) => category && category.trim() !== "")
  )
)
function getMovementTypeBadgeClass(type: string) {
  if (type === "in") {
    return "bg-green-100 text-green-700 border-green-200"
  }

  if (type === "out") {
    return "bg-red-100 text-red-700 border-red-200"
  }

  return "bg-slate-100 text-slate-700 border-slate-200"
}

const filteredInventoryItems = activeInventoryItems.filter((item: any) => {
const searchValue = inventorySearch.toLowerCase().trim()

  const matchesSearch =
    searchValue === "" ||
    item.sku?.toLowerCase().includes(searchValue) ||
    item.item_name?.toLowerCase().includes(searchValue) ||
    item.category?.toLowerCase().includes(searchValue)

  const matchesCategory =
    inventoryCategoryFilter === "all" ||
    item.category === inventoryCategoryFilter

  const matchesLowStock =
    !showLowStockOnly ||
    Number(item.quantity_on_hand || 0) <= Number(item.reorder_level || 0)

  return matchesSearch && matchesCategory && matchesLowStock
})
const filteredInventoryMovements = inventoryMovements.filter((movement) => {
const searchValue = movementSearch.toLowerCase().trim()

  const matchesSearch =
    searchValue === "" ||
    movement.notes?.toLowerCase().includes(searchValue)

  const matchesType =
    movementTypeFilter === "all" ||
    movement.movement_type === movementTypeFilter

return matchesSearch && matchesType
})

const activeSalesOrders = salesOrders.filter(
  (order: any) => !order.is_archived
)

const growthOpportunityCount = activeSalesOrders.filter(
  (order: any) =>
    order.status === "confirmed" ||
    order.status === "shipped"
).length


const archivedSalesOrders = salesOrders.filter(
  (order: any) => order.is_archived
)
const draftSalesOrders = salesOrders.filter(
  (order) => order.status === "draft"
)

const confirmedSalesOrders = salesOrders.filter(
  (order) => order.status === "confirmed"
)

const shippedSalesOrders = salesOrders.filter(
  (order) => order.status === "shipped"
)

const completedSalesOrders = salesOrders.filter(
  (order) => order.status === "completed"
)

const cancelledSalesOrders = salesOrders.filter(
  (order) => order.status === "cancelled"
)

const openSalesOrders = salesOrders.filter(
  (order) =>
    order.status === "draft" ||
    order.status === "confirmed" ||
    order.status === "shipped"
)

const totalSalesOrderValue = salesOrders
  .filter((order) => order.status !== "cancelled")
  .reduce(
    (sum, order) => sum + getSalesOrderItemTotal(order.id),
    0
  )

const completedSalesOrderValue = completedSalesOrders.reduce(
  (sum, order) => sum + Number(order.total_amount || 0),
  0
)
const filteredSalesOrders = activeSalesOrders.filter((order) => {
  const searchValue = salesOrderSearch.toLowerCase().trim()

  const matchesSearch =
    searchValue === "" ||
    order.order_number?.toLowerCase().includes(searchValue) ||
    order.notes?.toLowerCase().includes(searchValue)

  const matchesStatus =
    salesOrderStatusFilter === "all" ||
    order.status === salesOrderStatusFilter

  return matchesSearch && matchesStatus
})
function getSalesOrderItemTotal(salesOrderId: string) {
  return salesOrderItems
    .filter((item) => item.sales_order_id === salesOrderId)
    .reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0) *
          Number(item.unit_price || 0),
      0
    )
}
function getSalesOrderFulfillmentStatus(salesOrderId: string) {
  const items = salesOrderItems.filter(
    (item) => item.sales_order_id === salesOrderId
  )

  if (items.length === 0) {
    return "No Items"
  }

  const totalOrdered = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  )

  const totalFulfilled = items.reduce(
    (sum, item) => sum + Number(item.fulfilled_quantity || 0),
    0
  )

  if (totalFulfilled <= 0) {
    return "Open"
  }

  if (totalFulfilled >= totalOrdered) {
    return "Fulfilled"
  }

  return "Partially Fulfilled"
}
function getCustomerInvoicePaidAmount(invoiceId: string) {
  return customerInvoicePayments
    .filter((payment) => payment.customer_invoice_id === invoiceId)
    .reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    )
}

function getCustomerInvoiceBalance(invoice: CustomerInvoice) {
  return Number(invoice.amount || 0) -
    getCustomerInvoicePaidAmount(invoice.id)
}

function getCustomerInvoiceCalculatedStatus(invoice: CustomerInvoice) {
  const paidAmount = getCustomerInvoicePaidAmount(invoice.id)
  const invoiceAmount = Number(invoice.amount || 0)

  if (paidAmount >= invoiceAmount) return "paid"
  if (paidAmount > 0) return "partial"
  return invoice.status
}
const activeCustomerInvoices = customerInvoices.filter(
  (invoice: any) => !invoice.is_archived
)
const archivedCustomerInvoices = customerInvoices.filter(
  (invoice: any) => invoice.is_archived
)
const totalCustomerInvoiceValue = activeCustomerInvoices.reduce(
  (sum, invoice) => sum + Number(invoice.amount || 0),
  0
)

const totalCustomerPaymentValue = customerInvoicePayments.reduce(
  (sum, payment) => sum + Number(payment.amount || 0),
  0
)

const outstandingCustomerInvoiceValue =
  totalCustomerInvoiceValue - totalCustomerPaymentValue


const overdueCustomerInvoices = activeCustomerInvoices.filter((invoice) => {
  if (!invoice.due_date) return false
  if (getCustomerInvoiceCalculatedStatus(invoice) === "paid") return false

  const dueDate = new Date(invoice.due_date)
  return dueDate < today
})

const dueSoonCustomerInvoices = activeCustomerInvoices.filter((invoice) => {
  if (!invoice.due_date) return false
  if (getCustomerInvoiceCalculatedStatus(invoice) === "paid") return false

  const dueDate = new Date(invoice.due_date)
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(today.getDate() + 7)

  return dueDate >= today && dueDate <= sevenDaysFromNow
})

const overdueCustomerInvoiceValue = overdueCustomerInvoices.reduce(
  (sum, invoice) => sum + getCustomerInvoiceBalance(invoice),
  0
)

const paidCustomerInvoices = activeCustomerInvoices.filter(
  (invoice) => getCustomerInvoiceCalculatedStatus(invoice) === "paid"
)

const partialCustomerInvoices = activeCustomerInvoices.filter(
  (invoice) => getCustomerInvoiceCalculatedStatus(invoice) === "partial"
)

const unpaidCustomerInvoices = activeCustomerInvoices.filter(
  (invoice) =>
    getCustomerInvoiceCalculatedStatus(invoice) !== "paid"
)
const completedSalesValue = completedSalesOrders.reduce(
  (sum, order) =>
    sum + getSalesOrderItemTotal(order.id),
  0
)

const totalUnitsSold = salesOrderItems.reduce(
  (sum, item) =>
    sum + Number(item.fulfilled_quantity || 0),
  0
)

const averageSalesOrderValue =
  completedSalesOrders.length > 0
    ? completedSalesValue / completedSalesOrders.length
    : 0
    const unreadNotifications = notifications.filter(
  (notification) => !notification.is_read
)

const lowInventoryAlerts = lowStockInventoryItems

const overdueVendorBillAlerts = overdueVendorBills

const overdueCustomerInvoiceAlerts = overdueCustomerInvoices

const lateTaskAlerts = tasks.filter((task) => {
  if (!task.due_date) return false
  if (task.status === "completed") return false

  const dueDate = new Date(task.due_date)

  return dueDate < today
})

const totalAlertCount =
  unreadNotifications.length +
  lowInventoryAlerts.length +
  overdueVendorBillAlerts.length +
  overdueCustomerInvoiceAlerts.length +
  lateTaskAlerts.length

  const lowStockCount = lowInventoryAlerts.length

const overdueCustomerInvoiceCount =
  overdueCustomerInvoiceAlerts.length

const lateTaskCount = lateTaskAlerts.length

const unfulfilledSalesOrderCount = activeSalesOrders.filter(
  (order) =>
    order.status === "confirmed" ||
    order.status === "shipped"
).filter(
  (order) =>
    getSalesOrderFulfillmentStatus(order.id) !== "Fulfilled"
).length

const executiveRecommendations: string[] = []

if (riskCount > 0) {
  executiveRecommendations.push(
    `Review ${riskCount} overdue vendor ${
      riskCount === 1 ? "bill" : "bills"
    } to reduce supplier and purchasing risk.`
  )
}

if (overdueCustomerInvoiceCount > 0) {
  executiveRecommendations.push(
    `Follow up on ${overdueCustomerInvoiceCount} overdue customer ${
      overdueCustomerInvoiceCount === 1 ? "invoice" : "invoices"
    } to improve cash flow.`
  )
}

if (lowStockCount > 0) {
  executiveRecommendations.push(
    `Review ${lowStockCount} low-stock inventory ${
      lowStockCount === 1 ? "item" : "items"
    } before fulfillment is affected.`
  )
}

if (lateTaskCount > 0) {
  executiveRecommendations.push(
    `Address ${lateTaskCount} overdue ${
      lateTaskCount === 1 ? "task" : "tasks"
    } to reduce operational delays.`
  )
}

if (unfulfilledSalesOrderCount > 0) {
  executiveRecommendations.push(
    `Prioritize fulfillment for ${unfulfilledSalesOrderCount} active sales ${
      unfulfilledSalesOrderCount === 1 ? "order" : "orders"
    }.`
  )
}

if (
  executiveRecommendations.length === 0 &&
  growthOpportunityCount > 0
) {
  executiveRecommendations.push(
    `Review ${growthOpportunityCount} active sales ${
      growthOpportunityCount === 1 ? "opportunity" : "opportunities"
    } for fulfillment and revenue growth.`
  )
}

const actionableRecommendationCount =
  executiveRecommendations.length

if (executiveRecommendations.length === 0) {
  executiveRecommendations.push(
    "Operations are currently stable. No immediate action is required."
  )
}

           useEffect(() => {
  if (
    isAccessRestricted &&
    activeModule !== "Dashboard" &&
    activeModule !== "Settings"
  ) {
    setActiveModule("Dashboard")
  }
}, [isAccessRestricted, activeModule]) 
return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
  <div className="flex min-h-screen">

    {/* SIDEBAR */}
<aside className="w-64 bg-slate-950 text-white p-6 hidden md:block">
  <h1 className="text-2xl font-bold mb-8">SEPHOMIC</h1>

  <nav className="space-y-2 text-sm">
  {[
  { label: "Dashboard", key: "dashboard", canView: true },
  { label: "Tasks", key: "tasks", canView: true },
  { label: "My Profile", key: "my_profile", canView: true },
  { label: "Clients", key: "clients", canView: canManageSales || canManageFinance || isManager || isAdmin },
  {
  label: "Companies",
  key: "companies",
  canView: canManageSales || isManager || isAdmin,
},
  { label: "Purchasing", key: "purchase_orders", canView: canManagePurchasing },
  { label: "Inventory", key: "inventory_pro", canView: canManageInventory },
  { label: "Sales", key: "sales_orders", canView: canManageSales },
  { label: "Finance", key: "financial_reports", canView: canManageFinance },
  { label: "Reports", key: "reporting_basic", canView: canViewReports },
  { label: "Smart AI Assist", key: "smart_ai", canView: canUseSmartAi },
  { label: "Settings", key: "organization_settings", canView: canManageSettings },
  {
  label: "Executive Intelligence",
  key: "executive_intelligence",
  canView: canUseExecutiveIntelligence,
},
]
.filter((item) => item.canView)
.map((item) => {
  const isAllowedDuringRestriction =
    item.label === "Dashboard" ||
    item.label === "Settings"

  const isModuleBlocked =
    isAccessRestricted &&
    !isAllowedDuringRestriction

  return (
    <button
      key={item.key}
      type="button"
      disabled={isModuleBlocked}
      onClick={() => {
        if (isModuleBlocked) return

        setActiveModule(item.label)
      }}
      className={`w-full text-left px-4 py-2 rounded-lg transition flex items-center justify-between ${
        isModuleBlocked
          ? "cursor-not-allowed text-slate-600 opacity-50"
          : activeModule === item.label
            ? "bg-white text-slate-950 font-semibold"
            : "text-slate-300 hover:bg-slate-800"
      }`}
    >
      <span>{item.label}</span>

      {item.label === "Dashboard" &&
        totalAlertCount > 0 && (
          <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            {totalAlertCount}
          </span>
        )}
    </button>
  )
})}
</nav>

</aside>
      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500">Manufacturing ERP Overview</p>
          <h1 className="text-3xl font-bold">{activeModule}</h1>
          <div className="flex items-center gap-3">
  <div className="text-sm">
    <p className="font-semibold">
      {profileName || email}
    </p>
    <p className="text-xs text-slate-500">
      {currentTeamMember?.role || "User"}
    </p>
  </div>
</div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-slate-950 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
      {isAccessRestricted && (
  <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="font-semibold">
          Account access requires attention
        </p>

        <p className="mt-1 text-sm">
          {accessRestrictionMessage}
        </p>
      </div>

      {canManageSettings && (
        <button
          type="button"
          onClick={() => setActiveModule("Settings")}
          className="rounded-lg bg-amber-900 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800"
        >
          View Account Status
        </button>
      )}
    </div>
  </div>
)}

      {activeModule === "Dashboard" && (
  <>
    {/* ERP KPI CARDS */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <p className="text-sm text-slate-500">Open Work Orders</p>
    <p className="text-3xl font-bold mt-2">{openWorkOrders}</p>
  </div>

  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <p className="text-sm text-slate-500">Total Tasks</p>
    <p className="text-3xl font-bold mt-2">{totalTasks}</p>
  </div>

  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <p className="text-sm text-slate-500">Clients</p>
    <p className="text-3xl font-bold mt-2">{totalClients}</p>
  </div>

  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
   <p className="text-sm text-slate-500">Enabled Modules</p>
   <p className="text-3xl font-bold mt-2">{enabledModuleCount}</p>
  </div>
</div>
<section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h2 className="text-2xl font-semibold">
        Welcome back, {profileName || "User"}
      </h2>

      <p className="text-slate-500 mt-1">
        Monitor operations, manage tasks, and track organizational activity.
      </p>
    </div>

    <div className="text-sm text-slate-500">
      Role:{" "}
      <span className="font-medium text-slate-700">
        {currentTeamMember?.role || "member"}
      </span>
    </div>
  </div>
</section>
<section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-xl font-semibold">Alerts Summary</h2>
      <p className="text-sm text-slate-500">
        Proactive warnings across inventory, finance, tasks, and system notifications.
      </p>
    </div>

    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
      {totalAlertCount} Active
    </span>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
    <div className="rounded-xl border border-gray-100 p-4">
      <p className="text-sm text-slate-500">Unread Notifications</p>
      <p className="text-2xl font-bold mt-2">{unreadNotifications.length}</p>
    </div>

    <div className="rounded-xl border border-gray-100 p-4">
      <p className="text-sm text-slate-500">Low Stock Items</p>
      <p className="text-2xl font-bold mt-2">{lowInventoryAlerts.length}</p>
    </div>

    <div className="rounded-xl border border-gray-100 p-4">
      <p className="text-sm text-slate-500">Overdue Vendor Bills</p>
      <p className="text-2xl font-bold mt-2">{overdueVendorBillAlerts.length}</p>
    </div>

    <div className="rounded-xl border border-gray-100 p-4">
      <p className="text-sm text-slate-500">Overdue Invoices</p>
      <p className="text-2xl font-bold mt-2">{overdueCustomerInvoiceAlerts.length}</p>
    </div>

        <div className="rounded-xl border border-gray-100 p-4">
      <p className="text-sm text-slate-500">Late Tasks</p>
      <p className="text-2xl font-bold mt-2">{lateTaskAlerts.length}</p>
    </div>
  </div>

  {totalAlertCount > 0 && (
    <div className="mt-5 flex flex-wrap gap-3">
    {unreadNotifications.length > 0 && (
    <button
    type="button"
    onClick={markAllNotificationsRead}
    className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
    >
    Mark Notifications Read
    </button>
  )}
      {lowInventoryAlerts.length > 0 && (
        <button
          type="button"
          onClick={() => setActiveModule("Inventory")}
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Review Low Stock
        </button>
      )}

      {overdueVendorBillAlerts.length > 0 && (
        <button
          type="button"
          onClick={() => setActiveModule("Finance")}
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Review Overdue Bills
        </button>
      )}

      {overdueCustomerInvoiceAlerts.length > 0 && (
        <button
          type="button"
          onClick={() => setActiveModule("Finance")}
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Review Overdue Invoices
        </button>
      )}

      {lateTaskAlerts.length > 0 && (
        <button
          type="button"
          onClick={() => setActiveModule("Tasks")}
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Review Late Tasks
        </button>
      )}
    </div>
  )}

  {totalAlertCount > 0 && (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold">Alert Details</h3>

      {lowInventoryAlerts.length > 0 && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="font-semibold text-red-700">Low Stock Items</p>

          <div className="mt-3 space-y-2">
            {lowInventoryAlerts.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-lg bg-white p-3 text-sm">
                <p className="font-medium">{item.item_name}</p>
                <p className="text-slate-500">
                  SKU: {item.sku} · On hand: {item.quantity_on_hand} · Reorder level: {item.reorder_level}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {overdueVendorBillAlerts.length > 0 && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="font-semibold text-red-700">Overdue Vendor Bills</p>

          <div className="mt-3 space-y-2">
            {overdueVendorBillAlerts.slice(0, 5).map((bill) => (
              <div key={bill.id} className="rounded-lg bg-white p-3 text-sm">
                <p className="font-medium">
                  {suppliers.find((supplier) => supplier.id === bill.supplier_id)?.supplier_name || "Unknown supplier"}
                </p>
                <p className="text-slate-500">
                  Amount: ${Number(bill.amount || 0).toFixed(2)} · Due:{" "}
                  {bill.due_date ? new Date(bill.due_date).toLocaleDateString() : "No due date"}
                </p>
              </div>
            ))}
          </div>
        </div>
            )}

      {overdueCustomerInvoiceAlerts.length > 0 && (
  <div className="rounded-xl border border-red-100 bg-red-50 p-4">
    <p className="font-semibold text-red-700">
      Overdue Customer Invoices
    </p>

    <div className="mt-3 space-y-2">
      {overdueCustomerInvoiceAlerts.slice(0, 5).map((invoice) => (
        <div
          key={invoice.id}
          className="rounded-lg bg-white p-3 text-sm"
        >
          <p className="font-medium">
            {invoice.invoice_number}
          </p>

          <p className="text-slate-500">
            Client:{" "}
            {clients.find(
              (client) => client.id === invoice.client_id
            )?.name || "Unknown client"}
          </p>

          <p className="text-slate-500">
            Balance: $
            {getCustomerInvoiceBalance(invoice).toFixed(2)}
            {" · "}
            Due:{" "}
            {invoice.due_date
              ? new Date(invoice.due_date).toLocaleDateString()
              : "No due date"}
          </p>
        </div>
      ))}
    </div>
  </div>
)}

      {lateTaskAlerts.length > 0 && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="font-semibold text-red-700">Late Tasks</p>

          <div className="mt-3 space-y-2">
            {lateTaskAlerts.slice(0, 5).map((task) => (
              <div key={task.id} className="rounded-lg bg-white p-3 text-sm">
                <p className="font-medium">{task.title}</p>
                <p className="text-slate-500">
                  Status: {task.status.replace("_", " ")} · Due:{" "}
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                </p>
              </div>
            ))}
          </div>
        </div>
            )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
  <p className="font-semibold text-slate-800">
    Recent Notifications
  </p>

  {notifications.length === 0 ? (
    <p className="mt-3 text-sm text-slate-500">
      No notifications yet.
    </p>
  ) : (

    <div className="mt-3 space-y-2">
      {notifications.slice(0, 5).map((notification) => (
        <button
  type="button"
  key={notification.id}
  onClick={async () => {
    await markNotificationRead(notification.id)
    if (
      notification.type === "overdue_vendor_bill" ||
      notification.type === "overdue_customer_invoice"
    ) {
      setActiveModule("Finance")
    } else if (notification.type === "overdue_task") {
      setActiveModule("Tasks")
    } else if (notification.type === "low_stock") {
      setActiveModule("Inventory")
    }
  }}
  className={`w-full text-left rounded-lg bg-white p-3 text-sm border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${
    notification.is_read
      ? "border-slate-100"
      : "border-red-200"
  }`}
>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
  <p className="font-medium">
    {notification.title}
  </p>

  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
    {notification.type
      ?.replace(/_/g, " ")
      .toUpperCase()}
  </span>
</div>

            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                notification.is_read
                  ? "bg-slate-100 text-slate-500"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {notification.is_read ? "Read" : "Unread"}
            </span>
          </div>

          <p className="text-slate-500 mt-1">
            {notification.message}
          </p>

          <p className="text-xs text-slate-400 mt-2">
            {new Date(notification.created_at).toLocaleString()}
          </p>
                </button>
            ))}
    </div>
  )}
</div>

    </div>
  )}
   
</section>
{tasks.length > 5 && (
  <p className="text-xs text-slate-400 mt-4">
    Showing latest 5 tasks.
  </p>
)}

<section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-xl font-semibold">Recent Activity</h2>
      <p className="text-sm text-slate-500">
        Latest operational activity across your ERP system.
      </p>
    </div>
  </div>

  <div className="space-y-3">
    {tasks.slice(0, 5).map((task) => (
      <div
        key={task.id}
        className="border border-gray-100 rounded-xl p-4 flex items-center justify-between"
      >
        <div>
          <p className="font-medium">{task.title}</p>

          <p className="text-sm text-slate-500">
            Status: {task.status.replace("_", " ")}
          </p>
        </div>

        <span className="text-xs text-slate-400">
          {task.priority}
        </span>
      </div>
    ))}

    {tasks.length === 0 && (
      <div className="border border-dashed rounded-xl p-6 text-center text-slate-500">
        No recent activity yet.
      </div>
    )}
  </div>
</section>

      {/* BASIC ERP MODULE SNAPSHOT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="bg-white border rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Production</h2>
          <p className="text-sm text-slate-500">Open jobs, work orders, and production tasks.</p>
          <p className="text-2xl font-bold mt-4">{openWorkOrders}</p>
        </section>

        <section className="bg-white border rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Inventory</h2>
          <p className="text-sm text-slate-500">Materials, parts, stock levels, and low-stock alerts.</p>
          <p className="text-2xl font-bold mt-4">
          {inventoryItems.length} items / $
          {totalInventoryValue.toFixed(2)}
        </p>
        </section>

        <section className="bg-white border rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Finance</h2>
          <p className="text-sm text-slate-500">Receivables, payables, purchasing, and sales totals.</p>
          <p className="text-2xl font-bold mt-4">Coming Soon</p>
        </section>
       </div>
    </>
  )}
{activeModule === "Production" &&
  (isAdmin || isManager) && (
  <section className="space-y-6">

    {/* Production Header */}
    <div>
      <h2 className="text-2xl font-bold">Production</h2>
      <p className="text-slate-500">
        Manage work orders and manufacturing jobs
      </p>
    </div>

    {/* Production KPIs */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Open Work Orders</p>
        <p className="text-2xl font-bold">{openWorkOrders}</p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">In Progress</p>
        <p className="text-2xl font-bold">{inProgressTasks}</p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Completed</p>
        <p className="text-2xl font-bold">{completedTasks}</p>
      </div>
    </div>

    {/* Work Orders */}
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold mb-4">Work Orders</h3>

      {tasks.map((task) => (
        <div
          key={task.id}
          className="border rounded-lg p-4 mb-3 flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">{task.title}</p>
            <p className="text-sm text-gray-500">{task.status}</p>
          </div>

          <span className="text-sm font-medium">
            {task.priority}
          </span>
        </div>
      ))}
    </section>

  </section>
)}
{activeModule === "Inventory" && canManageInventory && (
  <section className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold">Inventory</h2>
      <p className="text-slate-500">
        Track materials, stock levels, parts, reorder alerts, and inventory value.
      </p>
      <button
  type="button"
  onClick={() =>
    exportToCsv(
      "inventory-items.csv",
      filteredInventoryItems.map((item: any) => ({
        sku: item.sku,
        item_name: item.item_name,
        category: item.category,
        quantity_on_hand: item.quantity_on_hand,
        reorder_level: item.reorder_level,
        unit_cost: item.unit_cost,
        status: item.status,
      }))
    )
  }
  className="mt-4 bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
>
  Export Inventory CSV
</button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Total Items</p>
        <p className="text-2xl font-bold">{inventoryItems.length}</p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Low Stock</p>
        <p className="text-2xl font-bold">
          {
            inventoryItems.filter(
            (item) =>
            Number(item.reorder_level || 0) > 0 &&
            Number(item.quantity_on_hand || 0) <=
            Number(item.reorder_level || 0)
            ).length
          }
        </p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Inventory Value</p>
        <p className="text-2xl font-bold">
          $
          {inventoryItems
            .reduce(
              (sum, item) =>
                sum +
                Number(item.quantity_on_hand || 0) *
                  Number(item.unit_cost || 0),
              0
            )
            .toFixed(2)}
        </p>
      </div>
    </div>

    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">

      <form onSubmit={handleCreateInventoryItem} className="grid gap-3 md:grid-cols-6 mb-6">
        <input
          value={newInventorySku}
          onChange={(e) => setNewInventorySku(e.target.value)}
          placeholder="SKU"
          className="border px-3 py-2 rounded-lg"
        />

        <input
          value={newInventoryName}
          onChange={(e) => setNewInventoryName(e.target.value)}
          placeholder="Item name"
          className="border px-3 py-2 rounded-lg"
        />

        <input
          value={newInventoryCategory}
          onChange={(e) => setNewInventoryCategory(e.target.value)}
          placeholder="Category"
          className="border px-3 py-2 rounded-lg"
        />

        <input
          type="number"
          placeholder="Quantity"
          value={movementQuantity}
          onChange={(e) => setMovementQuantity(Number(e.target.value))}
          className="border border-slate-300 rounded-lg px-3 py-2"
        />

        <input
          type="number"
          step="0.01"
          value={newInventoryReorderLevel}
          onChange={(e) => setNewInventoryReorderLevel(e.target.value)}
          placeholder="Reorder level"
          className="border px-3 py-2 rounded-lg"
        />

        <input
          type="number"
          step="0.01"
          value={newInventoryUnitCost}
          onChange={(e) => setNewInventoryUnitCost(e.target.value)}
          placeholder="Unit cost"
          className="border px-3 py-2 rounded-lg"
        />

        <button
          type="submit"
          className="bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
        >
          Add Inventory Item
        </button>
      </form>

      {inventoryItems.length === 0 && (
        <div className="border border-dashed rounded-xl p-6 text-center text-slate-500">
          No inventory items created yet.
        </div>
      )}
<h3 className="text-lg font-semibold mb-4">Inventory Items</h3>

<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
  <input
    type="text"
    placeholder="Search by SKU, name, or category"
    value={inventorySearch}
    onChange={(e) => setInventorySearch(e.target.value)}
    className="border border-slate-300 rounded-lg px-3 py-2"
  />

  <select
    value={inventoryCategoryFilter}
    onChange={(e) => setInventoryCategoryFilter(e.target.value)}
    className="border border-slate-300 rounded-lg px-3 py-2"
  >
    <option value="all">All Categories</option>
    {inventoryCategories.map((category: any) => (
      <option key={category} value={category}>
        {category}
      </option>
    ))}
  </select>

  <label className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2">
    <input
      type="checkbox"
      checked={showLowStockOnly}
      onChange={(e) => setShowLowStockOnly(e.target.checked)}
    />
    <span className="text-sm text-slate-700">Low stock only</span>
  </label>
</div>

      <div className="grid gap-3">
        {filteredInventoryItems.map((item: any) => (
          <div
            key={item.id}
            className={`border rounded-xl p-4 grid gap-3 md:grid-cols-7 ${
            Number(item.quantity_on_hand || 0) <=
            Number(item.reorder_level || 0)
            ? "border-red-400 bg-red-50"
            : "border-slate-200 bg-white"
            }`}
          >
            <div>
          <p className="text-xs text-slate-500 mb-1">SKU</p>
          <input
          value={item.sku}
          onChange={(e) =>
          updateInventoryItem(item.id, { sku: e.target.value })
          }
          className="border px-3 py-2 rounded-lg w-full"
          />
          </div>

            <div>
          <p className="text-xs text-slate-500 mb-1">Item Name</p>
          <input
          value={item.item_name}
          onChange={(e) =>
          updateInventoryItem(item.id, { item_name: e.target.value })
          }
          className="border px-3 py-2 rounded-lg w-full"
          />
          </div>
            {Number(item.reorder_level || 0) > 0 &&
            Number(item.quantity_on_hand || 0) <= Number(item.reorder_level || 0) && (
            <div className="flex items-center">
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
             LOW STOCK
             </span>
              </div>
              )}

            <div>
            <p className="text-xs text-slate-500 mb-1">Category</p>
            <input
             value={item.category || ""}
             onChange={(e) =>
             updateInventoryItem(item.id, {
             category: e.target.value === "" ? null : e.target.value,
            })
            }
            placeholder="Category"
            className="border px-3 py-2 rounded-lg w-full"
             />
            </div>

            <div>
            <p className="text-xs text-slate-500 mb-1">Quantity On Hand</p>
            <input
            type="number"
            step="0.01"
            value={item.quantity_on_hand}
            onChange={(e) =>
            updateInventoryItem(item.id, {
            quantity_on_hand:
            e.target.value === "" ? 0 : Number(e.target.value),
            })
            }
           className="border px-3 py-2 rounded-lg w-full"
           />
            </div>

            <div>
            <p className="text-xs text-slate-500 mb-1">Reorder Level</p>
            <input
            type="number"
            step="0.01"
            value={item.reorder_level}
            onChange={(e) =>
           updateInventoryItem(item.id, {
            reorder_level:
           e.target.value === "" ? 0 : Number(e.target.value),
           })
           }
           className="border px-3 py-2 rounded-lg w-full"
           />
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Unit Cost</p>
              <input
                type="number"
                step="0.01"
                value={item.unit_cost}
                onChange={(e) =>
                  updateInventoryItem(item.id, {
                  unit_cost:
                    e.target.value === "" ? 0 : Number(e.target.value),
                })
              }
               className="border px-3 py-2 rounded-lg w-full"
            />
          </div>

            {isAdmin && (
            <button
            type="button"
            onClick={() => archiveInventoryItem(item.id)}
            className="bg-slate-600 text-white px-3 py-2 rounded-lg"
            >
            Archive Item
            </button>
            )}
          </div>
        ))}
      </div>
    </section>
   {archivedInventoryItems.length > 0 && (
  <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
    <h3 className="text-lg font-semibold mb-4">
      Archived Inventory Items
    </h3>

    <p className="text-sm text-slate-500">
      Archived inventory items are hidden from active inventory views but retained for audit history.
    </p>
    <div className="grid gap-3 mt-4">
  {archivedInventoryItems.map((item: any) => (
    <div
      key={item.id}
      className="border rounded-xl p-4 bg-slate-50"
    >
      <div className="font-semibold">
        {item.item_name}
      </div>

      <div className="text-sm text-slate-500 mt-1">
        SKU: {item.sku || "No SKU"}
      </div>

      <div className="text-sm text-slate-500 mt-1">
        Quantity: {Number(item.quantity_on_hand || 0)}
      </div>

      <div className="text-sm text-slate-500 mt-1">
        Unit Cost: ${Number(item.unit_cost || 0).toFixed(2)}
      </div>
     {isAdmin && (
  <button
    type="button"
    onClick={() => restoreInventoryItem(item.id)}
    className="mt-3 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition"
  >
    Restore Inventory Item
  </button>
)}
    </div>
  ))}
</div>

  </section>
)}

    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
  <h3 className="text-lg font-semibold mb-4">
    Inventory Upload
  </h3>

  <p className="text-sm text-slate-500 mb-4">
    Upload inventory using CSV or Excel files.
  </p>

  <div className="border border-dashed rounded-xl p-6">

 <input
  id="inventory-upload-input"
  type="file"
  accept=".csv,.xlsx,.xls"
  onChange={handleInventoryFileUpload}
  className="hidden"
/>

<label
  htmlFor="inventory-upload-input"
  className="inline-flex items-center px-4 py-2 mb-4 bg-slate-950 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium cursor-pointer"
>
  Choose Inventory File
</label>
{selectedInventoryFileName && (
  <span className="ml-3 text-sm text-slate-600">
    Selected: {selectedInventoryFileName}
  </span>
)}

<label className="flex items-center gap-2 text-sm text-slate-700 mb-4">
  <input
    type="checkbox"
    checked={updateExistingInventory}
    onChange={(e) => setUpdateExistingInventory(e.target.checked)}
  />
  Update existing SKUs instead of blocking duplicates
</label>

{inventoryUploadSuccess && (
  <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-4">
    {inventoryUploadSuccess}
    {lastInventoryImportTime && (
    <p className="text-xs text-slate-500 mt-1">
    Last Import: {lastInventoryImportTime}
     </p>
    )}
     </div>
    )}

{inventoryUploadErrors.length > 0 && (
  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
    <p className="font-semibold mb-2">Upload Errors</p>
    <ul className="list-disc pl-5 text-sm">
      {inventoryUploadErrors.map((err, index) => (
        <li key={index}>{err}</li>
      ))}
    </ul>
  </div>
)}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
  <div className="bg-slate-50 border rounded-xl p-4">
    <p className="text-sm text-slate-500">Rows Ready</p>
    <p className="text-2xl font-bold">
      {inventoryUploadRows.length}
    </p>
  </div>

  <div className="bg-slate-50 border rounded-xl p-4">
    <p className="text-sm text-slate-500">Low Stock Rows</p>
    <p className="text-2xl font-bold">
      {
        inventoryUploadRows.filter(
          (row) =>
            Number(row.reorder_level || 0) > 0 &&
            Number(row.quantity_on_hand || 0) <=
              Number(row.reorder_level || 0)
        ).length
      }
    </p>
  </div>

  <div className="bg-slate-50 border rounded-xl p-4">
    <p className="text-sm text-slate-500">Upload Inventory Value</p>
    <p className="text-2xl font-bold">
      $
      {inventoryUploadRows
        .reduce(
          (sum, row) =>
            sum +
            Number(row.quantity_on_hand || 0) *
              Number(row.unit_cost || 0),
          0
        )
        .toFixed(2)}
    </p>
  </div>
</div>
   {inventoryUploadRows.length > 0 && (
  <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
    <p className="text-xs text-slate-500">Rows Ready</p>
    <p className="text-xl font-bold text-slate-900">
      {inventoryUploadRows.length}
    </p>
  </div>

  <div className="border border-green-200 rounded-xl p-3 bg-green-50">
    <p className="text-xs text-green-700">New Items</p>
    <p className="text-xl font-bold text-green-700">
      {
        inventoryUploadRows.filter(
          (row) =>
            !inventoryItems.some(
              (item) =>
                item.sku?.toLowerCase().trim() ===
                row.sku?.toLowerCase().trim()
            )
        ).length
      }
    </p>
  </div>

  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
  <p className="text-xs text-slate-500">Preview Value</p>

  <p className="text-xl font-bold text-slate-900">
    $
    {inventoryUploadRows
      .reduce(
        (total, row) =>
          total +
          Number(row.quantity_on_hand || 0) *
            Number(row.unit_cost || 0),
        0
      )
      .toFixed(2)}
  </p>
</div>

  <div className="border border-amber-200 rounded-xl p-3 bg-amber-50">
    <p className="text-xs text-amber-700">Existing SKUs</p>
    <p className="text-xl font-bold text-amber-700">
      {
        inventoryUploadRows.filter((row) =>
          inventoryItems.some(
            (item) =>
              item.sku?.toLowerCase().trim() ===
              row.sku?.toLowerCase().trim()
          )
        ).length
      }
    </p>
  </div>
</div>
{inventoryUploadRows.some((row) =>
  inventoryItems.some(
    (item) =>
      item.sku?.toLowerCase().trim() ===
      row.sku?.toLowerCase().trim()
  )
) &&
  !updateExistingInventory && (
    <div className="border border-amber-300 bg-amber-50 text-amber-800 rounded-xl p-3 text-sm">
      Existing SKUs detected. Enable update existing SKUs to continue.
    </div>
  )}

<div>
  <h4 className="font-semibold text-slate-900">Upload Preview</h4>
  <p className="text-sm text-slate-500">
    Review rows before importing.
  </p>
</div>

      <div className="overflow-x-auto border rounded-lg">
  <table className="min-w-full text-sm">
    <thead className="bg-slate-100">
      <tr>
        <th className="text-left px-3 py-2">SKU</th>
        <th className="text-left px-3 py-2">Item Name</th>
        <th className="text-left px-3 py-2">Category</th>
        <th className="text-left px-3 py-2">Qty</th>
        <th className="text-left px-3 py-2">Reorder</th>
        <th className="text-left px-3 py-2">Unit Cost</th>
        <th className="text-left px-3 py-2">Status</th>
      </tr>
    </thead>

    <tbody>
      {inventoryUploadRows.map((row, index) => (
        <tr
        key={index}
        className={`border-t ${
        inventoryItems.some(
        (item) =>
        item.sku?.toLowerCase().trim() ===
        row.sku?.toLowerCase().trim()
        )
        ? "bg-amber-50"
        : "bg-white"
        }`}
        >
          <td className="px-3 py-2">{row.sku}</td>
          <td className="px-3 py-2">{row.item_name}</td>
          <td className="px-3 py-2">{row.category}</td>
          <td className="px-3 py-2">{row.quantity_on_hand}</td>
          <td className="px-3 py-2">{row.reorder_level}</td>
          <td className="px-3 py-2">
            ${Number(row.unit_cost || 0).toFixed(2)}
          </td>
          <td className="px-3 py-2">
          {inventoryItems.some(
          (item) =>
          item.sku?.toLowerCase().trim() ===
          row.sku?.toLowerCase().trim()
          ) ? (
          <span className="text-amber-600 font-medium">
          Existing SKU
          </span>
          ) : (
          <span className="text-green-600 font-medium">
          New Item
          </span>
          )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      <button
        type="button"
        onClick={importInventoryRows}
        disabled={
        uploadingInventory ||
        inventoryUploadRows.length === 0 ||
        inventoryUploadErrors.length > 0 ||
        (
    inventoryUploadRows.some((row) =>
      inventoryItems.some(
        (item) =>
          item.sku?.toLowerCase().trim() ===
          row.sku?.toLowerCase().trim()
      )
    ) && !updateExistingInventory
  )
}
        className={`px-4 py-2 rounded-lg ${
        uploadingInventory ||
        inventoryUploadErrors.length > 0 ||
        (
        inventoryUploadRows.some((row) =>
        inventoryItems.some(
        (item) =>
        item.sku?.toLowerCase().trim() ===
        row.sku?.toLowerCase().trim()
    )
  ) && !updateExistingInventory
)
  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
  : "bg-black text-white"
        }`}
      >
        {uploadingInventory ? "Importing..." : "Import Inventory Rows"}
</button>

<button
  type="button"
  onClick={() => {
  setInventoryUploadRows([])
  setInventoryUploadErrors([])
  setInventoryUploadSuccess("")
  setSelectedInventoryFileName("")
  setError("")
}}

  className="ml-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
>
  Clear Upload Preview
</button>

    </div>
  )}
</div>
</section>

<section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">

  <h3 className="text-lg font-semibold mb-4">
    Inventory Movements
  </h3>

 <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 items-end">
  <div>
    <p className="text-xs text-slate-500 mb-1">
      Inventory Item
    </p>

    <select
      value={movementItemId}
      onChange={(e) => setMovementItemId(e.target.value)}
      className="border border-slate-300 rounded-lg px-3 py-2 w-full"
    >
      <option value="">Select Inventory Item</option>
      {activeInventoryItems.map((item) => (
        <option key={item.id} value={item.id}>
          {item.item_name} ({item.sku})
        </option>
      ))}
      </select>
      </div>

    <select
      value={movementType}
      onChange={(e) => setMovementType(e.target.value as "in" | "out")}
      className="border border-slate-300 rounded-lg px-3 py-2"
    >
      <option value="in">Stock In</option>
      <option value="out">Stock Out</option>
    </select>

      <input
      type="number"
      placeholder="Quantity Received"
      value={receiveQuantity}
      onChange={(e) => setReceiveQuantity(e.target.value)}
      className="border border-slate-300 rounded-lg px-3 py-2"
      />

    <input
      type="text"
      placeholder="Reason / notes"
      value={movementNotes}
      onChange={(e) => setMovementNotes(e.target.value)}
      className="border border-slate-300 rounded-lg px-3 py-2"
    />
    <div>
  <p className="text-xs text-slate-500 mb-1">
    Movement Type
  </p>

  <select
    value={movementType}
    onChange={(e) => setMovementType(e.target.value as "in" | "out")}
    className="border border-slate-300 rounded-lg px-3 py-2 w-full"
  >
    <option value="in">Stock In</option>
    <option value="out">Stock Out</option>
  </select>
</div>

<div>
  <p className="text-xs text-slate-500 mb-1">
    Quantity
  </p>

  <input
    type="number"
    placeholder="Quantity"
    value={movementQuantity}
    onChange={(e) => setMovementQuantity(Number(e.target.value))}
    className="border border-slate-300 rounded-lg px-3 py-2 w-full"
  />
</div>

<div>
  <p className="text-xs text-slate-500 mb-1">
    Reason / Notes
  </p>

  <input
    type="text"
    placeholder="Reason / notes"
    value={movementNotes}
    onChange={(e) => setMovementNotes(e.target.value)}
    className="border border-slate-300 rounded-lg px-3 py-2 w-full"
  />
</div>
  </div>

  <button
  type="button"
  onClick={(e) => handleCreateInventoryMovement(e)}
  className="bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium whitespace-nowrap"
>
  Record Inventory Movement
</button>

<div className="mt-6 flex flex-col md:flex-row gap-3">
  <input
    type="text"
    placeholder="Search movement notes..."
    value={movementSearch}
    onChange={(e) => setMovementSearch(e.target.value)}
    className="border border-slate-300 rounded-lg px-3 py-2 w-full"
  />

  <select
    value={movementTypeFilter}
    onChange={(e) => setMovementTypeFilter(e.target.value)}
    className="border border-slate-300 rounded-lg px-3 py-2"
  >
    <option value="all">All Movement Types</option>
    <option value="in">In</option>
    <option value="out">Out</option>
    <option value="adjustment">Adjustment</option>
  </select>
</div>

<div className="mt-8 overflow-x-auto">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b">
        <th className="text-left py-2">Item</th>
        <th className="text-left py-2">Type</th>
        <th className="text-left py-2">Quantity</th>
        <th className="text-left py-2">Notes</th>
        <th className="text-left py-2">Date</th>
      </tr>
    </thead>

    <tbody>
      {filteredInventoryMovements.map((movement) => {
        const item = inventoryItems.find(
          (i) => i.id === movement.inventory_item_id
        )

        return (
          <tr key={movement.id} className="border-b hover:bg-slate-50">
            <td className="py-2">{item?.item_name || "Unknown Item"}</td>

            <td className="py-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getMovementTypeBadgeClass(
                  movement.movement_type
                )}`}
              >
                {movement.movement_type === "in"
                  ? "Stock In"
                  : movement.movement_type === "out"
                  ? "Stock Out"
                  : movement.movement_type}
              </span>
            </td>

            <td className="py-2">{movement.quantity}</td>
            <td className="py-2">{movement.notes || "-"}</td>

            <td className="py-2">
              {movement.created_at
                ? new Date(movement.created_at).toLocaleString()
                : "-"}
            </td>
          </tr>
        )
      })}
    </tbody>
  </table>
</div>
</section>
</section>
)}
{activeModule === "Sales" && canManageSales && (
  <section className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold">Sales</h2>

      <p className="text-slate-500">
        Manage customer sales orders and revenue activity.
      </p>
      <button
  type="button"
  onClick={() =>
  exportToCsv(
    "sales-orders.csv",
    salesOrders
      .filter((order: any) => !order.is_archived)
      .map((order: any) => ({
        order_number: order.order_number,
        client:
          clients.find(
            (client) => client.id === order.client_id
          )?.name || "",
        status: order.status,
        total_amount: getSalesOrderItemTotal(order.id),
        notes: order.notes,
      }))
  )
}
  className="mt-4 bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
>
  Export Sales Orders CSV
</button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Sales Orders</p>

        <p className="text-2xl font-bold">
          {salesOrders.length}
        </p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Open Orders</p>

        <p className="text-2xl font-bold">
          {openSalesOrders.length}
        </p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Sales Value</p>

        <p className="text-2xl font-bold">
          ${totalSalesOrderValue.toFixed(2)}
        </p>
      </div>
    </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Draft</p>
        <p className="text-2xl font-bold">
          {draftSalesOrders.length}
        </p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Confirmed</p>
        <p className="text-2xl font-bold">
          {confirmedSalesOrders.length}
        </p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Shipped</p>
        <p className="text-2xl font-bold">
          {shippedSalesOrders.length}
        </p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Completed</p>
        <p className="text-2xl font-bold">
          {completedSalesOrders.length}
        </p>
      </div>
    </div>
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold mb-4">Sales Orders</h3>
      <div className="grid gap-3 md:grid-cols-2 mb-6">
  <input
    value={salesOrderSearch}
    onChange={(e) => setSalesOrderSearch(e.target.value)}
    placeholder="Search sales orders..."
    className="border px-3 py-2 rounded-lg"
  />

  <select
    value={salesOrderStatusFilter}
    onChange={(e) => setSalesOrderStatusFilter(e.target.value)}
    className="border px-3 py-2 rounded-lg"
  >
    <option value="all">All Statuses</option>
    <option value="draft">Draft</option>
    <option value="confirmed">Confirmed</option>
    <option value="shipped">Shipped</option>
    <option value="completed">Completed</option>
    <option value="cancelled">Cancelled</option>
  </select>
</div>

      {canManageSales && (
  <form
    onSubmit={createSalesOrder}
    className="grid gap-3 md:grid-cols-6 mb-6"
  >
        <input
          value={newSalesOrderNumber}
          onChange={(e) => setNewSalesOrderNumber(e.target.value)}
          placeholder="Sales order number"
          className="border px-3 py-2 rounded-lg"
        />

        <select
          value={newSalesOrderClientId}
          onChange={(e) => setNewSalesOrderClientId(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">No Client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>

        <select
          value={newSalesOrderCompanyId}
          onChange={(e) => setNewSalesOrderCompanyId(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">No Company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={newSalesOrderExpectedShipDate}
          onChange={(e) => setNewSalesOrderExpectedShipDate(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        />

        <input
          type="number"
          step="0.01"
          value={newSalesOrderTotalAmount}
          onChange={(e) => setNewSalesOrderTotalAmount(e.target.value)}
          placeholder="Total amount"
          className="border px-3 py-2 rounded-lg"
        />

        <input
          value={newSalesOrderNotes}
          onChange={(e) => setNewSalesOrderNotes(e.target.value)}
          placeholder="Notes"
          className="border px-3 py-2 rounded-lg"
        />

        <button
          type="submit"
          className="bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium md:col-span-6"
        >
          Add Sales Order
        </button>
       </form>
        )}
            {canManageSales && (
  <div className="border rounded-xl p-4 mb-6 bg-slate-50">
        <h4 className="font-semibold mb-3">Add Sales Order Line Item</h4>

        <form
          onSubmit={createSalesOrderItem}
          className="grid gap-3 md:grid-cols-5"
        >
          <select
            value={salesLineOrderId}
            onChange={(e) => setSalesLineOrderId(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="">Select Sales Order</option>
            {activeSalesOrders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.order_number}
              </option>
            ))}
          </select>

          <select
            value={salesLineInventoryItemId}
            onChange={(e) => {
              const selectedInventoryItem = inventoryItems.find(
                (item) => item.id === e.target.value
              )

              setSalesLineInventoryItemId(e.target.value)

              if (selectedInventoryItem) {
                setSalesLineItemName(selectedInventoryItem.item_name)
                setSalesLineUnitPrice(
                  Number(selectedInventoryItem.unit_cost || 0)
                )
              }
            }}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="">No Inventory Item</option>
            {activeInventoryItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.sku} — {item.item_name}
              </option>
            ))}
          </select>

          <input
            value={salesLineItemName}
            onChange={(e) => setSalesLineItemName(e.target.value)}
            placeholder="Item name"
            className="border px-3 py-2 rounded-lg"
          />

          <input
            type="number"
            min="1"
            value={salesLineQuantity}
            onChange={(e) =>
              setSalesLineQuantity(Number(e.target.value))
            }
            placeholder="Quantity"
            className="border px-3 py-2 rounded-lg"
          />

          <input
            type="number"
            step="0.01"
            min="0"
            value={salesLineUnitPrice}
            onChange={(e) =>
              setSalesLineUnitPrice(Number(e.target.value))
            }
            placeholder="Unit price"
            className="border px-3 py-2 rounded-lg"
          />

          <button
            type="submit"
            className="bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium md:col-span-5"
          >
            Add Line Item
          </button>
        </form>
  </div>
)}

{activeSalesOrders.length === 0 && (
        <div className="border border-dashed rounded-xl p-6 text-center text-slate-500">
          No sales orders created yet.
        </div>
      )}

      <div className="grid gap-3">
        {filteredSalesOrders.map((order) => (
          <div
            key={order.id}
            className="border rounded-xl p-4 grid gap-3 md:grid-cols-6"
          >
            <div>
              <p className="text-xs text-slate-500">Order Number</p>
              <p className="font-semibold">{order.order_number}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Client</p>
              <p>
                {clients.find((client) => client.id === order.client_id)?.name ||
                  "No client"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Status</p>
              <select
              value={order.status}
              disabled={!canManageSales}
              onChange={(e) =>
              updateSalesOrder(order.id, { status: e.target.value })
              }
              className="border px-3 py-2 rounded-lg w-full disabled:bg-slate-100 disabled:text-slate-500"
              >
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            </div>
            <div>
            <p className="text-xs text-slate-500">
            Fulfillment
            </p>

            <p className="font-medium">
            {getSalesOrderFulfillmentStatus(order.id)}
            </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Ship Date</p>
              <p>{order.expected_ship_date || "No ship date"}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Total</p>
              <p>${getSalesOrderItemTotal(order.id).toFixed(2)}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Notes</p>
              <p>{order.notes || "No notes"}</p>
            </div>
            {isAdmin && (
            <button
            type="button"
            onClick={() => archiveSalesOrder(order.id)}
            className="bg-slate-600 text-white px-3 py-2 rounded-lg"
             >
            Archive Sales Order
            </button>
            )}
              <div className="md:col-span-6 border-t pt-3 mt-2">
              <p className="text-xs font-semibold text-slate-500 mb-2">
                Line Items
              </p>

              {salesOrderItems.filter(
                (item) => item.sales_order_id === order.id
              ).length === 0 ? (
                <p className="text-sm text-slate-400">
                  No line items added yet.
                </p>
              ) : (
                <div className="grid gap-2">
                  {salesOrderItems
                    .filter((item) => item.sales_order_id === order.id)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="grid gap-2 md:grid-cols-5 text-sm border rounded-lg p-3 bg-slate-50"
                      >
                        <div>
                          <p className="text-xs text-slate-500">Item</p>
                          <p className="font-medium">{item.item_name}</p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">Qty</p>
                          <p>{item.quantity}</p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">Fulfilled</p>
                          <p>{item.fulfilled_quantity || 0}</p>
                        </div>
                        <div>
                        <p className="text-xs text-slate-500">Remaining</p>
                        <p>
                        {Math.max(
                         Number(item.quantity || 0) -
                         Number(item.fulfilled_quantity || 0),
                         0
                        )}
                        </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">Unit Price</p>
                          <p>${Number(item.unit_price || 0).toFixed(2)}</p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">Line Total</p>
                          <p>
                            $
                            {(
                              Number(item.quantity || 0) *
                              Number(item.unit_price || 0)
                            ).toFixed(2)}
                          </p>
                        </div>

                        <div className="md:col-span-5 flex justify-end">
                        <button
                        type="button"
                        onClick={() => fulfillSalesOrderItem(item)}
                        disabled={
                        !canManageSales ||
                        Number(item.fulfilled_quantity || 0) >=
                        Number(item.quantity || 0)
                        }
                        className="bg-green-600 text-white px-3 py-2 rounded-lg disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                        {!canManageSales
                        ? "View Only"
                        : Number(item.fulfilled_quantity || 0) >= Number(item.quantity || 0)
                        ? "Fulfilled"
                        : "Fulfill Item"}
                        </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
    {archivedSalesOrders.length > 0 && (
  <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
    <h3 className="text-lg font-semibold mb-4">
      Archived Sales Orders
    </h3>

    <p className="text-sm text-slate-500">
      Archived sales orders are hidden from active sales views but retained for audit history.
    </p>
    <div className="grid gap-3 mt-4">
  {archivedSalesOrders.map((order) => (
    <div
      key={order.id}
      className="border rounded-xl p-4 bg-slate-50"
    >
      <div className="font-semibold">
        {order.order_number}
      </div>

      <div className="text-sm text-slate-500 mt-1">
        {clients.find(
          (client) => client.id === order.client_id
        )?.name || "No client"}
      </div>

      <div className="text-sm text-slate-500 mt-1">
        Status: {order.status}
      </div>

      <div className="text-sm text-slate-500 mt-1">
        Total: ${getSalesOrderItemTotal(order.id).toFixed(2)}
      </div>

      <div className="text-sm text-slate-500 mt-1">
        Notes: {order.notes || "No notes"}
      </div>
      <button
      type="button"
      onClick={() => restoreSalesOrder(order.id)}
      className="mt-3 bg-green-600 text-white px-3 py-2 rounded-lg"
      >
      Restore Sales Order
      </button>
      </div>
      ))}
      </div>
      </section>
      )}
    </section>
)}
{activeModule === "Purchasing" && canManagePurchasing && (

  <section className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold">Purchasing</h2>
      <p className="text-slate-500">
        Manage suppliers, purchase orders, material requests, and receiving.
      </p>
      <button
  type="button"
  onClick={() =>
    exportToCsv(
      "purchase-orders.csv",
      filteredPurchaseOrders.map((po: any) => ({
        po_number: po.po_number,
        supplier:
          suppliers.find((supplier) => supplier.id === po.supplier_id)
            ?.supplier_name || "",
        company:
          companies.find((company) => company.id === po.company_id)?.name || "",
        status: po.status,
        order_date: po.order_date,
        expected_date: po.expected_date,
        total_amount: po.total_amount,
        notes: po.notes,
      }))
    )
  }
  className="mt-4 bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
>
  Export Purchase Orders CSV
</button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Open Purchase Orders</p>
        <p className="text-2xl font-bold">{openPurchaseOrders}</p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Received Movements</p>
        <p className="text-2xl font-bold">
       {
         inventoryMovements.filter(
        (movement) => movement.movement_type === "in"
         ).length
          }
        </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
  <p className="text-sm text-slate-500">PO Line Items</p>
  <p className="text-2xl font-bold text-slate-900">
    {purchaseOrderItems.length}
  </p>
</div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Supplier Count</p>
        <p className="text-2xl font-bold">{suppliers.length}</p>
      </div>
      <div className="bg-white border rounded-xl p-4">
      <p className="text-sm text-gray-500">PO Total Value</p>

      <p className="text-2xl font-bold">
      $
      {purchaseOrders
       .filter(
      (po) =>
      po.status === "ordered" ||
      po.status === "received"
      )
      .reduce(
     (sum, po) => sum + Number(po.total_amount || 0),
      0
      )
      .toFixed(2)}
      </p>
      </div>
      </div>
      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Ordered PO Value</p>
        <p className="text-2xl font-bold">
        ${activePurchaseOrderValue.toFixed(2)}
      </p>
     </div>
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold mb-4">Suppliers</h3>

     {canManagePurchasing && (
  <form
    onSubmit={handleCreateSupplier}
    className="grid gap-3 md:grid-cols-5 mb-6"
  >
        <input
          value={newSupplierName}
          onChange={(e) => setNewSupplierName(e.target.value)}
          placeholder="Supplier name"
          className="border px-3 py-2 rounded-lg"
        />

        <input
          value={newSupplierContact}
          onChange={(e) => setNewSupplierContact(e.target.value)}
          placeholder="Contact name"
          className="border px-3 py-2 rounded-lg"
        />

        <input
          value={newSupplierEmail}
          onChange={(e) => setNewSupplierEmail(e.target.value)}
          placeholder="Email"
          className="border px-3 py-2 rounded-lg"
        />

        <input
          value={newSupplierPhone}
          onChange={(e) => setNewSupplierPhone(e.target.value)}
          placeholder="Phone"
          className="border px-3 py-2 rounded-lg"
        />

        <select
          value={newSupplierCompanyId}
          onChange={(e) => setNewSupplierCompanyId(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">No Company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>

                 <button
          type="submit"
          className="bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
        >
          Add Supplier
        </button>
      </form>
    )}

    {activeSuppliers.length === 0 && (
      <div className="border border-dashed rounded-xl p-6 text-center text-slate-500">
        No suppliers created yet.
      </div>
    )}
    <div className="grid gap-3">
      {activeSuppliers.map((supplier) => (
        <div
      key={supplier.id}
      className="border rounded-xl p-4 grid gap-3 md:grid-cols-5"
    >
      <input
  value={supplier.supplier_name}
  disabled={!canManagePurchasing}
  onChange={(e) =>
    updateSupplier(supplier.id, { supplier_name: e.target.value })
  }
  className="border px-3 py-2 rounded-lg disabled:bg-slate-100 disabled:text-slate-500"
/>

      <input
        value={supplier.contact_name || ""}
        disabled={!canManagePurchasing}
        onChange={(e) =>
          updateSupplier(supplier.id, {
            contact_name: e.target.value === "" ? null : e.target.value,
          })
        }
        placeholder="Contact"
        className="border px-3 py-2 rounded-lg disabled:bg-slate-100 disabled:text-slate-500"
      />

      <input
        value={supplier.email || ""}
        disabled={!canManagePurchasing}
        onChange={(e) =>
          updateSupplier(supplier.id, {
            email: e.target.value === "" ? null : e.target.value,
          })
        }
        placeholder="Email"
        className="border px-3 py-2 rounded-lg disabled:bg-slate-100 disabled:text-slate-500"
      />

      <input
        value={supplier.phone || ""}
        disabled={!canManagePurchasing}
        onChange={(e) =>
          updateSupplier(supplier.id, {
            phone: e.target.value === "" ? null : e.target.value,
          })
        }
        placeholder="Phone"
        className="border px-3 py-2 rounded-lg disabled:bg-slate-100 disabled:text-slate-500"
      />

      {isAdmin && (
  <button
    type="button"
    onClick={() => archiveSupplier(supplier.id)}
    className="bg-slate-600 text-white px-3 py-2 rounded-lg"
  >
    Archive Supplier
  </button>
)}
    </div>
  ))}
</div>
</section>
{archivedSuppliers.length > 0 && (
  <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
    <h3 className="text-lg font-semibold mb-4">
      Archived Suppliers
    </h3>

    <p className="text-sm text-slate-500">
      Archived suppliers are hidden from active purchasing views but retained for audit history.
    </p>
    <div className="grid gap-3 mt-4">
  {archivedSuppliers.map((supplier) => (
    <div
      key={supplier.id}
      className="border rounded-xl p-4 bg-slate-50"
    >
      <div className="font-semibold">
        {supplier.supplier_name}
      </div>

      <div className="text-sm text-slate-500 mt-1">
        Contact: {supplier.contact_name || "No contact"}
      </div>

      <div className="text-sm text-slate-500 mt-1">
        Email: {supplier.email || "No email"}
      </div>

      {isAdmin && (
  <button
    type="button"
    onClick={() => restoreSupplier(supplier.id)}
    className="mt-3 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition"
  >
    Restore Supplier
  </button>
)}
    </div>
  ))}
</div>
  </section>
)}
<section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
  <h3 className="text-lg font-semibold mb-4">Purchase Orders</h3>
  <div className="mb-4 flex flex-col md:flex-row gap-3">
  <input
    type="text"
    value={purchaseOrderSearch}
    onChange={(e) => setPurchaseOrderSearch(e.target.value)}
    placeholder="Search PO number or notes..."
    className="border border-slate-300 rounded-lg px-3 py-2 w-full"
  />

  <select
    value={purchaseOrderStatusFilter}
    onChange={(e) => setPurchaseOrderStatusFilter(e.target.value)}
    className="border border-slate-300 rounded-lg px-3 py-2 bg-white"
  >
    <option value="all">All PO Statuses</option>
    <option value="draft">Draft</option>
    <option value="ordered">Ordered</option>
    <option value="received">Received</option>
    <option value="cancelled">Cancelled</option>
  </select>
</div>

 {canManagePurchasing && (
  <form
    onSubmit={handleCreatePurchaseOrder}
    className="grid gap-3 md:grid-cols-6 mb-6"
  >

    <input
      value={newPoNumber}
      onChange={(e) => setNewPoNumber(e.target.value)}
      placeholder="PO number"
      className="border px-3 py-2 rounded-lg"
    />

    <select
      value={newPoSupplierId}
      onChange={(e) => setNewPoSupplierId(e.target.value)}
      className="border px-3 py-2 rounded-lg"
    >
      <option value="">No Supplier</option>
      {activeSuppliers.map((supplier) => (
      <option key={supplier.id} value={supplier.id}>
      {supplier.supplier_name}
      </option>
      ))}
      </select>

    <select
      value={newPoCompanyId}
      onChange={(e) => setNewPoCompanyId(e.target.value)}
      className="border px-3 py-2 rounded-lg"
    >
      <option value="">No Company</option>
      {companies.map((company) => (
        <option key={company.id} value={company.id}>
          {company.name}
        </option>
      ))}
    </select>

    <input
      type="date"
      value={newPoExpectedDate}
      onChange={(e) => setNewPoExpectedDate(e.target.value)}
      className="border px-3 py-2 rounded-lg"
    />

    <input
      type="number"
      step="0.01"
      value={newPoTotalAmount}
      onChange={(e) => setNewPoTotalAmount(e.target.value)}
      placeholder="Total amount"
      className="border px-3 py-2 rounded-lg"
    />

    <input
      value={newPoNotes}
      onChange={(e) => setNewPoNotes(e.target.value)}
      placeholder="Notes"
      className="border px-3 py-2 rounded-lg"
    />

    <button
      type="submit"
      className="bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
    >
      Add Purchase Order
    </button>
     </form>
)}

  {canManagePurchasing && (
  <div className="mt-6 border-t pt-6">
  <h4 className="font-semibold mb-3">Add Purchase Order Line Item</h4>

  <form
    onSubmit={createPurchaseOrderItem}
    className="grid gap-3 md:grid-cols-5"
  >
    <select
      value={lineItemPoId}
      onChange={(e) => setLineItemPoId(e.target.value)}
      className="border px-3 py-2 rounded-lg"
    >
      <option value="">Select Purchase Order</option>
      {activePurchaseOrders.map((po) => (
        <option key={po.id} value={po.id}>
          {po.po_number}
        </option>
      ))}
    </select>

    <select
      value={lineItemInventoryItemId}
      onChange={(e) => {
  const selectedItemId = e.target.value
  setLineItemInventoryItemId(selectedItemId)

  const selectedItem = inventoryItems.find(
    (item) => item.id === selectedItemId
  )

  if (selectedItem) {
    setLineItemName(selectedItem.item_name || "")
    setLineItemUnitCost(Number(selectedItem.unit_cost || 0))
  }
}}
      className="border px-3 py-2 rounded-lg"
    >
      <option value="">Optional Inventory Item</option>
      {activeInventoryItems.map((item) => (
        <option key={item.id} value={item.id}>
          {item.sku} — {item.item_name}
        </option>
      ))}
    </select>

    <input
      value={lineItemName}
      onChange={(e) => setLineItemName(e.target.value)}
      placeholder="Item name"
      className="border px-3 py-2 rounded-lg"
    />

    <input
  type="number"
  value={lineItemQuantity}
  onChange={(e) => setLineItemQuantity(Number(e.target.value))}
  placeholder="Quantity"
  className="border px-3 py-2 rounded-lg"
/>

    <input
  type="number"
  value={lineItemUnitCost}
  onChange={(e) => setLineItemUnitCost(Number(e.target.value))}
  placeholder="Unit cost"
  className="border px-3 py-2 rounded-lg"
/>

    <button
      type="submit"
      className="bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium md:col-span-5"
    >
      Add Line Item
    </button>
      </form>
  </div>
)}

{activePurchaseOrders.length === 0 && (
    <div className="border border-dashed rounded-xl p-6 text-center text-slate-500">
      No purchase orders created yet.
    </div>
  )}

  <div className="grid gap-3">
    {filteredPurchaseOrders.length === 0 && (
  <div className="border border-dashed rounded-xl p-6 text-center text-slate-500">
    No purchase orders match the current filters.
  </div>
)}
   {filteredPurchaseOrders.map((po) => (
      <div 
      key={po.id}
        className="border rounded-xl p-4 grid gap-3 md:grid-cols-7"
      >
        <input
          value={po.po_number}
          disabled={!canManagePurchasing}
          onChange={(e) =>
            updatePurchaseOrder(po.id, { po_number: e.target.value })
          }
          className="border px-3 py-2 rounded-lg disabled:bg-slate-100 disabled:text-slate-500"
        />

        <select
          value={po.status}
          disabled={!canManagePurchasing}
          onChange={(e) =>
            updatePurchaseOrder(po.id, { status: e.target.value })
          }
          className="border px-3 py-2 rounded-lg disabled:bg-slate-100 disabled:text-slate-500"
        >
          <option value="draft">Draft</option>
          <option value="ordered">Ordered</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div>
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
      po.status === "received"
        ? "bg-green-100 text-green-700"
        : po.status === "ordered"
        ? "bg-blue-100 text-blue-700"
        : po.status === "cancelled"
        ? "bg-slate-200 text-slate-700"
        : "bg-yellow-100 text-yellow-700"
    }`}
  >
    {po.status === "received"
      ? "Received"
      : po.status === "ordered"
      ? "Ordered"
      : po.status === "cancelled"
      ? "Cancelled"
      : "Draft"}
  </span>
</div>

        <input
          type="date"
          value={po.expected_date || ""}
          disabled={!canManagePurchasing}
          onChange={(e) =>
            updatePurchaseOrder(po.id, {
              expected_date: e.target.value === "" ? null : e.target.value,
            })
          }
          className="border px-3 py-2 rounded-lg disabled:bg-slate-100 disabled:text-slate-500"
        />

        <input
          type="number"
          step="0.01"
          value={po.total_amount ?? 0}
          disabled={!canManagePurchasing}
          onChange={(e) =>
            updatePurchaseOrder(po.id, {
              total_amount: e.target.value === "" ? 0 : Number(e.target.value),
            })
          }
          className="border px-3 py-2 rounded-lg"
        />

        <input
          value={po.notes || ""}
          disabled={!canManagePurchasing}
          onChange={(e) =>
            updatePurchaseOrder(po.id, {
              notes: e.target.value === "" ? null : e.target.value,
            })
          }
          placeholder="Notes"
          className="border px-3 py-2 rounded-lg"
        />

 {isAdmin &&
  po.status !== "received" &&
  po.status !== "cancelled" && (
    <button
      type="button"
      onClick={() =>
        updatePurchaseOrder(po.id, {
          status: "cancelled",
        })
      }
      className="bg-slate-600 text-white px-3 py-2 rounded-lg hover:bg-slate-700 transition"
    >
      Cancel PO
    </button>
  )}

<div className="mt-4 border-t pt-3 md:col-span-6">
  <p className="text-sm font-semibold text-slate-700 mb-2">
    Line Items
  </p>

  {purchaseOrderItems.filter(
    (item) => item.purchase_order_id === po.id
  ).length === 0 ? (
    <p className="text-sm text-slate-500">
      No line items added yet.
    </p>
  ) : (
    <div className="grid gap-2">
      {purchaseOrderItems
        .filter((item) => item.purchase_order_id === po.id)
        .map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-3 text-sm bg-slate-50"
          >
            <div className="grid gap-2 md:grid-cols-3">
  <input
    value={item.item_name || ""}
    onChange={(e) =>
      updatePurchaseOrderItem(item.id, {
        item_name: e.target.value,
      })
    }
    className="border px-3 py-2 rounded-lg bg-white"
  />

  <input
    type="number"
    value={item.quantity || 0}
    onChange={(e) =>
      updatePurchaseOrderItem(item.id, {
        quantity: Number(e.target.value),
      })
    }
    className="border px-3 py-2 rounded-lg bg-white"
  />

  <input
    type="number"
    step="0.01"
    value={item.unit_cost || 0}
    onChange={(e) =>
      updatePurchaseOrderItem(item.id, {
        unit_cost: Number(e.target.value),
      })
    }
    className="border px-3 py-2 rounded-lg bg-white"
    />
    </div>

    <div className="text-slate-500 mt-2">
  Received:{" "}
  {Math.min(
    Number(item.received_quantity || 0),
    Number(item.quantity || 0)
  )}
</div>

                       <div className="text-slate-700 mt-1 font-medium">
              Line Total: $
              {(
                Number(item.quantity || 0) *
                Number(item.unit_cost || 0)
              ).toFixed(2)}
            </div>
          </div>
        ))}
    </div>
  )}
</div>

      </div>
    ))}
   </div>
</section>

<section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
  <h3 className="text-lg font-semibold mb-4">Purchase Order Items</h3>

  <p className="text-sm text-slate-500 mb-4">
  {purchaseOrderItems.length} line item(s) tracked across all purchase orders.{" "}
  {purchaseOrderItems.filter(
    (item) => Number(item.received_quantity || 0) >= Number(item.quantity || 0)
  ).length} received,{" "}
  {purchaseOrderItems.filter(
    (item) => Number(item.received_quantity || 0) < Number(item.quantity || 0)
  ).length} open.
</p>

  {purchaseOrderItems.length === 0 ? (
  <div className="border border-dashed rounded-xl p-6 text-center text-slate-500">
    No purchase order line items created yet.
  </div>
) : (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left text-slate-500">
          <th className="py-2 pr-4">PO Number</th>
          <th className="py-2 pr-4">Inventory Item</th>
          <th className="py-2 pr-4">Ordered Qty</th>
          <th className="py-2 pr-4">Received Qty</th>
          <th className="py-2 pr-4">Remaining Qty</th>
          <th className="py-2 pr-4">Status</th>
        </tr>
      </thead>

      <tbody>
        {purchaseOrderItems.map((poItem) => {
          const po = purchaseOrders.find(
            (purchaseOrder) => purchaseOrder.id === poItem.purchase_order_id
          )

          const inventoryItem = inventoryItems.find(
            (item) => item.id === poItem.inventory_item_id
          )

          const orderedQty = Number(poItem.quantity || 0)
          const receivedQty = Number(poItem.received_quantity || 0)
          const displayReceivedQty = Math.min(receivedQty, orderedQty)
          const remainingQty = Math.max(orderedQty - receivedQty, 0)

          return (
            <tr key={poItem.id} className="border-b">
              <td className="py-3 pr-4">
                {po?.po_number || "Unknown PO"}
              </td>

              <td className="py-3 pr-4">
                {inventoryItem?.item_name || poItem.item_name || "Unknown Item"}
              </td>

              <td className="py-3 pr-4">
                {orderedQty}
              </td>

              <td className="py-3 pr-4">
                {displayReceivedQty}
              </td>

              <td className="py-3 pr-4">
  <span
    className={`font-medium ${
      remainingQty === 0 ? "text-green-700" : "text-slate-900"
    }`}
  >
    {remainingQty}
  </span>
</td>

              <td className="py-3 pr-4">
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
      remainingQty === 0
        ? "bg-green-100 text-green-700"
        : "bg-yellow-100 text-yellow-700"
    }`}
  >
    {remainingQty === 0 ? "Received" : "Open"}
  </span>
</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)}
</section>

<section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
  <h3 className="text-lg font-semibold mb-4">
    Receive Inventory
  </h3>

  {canManagePurchasing && (
  <>
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
  <select
    value={receivePoId}
    onChange={(e) => setReceivePoId(e.target.value)}
    className="border border-slate-300 rounded-lg px-3 py-2"
  >
    <option value="">Select Purchase Order</option>
    {purchaseOrders
      .filter((po) => po.status !== "received" && po.status !== "cancelled")
      .map((po) => (
        <option key={po.id} value={po.id}>
          {po.po_number}
        </option>
      ))}
  </select>

  <select
    value={receivePurchaseOrderItemId}
    onChange={(e) => setReceivePurchaseOrderItemId(e.target.value)}
    className="border border-slate-300 rounded-lg px-3 py-2"
  >
    <option value="">Select Purchase Order Item</option>
    {purchaseOrderItems
      .filter((item) => item.purchase_order_id === receivePoId)
      .map((item) => (
        <option key={item.id} value={item.id}>
          {item.item_name} — Ordered: {item.quantity} — Received:{" "}
          {item.received_quantity || 0}
        </option>
      ))}
  </select>

  <select
    value={receiveInventoryItemId}
    onChange={(e) => setReceiveInventoryItemId(e.target.value)}
    className="border border-slate-300 rounded-lg px-3 py-2"
  >
    <option value="">Select Inventory Item</option>
    {activeInventoryItems.map((item) => (
      <option key={item.id} value={item.id}>
        {item.item_name} ({item.sku})
      </option>
    ))}
  </select>

  <input
    type="number"
    placeholder="Quantity Received"
    value={receiveQuantity}
    onChange={(e) => setReceiveQuantity(e.target.value)}
    className="border border-slate-300 rounded-lg px-3 py-2"
  />

  <input
    type="text"
    placeholder="Receiving Notes"
    value={receiveNotes}
    onChange={(e) => setReceiveNotes(e.target.value)}
    className="border border-slate-300 rounded-lg px-3 py-2"
  />
</div>

 <button
  type="button"
  onClick={handleReceiveInventory}
  className="bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
>
  Receive Inventory
</button>
  </>
)}

<div className="mt-6 border-t pt-4">
  <h4 className="font-semibold mb-3">
    Recent Receiving History
  </h4>

  {inventoryMovements.filter((movement) => movement.movement_type === "in").length === 0 ? (
    <p className="text-sm text-slate-500">
      No receiving history yet.
    </p>
  ) : (
    <div className="grid gap-3">
      {inventoryMovements
        .filter((movement) => movement.movement_type === "in")
        .slice(0, 5)
        .map((movement) => (
          <div
            key={movement.id}
            className="border border-slate-200 rounded-xl p-3 text-sm"
          >
            <div className="flex items-center justify-between">
           <div className="font-medium">
            Quantity Received: {movement.quantity}
            </div>

            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
            Received
            </span>
            </div>
         <div className="text-slate-500">
        {movement.notes || "No notes"}
        </div>

        <div className="text-xs text-slate-400 mt-2">
        {new Date(movement.created_at).toLocaleString()}
        </div>
          </div>
        ))}
    </div>
  )}
</div>
</section>

<section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
  <h3 className="text-lg font-semibold mb-4">Purchasing Workflow</h3>

      <div className="grid gap-3">
        {[
          "Suppliers",
          "Purchase Orders",
          "Material Requests",
          "Receiving",
          "Vendor Bills",
        ].map((item) => (
          <div
            key={item}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <span className="font-medium">{item}</span>
            <span className="text-sm text-slate-500">Not connected yet</span>
          </div>
        ))}
      </div>
    </section>
  </section>
)}

{activeModule === "Finance" && canManageFinance && (
  <section className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold">Finance</h2>
      <p className="text-slate-500">
        Track purchase exposure, vendor bills, payments, revenue, and financial performance.
      </p>
      <button
  type="button"
  onClick={() =>
    exportToCsv("finance-summary.csv", [
      {
        total_customer_invoices: customerInvoices.length,
        total_customer_invoice_value: totalCustomerInvoiceValue,
        outstanding_ar: outstandingCustomerInvoiceValue,
        overdue_ar: overdueCustomerInvoiceValue,
        total_vendor_bills: activeVendorBills.length,
        total_vendor_bill_value: totalVendorBillValue,
        total_vendor_payments: totalVendorPaymentValue,
        outstanding_ap: outstandingVendorBillValue,
        overdue_ap: overdueVendorBillValue,
      },
    ])
  }
  className="mt-4 bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
>
  Export Finance CSV
</button>
    </div>
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
  <h3 className="text-lg font-semibold mb-4">
    Accounts Receivable
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  <div className="border rounded-xl p-4">
      <p className="text-sm text-slate-500">
        Total Invoices
      </p>
      <p className="text-2xl font-bold">
        {customerInvoices.length}
      </p>
    </div>

    <div className="border rounded-xl p-4">
      <p className="text-sm text-slate-500">
        Invoice Value
      </p>
      <p className="text-2xl font-bold">
        ${totalCustomerInvoiceValue.toFixed(2)}
      </p>
    </div>

    <div className="border rounded-xl p-4">
      <p className="text-sm text-slate-500">
        Outstanding AR
      </p>
      <p className="text-2xl font-bold">
        ${outstandingCustomerInvoiceValue.toFixed(2)}
      </p>
    </div>
    <div className="border rounded-xl p-4">
  <p className="text-sm text-slate-500">
    Paid Invoices
  </p>
  <p className="text-2xl font-bold">
    {paidCustomerInvoices.length}
  </p>
</div>

<div className="border rounded-xl p-4">
  <p className="text-sm text-slate-500">
    Partial Invoices
  </p>
  <p className="text-2xl font-bold">
    {partialCustomerInvoices.length}
  </p>
</div>

<div className="border rounded-xl p-4">
  <p className="text-sm text-slate-500">
    Overdue Invoices
  </p>
  <p className="text-2xl font-bold">
    {overdueCustomerInvoices.length}
  </p>
</div>

<div className="border rounded-xl p-4">
  <p className="text-sm text-slate-500">
    Overdue AR
  </p>
  <p className="text-2xl font-bold">
    ${overdueCustomerInvoiceValue.toFixed(2)}
  </p>
</div>
  </div>

  <div className="border rounded-xl p-4 mb-6 bg-slate-50">
    <h4 className="font-semibold mb-3">
      Create Customer Invoice
    </h4>

    <div className="grid gap-3 md:grid-cols-4">
      <select
        value={newCustomerInvoiceSalesOrderId}
        onChange={(e) =>
          setNewCustomerInvoiceSalesOrderId(e.target.value)
        }
        className="border px-3 py-2 rounded-lg"
      >
        <option value="">
          Select Completed Sales Order
        </option>
       {salesOrders
        .filter(
        (order) =>
         order.status === "completed" &&
        !order.is_archived
        )
        .map((order) => (
        <option key={order.id} value={order.id}>
        {order.order_number} — $
        {getSalesOrderItemTotal(order.id).toFixed(2)}
        </option>
        ))}
      </select>

      <input
        value={newCustomerInvoiceNumber}
        onChange={(e) =>
          setNewCustomerInvoiceNumber(e.target.value)
        }
        placeholder="Invoice number optional"
        className="border px-3 py-2 rounded-lg"
      />

      <input
        type="date"
        value={newCustomerInvoiceDueDate}
        onChange={(e) =>
          setNewCustomerInvoiceDueDate(e.target.value)
        }
        className="border px-3 py-2 rounded-lg"
      />

      <input
        value={newCustomerInvoiceNotes}
        onChange={(e) =>
          setNewCustomerInvoiceNotes(e.target.value)
        }
        placeholder="Notes"
        className="border px-3 py-2 rounded-lg"
      />

      <button
        type="button"
        onClick={createCustomerInvoice}
        className="bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium md:col-span-4"
      >
        Create Invoice
      </button>
    </div>
  </div>
  <div className="border rounded-xl p-4 mb-6 bg-slate-50">
    <h4 className="font-semibold mb-3">
      Record Customer Payment
    </h4>

    <div className="grid gap-3 md:grid-cols-5">
      <select
        value={newCustomerPaymentInvoiceId}
        onChange={(e) =>
          setNewCustomerPaymentInvoiceId(e.target.value)
        }
        className="border px-3 py-2 rounded-lg"
      >
        <option value="">
          Select Customer Invoice
        </option>
        {customerInvoices
          .filter(
            (invoice) =>
              getCustomerInvoiceCalculatedStatus(invoice) !== "paid"
          )
          .map((invoice) => (
            <option key={invoice.id} value={invoice.id}>
              {invoice.invoice_number} — Balance $
              {getCustomerInvoiceBalance(invoice).toFixed(2)}
            </option>
          ))}
      </select>

      <input
        type="number"
        step="0.01"
        value={newCustomerPaymentAmount}
        onChange={(e) =>
          setNewCustomerPaymentAmount(e.target.value)
        }
        placeholder="Payment amount"
        className="border px-3 py-2 rounded-lg"
      />

      <input
        type="date"
        value={newCustomerPaymentDate}
        onChange={(e) =>
          setNewCustomerPaymentDate(e.target.value)
        }
        className="border px-3 py-2 rounded-lg"
      />

      <select
        value={newCustomerPaymentMethod}
        onChange={(e) =>
          setNewCustomerPaymentMethod(e.target.value)
        }
        className="border px-3 py-2 rounded-lg"
      >
        <option value="manual">Manual</option>
        <option value="cash">Cash</option>
        <option value="check">Check</option>
        <option value="ach">ACH</option>
        <option value="card">Card</option>
        <option value="wire">Wire</option>
      </select>

      <input
        value={newCustomerPaymentNotes}
        onChange={(e) =>
          setNewCustomerPaymentNotes(e.target.value)
        }
        placeholder="Payment notes"
        className="border px-3 py-2 rounded-lg"
      />

      <button
        type="button"
        onClick={createCustomerInvoicePayment}
        className="bg-green-600 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium md:col-span-5"
      >
        Record Customer Payment
      </button>
    </div>
  </div>
  <div className="grid gap-3">
    {activeCustomerInvoices.length === 0 && (
      <div className="border border-dashed rounded-xl p-6 text-center text-slate-500">
        No customer invoices created yet.
      </div>
    )}

    {activeCustomerInvoices.map((invoice) => (
      <div
        key={invoice.id}
        className="border rounded-xl p-4 grid gap-3 md:grid-cols-6"
      >
        <div>
          <p className="text-xs text-slate-500">
            Invoice
          </p>
          <p className="font-semibold">
            {invoice.invoice_number}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Client
          </p>
          <p>
            {clients.find(
              (client) => client.id === invoice.client_id
            )?.name || "No client"}
          </p>
        </div>

        <div>
  <p className="text-xs text-slate-500">
    Status
  </p>

  <select
  disabled={getCustomerInvoiceCalculatedStatus(invoice) === "paid"}
  value={invoice.status}
  onChange={(e) =>
    updateCustomerInvoice(invoice.id, {
      status: e.target.value,
    })
  }
  className={`border px-3 py-2 rounded-lg w-full ${
    getCustomerInvoiceCalculatedStatus(invoice) === "paid"
      ? "bg-slate-100 text-slate-500 cursor-not-allowed"
      : ""
  }`}
>
    <option value="draft">Draft</option>
    <option value="sent">Sent</option>
    <option value="partial">Partial</option>
    <option value="paid">Paid</option>
    <option value="cancelled">Cancelled</option>
  </select>

  <p className="text-xs text-slate-500 mt-1">
    Calculated: {getCustomerInvoiceCalculatedStatus(invoice)}
  </p>
</div>

<div>
  <p className="text-xs text-slate-500">
    Due Date
  </p>

  <input
    type="date"
    value={invoice.due_date ? invoice.due_date.slice(0, 10) : ""}
    onChange={(e) =>
      updateCustomerInvoice(invoice.id, {
        due_date: e.target.value === "" ? null : e.target.value,
      })
    }
    disabled={getCustomerInvoiceCalculatedStatus(invoice) === "paid"}
    className={`border px-3 py-2 rounded-lg w-full ${
      getCustomerInvoiceCalculatedStatus(invoice) === "paid"
        ? "bg-slate-100 text-slate-500 cursor-not-allowed"
        : ""
    }`}
  />
</div>
        <div>
          <p className="text-xs text-slate-500">
            Amount
          </p>
          <p>
            ${Number(invoice.amount || 0).toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Balance
          </p>
          <p>
            ${getCustomerInvoiceBalance(invoice).toFixed(2)}
          </p>
        </div>
        {isAdmin && (
  <div>
    <button
      type="button"
      onClick={() => archiveCustomerInvoice(invoice.id)}
      className="bg-slate-600 text-white px-3 py-2 rounded-lg w-full hover:bg-slate-700 transition"
    >
      Archive Invoice
    </button>
  </div>
)}
      </div>
     ))}
    </div>
    {archivedCustomerInvoices.length > 0 && (
  <div className="mt-6 border-t pt-6">
    <h4 className="text-lg font-semibold mb-4">
      Archived Customer Invoices
    </h4>

    <p className="text-sm text-slate-500">
      Archived invoices are hidden from active finance totals but retained for audit history.
    </p>
    <div className="grid gap-3 mt-4">
  {archivedCustomerInvoices.map((invoice) => (
    <div
      key={invoice.id}
      className="border rounded-xl p-4 grid gap-3 md:grid-cols-5 bg-slate-50"
    >
      <div>
        <p className="text-xs text-slate-500">
          Invoice
        </p>
        <p className="font-semibold">
          {invoice.invoice_number}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-500">
          Client
        </p>
        <p>
          {clients.find(
            (client) => client.id === invoice.client_id
          )?.name || "No client"}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-500">
          Status
        </p>
        <p>{invoice.status}</p>
      </div>

      <div>
        <p className="text-xs text-slate-500">
          Amount
        </p>
        <p>
          ${Number(invoice.amount || 0).toFixed(2)}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-500">
          Balance
        </p>
        <p>
          ${getCustomerInvoiceBalance(invoice).toFixed(2)}
        </p>
      </div>
      {isAdmin && (
  <div>
    <button
      type="button"
      onClick={() => restoreCustomerInvoice(invoice.id)}
      className="bg-green-600 text-white px-3 py-2 rounded-lg w-full hover:bg-green-700 transition"
    >
      Restore Invoice
    </button>
  </div>
)}
    </div>
  ))}
</div>
  </div>
)}
    <div className="mt-6">
  <h4 className="text-lg font-semibold mb-4">
    Customer Payment History
  </h4>

  {customerInvoicePayments.length === 0 ? (
    <div className="border border-dashed rounded-xl p-6 text-center text-slate-500">
      No customer payments recorded yet.
    </div>
  ) : (
    <div className="grid gap-3">
      {customerInvoicePayments.map((payment) => {
        const invoice = customerInvoices.find(
          (invoice) =>
            invoice.id === payment.customer_invoice_id
        )

        return (
          <div
            key={payment.id}
            className="border rounded-xl p-4 grid gap-3 md:grid-cols-5"
          >
            <div>
              <p className="text-xs text-slate-500">
                Invoice
              </p>

              <p className="font-semibold">
                {invoice?.invoice_number || "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Amount
              </p>

              <p>
                ${Number(payment.amount || 0).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Method
              </p>

              <p>
                {payment.payment_method || "Manual"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Date
              </p>

              <p>
                {payment.payment_date
                  ? new Date(
                      payment.payment_date
                    ).toLocaleDateString()
                  : "No date"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Notes
              </p>

              <p>
                {payment.notes || "No notes"}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )}
</div>
    </section>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Active PO Value</p>
        <p className="text-2xl font-bold">
          ${activePurchaseOrderValue.toFixed(2)}
        </p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Inventory Value</p>
        <p className="text-2xl font-bold">
          $
          {inventoryItems
            .reduce(
              (sum, item) =>
                sum +
                Number(item.quantity_on_hand || 0) *
                  Number(item.unit_cost || 0),
              0
            )
            .toFixed(2)}
        </p>
      </div>

      <div className="bg-white border rounded-xl p-4">
  <p className="text-sm text-gray-500">Total Vendor Bills</p>
  <p className="text-2xl font-bold">{activeVendorBills.length}</p>
</div>
      <div className="bg-white border rounded-xl p-4">
  <p className="text-sm text-gray-500">Paid Bills</p>
  <p className="text-2xl font-bold">{paidVendorBills.length}</p>
</div>
<div className="bg-white border rounded-xl p-4">
  <p className="text-sm text-gray-500">Partial Bills</p>
  <p className="text-2xl font-bold">{partialVendorBills.length}</p>
</div>
<div className="bg-white border rounded-xl p-4">
  <p className="text-sm text-gray-500">Total Bill Value</p>
  <p className="text-2xl font-bold">
    ${totalVendorBillValue.toFixed(2)}
  </p>
</div>
<div className="bg-white border rounded-xl p-4">
  <p className="text-sm text-gray-500">Total Payments</p>
  <p className="text-2xl font-bold">
    ${totalVendorPaymentValue.toFixed(2)}
  </p>
</div>

<div className="bg-white border rounded-xl p-4">
  <p className="text-sm text-gray-500">Outstanding AP</p>
  <p className="text-2xl font-bold">
    ${outstandingVendorBillValue.toFixed(2)}
  </p>
</div>
<div className="bg-white border rounded-xl p-4">
  <p className="text-sm text-gray-500">Overdue Bills</p>
  <p className="text-2xl font-bold text-red-700">
    {overdueVendorBills.length}
  </p>
</div>

<div className="bg-white border rounded-xl p-4">
  <p className="text-sm text-gray-500">Due Soon</p>
  <p className="text-2xl font-bold text-yellow-700">
    {dueSoonVendorBills.length}
  </p>
</div>

<div className="bg-white border rounded-xl p-4">
  <p className="text-sm text-gray-500">Overdue Amount</p>
  <p className="text-2xl font-bold text-red-700">
    ${overdueVendorBillValue.toFixed(2)}
  </p>
</div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Unpaid Bill Value</p>
        <p className="text-2xl font-bold">
        ${unpaidVendorBillValue.toFixed(2)}
        </p>
      </div>
    </div>

<section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
  <h3 className="text-lg font-semibold mb-4"> Vendor Bills</h3>

  <div className="grid gap-4 md:grid-cols-3 mb-6">
    <select
      value={newVendorBillSupplierId}
      onChange={(e) =>
        setNewVendorBillSupplierId(e.target.value)
      }
      className="border px-3 py-2 rounded-lg"
    >
      <option value="">Select Supplier</option>

        {activeSuppliers.map((supplier) => (
        <option key={supplier.id} value={supplier.id}>
        {supplier.supplier_name}
        </option>
       ))}
     </select>

    <select
      value={newVendorBillPurchaseOrderId}
      onChange={(e) =>
        setNewVendorBillPurchaseOrderId(e.target.value)
      }
      className="border px-3 py-2 rounded-lg"
    >
      <option value="">Select Purchase Order</option>

      {activePurchaseOrders.map((po) => (
        <option key={po.id} value={po.id}>
          {po.po_number}
        </option>
      ))}
    </select>

    <input
      type="number"
      step="0.01"
      placeholder="Bill Amount"
      value={newVendorBillAmount}
      onChange={(e) =>
        setNewVendorBillAmount(e.target.value)
      }
      className="border px-3 py-2 rounded-lg"
    />

    <select
      value={newVendorBillStatus}
      onChange={(e) =>
        setNewVendorBillStatus(e.target.value)
      }
      className="border px-3 py-2 rounded-lg"
    >
      <option value="unpaid">Unpaid</option>
      <option value="paid">Paid</option>
      <option value="partial">Partial</option>
    </select>

    <input
      type="date"
      value={newVendorBillDueDate}
      onChange={(e) =>
        setNewVendorBillDueDate(e.target.value)
      }
      className="border px-3 py-2 rounded-lg"
    />

    <input
      placeholder="Bill Notes"
      value={newVendorBillNotes}
      onChange={(e) =>
        setNewVendorBillNotes(e.target.value)
      }
      className="border px-3 py-2 rounded-lg"
    />
  </div>

  <button
  type="button"
  onClick={handleCreateVendorBill}
  className="bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
>
  Create Vendor Bill
</button>

{successMessage && (
  <div className="text-green-600 font-medium">
    {successMessage}
  </div>
)}
<div className="mt-6 border-t pt-6 space-y-4">
  <h4 className="font-semibold text-slate-800">
    Record Vendor Payment
  </h4>

  <select
    value={newVendorPaymentBillId}
    onChange={(e) => setNewVendorPaymentBillId(e.target.value)}
    className="border px-3 py-2 rounded-lg w-full"
  >
    <option value="">Select Vendor Bill</option>

    {vendorBills
  .filter((bill) => getVendorBillBalance(bill) > 0)
  .map((bill) => {
  const supplier = suppliers.find(
    (supplier) => supplier.id === bill.supplier_id
  )

  const balanceAmount = getVendorBillBalance(bill)

  return (
    <option key={bill.id} value={bill.id}>
      {supplier?.supplier_name || "No supplier"} - $
      {Number(bill.amount || 0).toFixed(2)} bill - $
      {balanceAmount.toFixed(2)} balance - {getVendorBillCalculatedStatus(bill)}
    </option>
  )
})}
  </select>

  <input
    type="number"
    step="0.01"
    value={newVendorPaymentAmount}
    onChange={(e) => setNewVendorPaymentAmount(e.target.value)}
    placeholder="Payment Amount"
    className="border px-3 py-2 rounded-lg w-full"
  />

  <input
    type="date"
    value={newVendorPaymentDate}
    onChange={(e) => setNewVendorPaymentDate(e.target.value)}
    className="border px-3 py-2 rounded-lg w-full"
  />

  <select
    value={newVendorPaymentMethod}
    onChange={(e) => setNewVendorPaymentMethod(e.target.value)}
    className="border px-3 py-2 rounded-lg w-full"
  >
    <option value="manual">Manual</option>
    <option value="check">Check</option>
    <option value="ach">ACH</option>
    <option value="wire">Wire</option>
    <option value="credit_card">Credit Card</option>
  </select>

  <input
    type="text"
    value={newVendorPaymentNotes}
    onChange={(e) => setNewVendorPaymentNotes(e.target.value)}
    placeholder="Payment Notes"
    className="border px-3 py-2 rounded-lg w-full"
  />

  <button
    type="button"
    onClick={handleCreateVendorPayment}
    className="bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
  >
    Record Vendor Payment
  </button>
</div>
<div className="mt-6 border-t pt-6">
  <h4 className="font-semibold text-slate-800 mb-3">
    Vendor Payment History
  </h4>

  <div className="grid gap-3">
    {vendorPayments.length === 0 ? (
      <div className="border border-dashed rounded-xl p-4 text-center text-slate-500">
        No vendor payments recorded yet.
      </div>
    ) : (
      vendorPayments.map((payment) => {
        const bill = vendorBills.find(
          (vendorBill) => vendorBill.id === payment.vendor_bill_id
        )

        return (
          <div
            key={payment.id}
            className="border border-slate-200 rounded-xl p-4 bg-white"
          >
            <div className="font-semibold text-slate-900">
              ${Number(payment.amount || 0).toFixed(2)}
            </div>

            <div className="text-sm text-slate-600">
              Bill:{" "}
              {bill
                ? `$${Number(bill.amount || 0).toFixed(2)} - ${getVendorBillCalculatedStatus(bill)}`
                : "Unknown bill"}
            </div>

            <div className="text-sm text-slate-600">
              Method: {payment.payment_method || "manual"}
            </div>

            <div className="text-sm text-slate-600">
              Date:{" "}
              {payment.payment_date
                ? new Date(payment.payment_date).toLocaleDateString()
                : "No payment date"}
            </div>

            {payment.notes && (
              <div className="text-sm text-slate-500 mt-1">
                Notes: {payment.notes}
              </div>
            )}
          </div>
        )
      })
    )}
  </div>
</div>
<div className="mt-6 grid gap-3">
  {activeVendorBills.length === 0 ? (
    <div className="border border-dashed rounded-xl p-6 text-center text-slate-500">
      No vendor bills created yet.
    </div>
  ) : (
    activeVendorBills.map((bill) => {
      const supplier = suppliers.find(
        (supplier) => supplier.id === bill.supplier_id
      )

      const purchaseOrder = purchaseOrders.find(
      (po) => po.id === bill.purchase_order_id
      )

      const paidAmount = getVendorBillPaidAmount(bill.id)
      const balanceAmount = getVendorBillBalance(bill)
      const calculatedStatus = getVendorBillCalculatedStatus(bill)

      return (

        <div
          key={bill.id}
          className="border rounded-xl p-4 hover:bg-slate-50 transition-colors duration-200"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-slate-900">
                ${Number(bill.amount || 0).toFixed(2)}
              </div>
              <div className="text-sm text-slate-600 mt-1">
              Paid: ${paidAmount.toFixed(2)} · Balance: ${balanceAmount.toFixed(2)}
              </div>

              <div className="text-sm text-slate-500 mt-1">
                {supplier?.supplier_name || "No supplier"} ·{" "}
                {purchaseOrder?.po_number || "No PO linked"}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
  <span
   className={`text-xs px-2 py-1 rounded-full font-medium ${
  calculatedStatus === "paid"
    ? "bg-green-100 text-green-700"
    : calculatedStatus === "partial"
    ? "bg-yellow-100 text-yellow-700"
    : "bg-red-100 text-red-700"
}`}
  >
    {calculatedStatus}
  </span>
</div>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-2 text-sm text-slate-600">
            <div>
              <span className="font-medium text-slate-700">Due Date:</span>{" "}
              {bill.due_date
                ? new Date(bill.due_date).toLocaleDateString()
                : "No due date"}
            </div>
            {isAdmin && (
            <button
            type="button"
            onClick={() => archiveVendorBill(bill.id)}
            className="bg-slate-600 text-white px-3 py-2 rounded-lg"
            >
            Archive Vendor Bill
            </button>
            )}
            <div>
              <span className="font-medium text-slate-700">Notes:</span>{" "}
              {bill.notes || "No notes"}
            </div>
            </div>
            </div>
             )
              })
              )}
            </div>
            {archivedVendorBills.length > 0 && (
  <div className="mt-6 border-t pt-6">
    <h4 className="text-lg font-semibold mb-4">
      Archived Vendor Bills
    </h4>

    <p className="text-sm text-slate-500">
      Archived vendor bills are hidden from active finance totals but retained for audit history.
    </p>
    <div className="grid gap-3 mt-4">
  {archivedVendorBills.map((bill) => {
    const supplier = suppliers.find(
      (supplier) => supplier.id === bill.supplier_id
    )

    const purchaseOrder = purchaseOrders.find(
      (po) => po.id === bill.purchase_order_id
    )

    return (
      <div
        key={bill.id}
        className="border rounded-xl p-4 bg-slate-50"
      >
        <div className="font-semibold text-slate-900">
          ${Number(bill.amount || 0).toFixed(2)}
        </div>

        <div className="text-sm text-slate-500 mt-1">
          {supplier?.supplier_name || "No supplier"} ·{" "}
          {purchaseOrder?.po_number || "No PO linked"}
        </div>

        <div className="text-sm text-slate-500 mt-1">
          Status: {getVendorBillCalculatedStatus(bill)}
        </div>

        <div className="text-sm text-slate-500 mt-1">
          Due:{" "}
          {bill.due_date
            ? new Date(bill.due_date).toLocaleDateString()
            : "No due date"}
        </div>

        <div className="text-sm text-slate-500 mt-1">
          Notes: {bill.notes || "No notes"}
        </div>
        {isAdmin && (
  <button
    type="button"
    onClick={() => restoreVendorBill(bill.id)}
    className="mt-3 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition"
  >
    Restore Vendor Bill
  </button>
)}
        </div>
        )
        })}
        </div>
        </div>
        )}
            </section>

    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold mb-4">Finance Workflow</h3>

      <div className="grid gap-3">
        {[
          "Vendor Bills",
          "Payment Tracking",
          "Revenue Tracking",
          "Expense Management",
          "Margin Reporting",
        ].map((item) => (
          <div
            key={item}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <span className="font-medium">{item}</span>
            <span className="text-sm text-slate-500">Not connected yet</span>
          </div>
        ))}
      </div>
    </section>
  </section>
)}

{activeModule === "Reports" && canViewReports && (
  <section className="space-y-6">
    <div>
  <h2 className="text-2xl font-bold">Reports</h2>
  <p className="text-slate-500">
    View operational, production, inventory, sales, and finance summaries.
  </p>

  <div className="mt-3 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
    Live ERP data
  </div>
</div>
<section className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div>
      <h3 className="text-lg font-semibold">
        Exports & Reports Center
      </h3>
    </div>

    {!advancedReportsEnabled && (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
        Upgrade Required
      </span>
    )}
  </div>

  <p className="text-sm text-slate-500 mt-1">
  Download live operational and financial reports whenever needed.
</p>

<div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
  <button
  type="button"
  disabled={!advancedReportsEnabled}
  onClick={() =>
      exportAdvancedReportToCsv(
        "inventory-items.csv",
        filteredInventoryItems.map((item: any) => ({
          sku: item.sku,
          item_name: item.item_name,
          category: item.category,
          quantity_on_hand: item.quantity_on_hand,
          reorder_level: item.reorder_level,
          unit_cost: item.unit_cost,
          status: item.status,
        }))
      )
    }
    className={`px-4 py-2 rounded-xl shadow-md transition-all duration-200 font-medium ${
  advancedReportsEnabled
    ? "bg-slate-950 text-white hover:shadow-lg hover:-translate-y-0.5"
    : "bg-slate-300 text-slate-500 cursor-not-allowed"
}`}
  >
    Inventory CSV
  </button>
<button
  type="button"
  onClick={() =>
    exportAdvancedReportToCsv(
  "purchase-orders.csv",
      filteredPurchaseOrders.map((po: any) => ({
        po_number: po.po_number,
        supplier:
          suppliers.find(
            (supplier) => supplier.id === po.supplier_id
          )?.supplier_name || "",
        company:
          companies.find(
            (company) => company.id === po.company_id
          )?.name || "",
        status: po.status,
        order_date: po.order_date,
        expected_date: po.expected_date,
        total_amount: po.total_amount,
        notes: po.notes,
      }))
    )
  }
  className="bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
>
  Purchase Orders CSV
</button>
<button
  type="button"
  onClick={() =>
    exportAdvancedReportToCsv(
  "sales-orders.csv",
      activeSalesOrders.map((order: any) => ({
          order_number: order.order_number,
          client:
            clients.find(
              (client) => client.id === order.client_id
            )?.name || "",
          status: order.status,
          expected_ship_date: order.expected_ship_date,
          total_amount: getSalesOrderItemTotal(order.id),
          notes: order.notes,
        }))
    )
  }
  className="bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
>
  Sales Orders CSV
</button>
  <button
    type="button"
    onClick={() =>
      exportAdvancedReportToCsv("finance-summary.csv", [
        {
          total_customer_invoices: customerInvoices.length,
          total_customer_invoice_value: totalCustomerInvoiceValue,
          outstanding_ar: outstandingCustomerInvoiceValue,
          overdue_ar: overdueCustomerInvoiceValue,
          total_vendor_bills: activeVendorBills.length,
          total_vendor_bill_value: totalVendorBillValue,
          total_vendor_payments: totalVendorPaymentValue,
          outstanding_ap: outstandingVendorBillValue,
          overdue_ap: overdueVendorBillValue,
        },
      ])
    }
    className="bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
  >
    Finance CSV
  </button>
</div>
</section>
<section className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div>
      <h3 className="text-lg font-semibold">
        Audit Log
      </h3>
      <p className="text-sm text-slate-500 mt-1">
        Review recent user actions, system changes, and compliance activity.
      </p>
    </div>

    <div className="flex flex-col gap-2 md:flex-row">
      <select
        value={auditModuleFilter}
        onChange={(e) => setAuditModuleFilter(e.target.value)}
        className="border px-3 py-2 rounded-lg text-sm"
      >
        <option value="all">All Modules</option>
        <option value="Clients">Clients</option>
        <option value="Companies">Companies</option>
        <option value="Tasks">Tasks</option>
        <option value="Purchasing">Purchasing</option>
        <option value="Sales">Sales</option>
        <option value="Inventory">Inventory</option>
        <option value="Finance">Finance</option>
      </select>

      <select
        value={auditActionFilter}
        onChange={(e) => setAuditActionFilter(e.target.value)}
        className="border px-3 py-2 rounded-lg text-sm"
      >
        <option value="all">All Actions</option>
        <option value="created">Created</option>
        <option value="updated">Updated</option>
        <option value="archived">Archived</option>
        <option value="restored">Restored</option>
      </select>
    </div>
  </div>

  <div className="mt-4 overflow-x-auto">
    {filteredAuditLogs.length === 0 ? (
      <p className="text-sm text-slate-500">
        No audit activity found for the selected filters.
      </p>
    ) : (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2 pr-3">Date</th>
            <th className="py-2 pr-3">User</th>
            <th className="py-2 pr-3">Role</th>
            <th className="py-2 pr-3">Module</th>
            <th className="py-2 pr-3">Action</th>
            <th className="py-2 pr-3">Record</th>
          </tr>
        </thead>

        <tbody>
          {filteredAuditLogs.slice(0, 25).map((log) => (
            <tr key={log.id} className="border-b last:border-0">
              <td className="py-2 pr-3 text-slate-600">
                {log.created_at
                  ? new Date(log.created_at).toLocaleString()
                  : "—"}
              </td>
              <td className="py-2 pr-3">
                {log.user_email || "System"}
              </td>
              <td className="py-2 pr-3 capitalize">
                {log.user_role || "—"}
              </td>
              <td className="py-2 pr-3">
                {log.module}
              </td>
              <td className="py-2 pr-3 capitalize">
                {log.action}
              </td>
              <td className="py-2 pr-3">
                {log.record_type || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>

  <p className="mt-3 text-xs text-slate-500">
    Showing latest {Math.min(filteredAuditLogs.length, 25)} of {filteredAuditLogs.length} matching audit records.
  </p>
</section>
<div>
  <h3 className="text-lg font-semibold">Operational Reports</h3>
  <p className="text-sm text-slate-500">
    Detailed analytics for inventory, purchasing, finance, task execution, sales, fulfillment, and receiving activity.
  </p>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
  <p className="font-semibold">Purchasing Report</p>

  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
    <div>
      <p className="text-slate-500">Total POs</p>
      <p className="font-semibold text-slate-900">{purchaseOrders.length}</p>
    </div>

    <div>
      <p className="text-slate-500">Open POs</p>
      <p className="font-semibold text-slate-900">{openPurchaseOrders}</p>
    </div>

    <div>
      <p className="text-slate-500">Draft</p>
      <p className="font-semibold text-yellow-700">{draftPurchaseOrderList.length}</p>
    </div>

    <div>
      <p className="text-slate-500">Ordered</p>
      <p className="font-semibold text-blue-700">{orderedPurchaseOrderList.length}</p>
    </div>

    <div>
      <p className="text-slate-500">Received</p>
      <p className="font-semibold text-green-700">{receivedPurchaseOrderList.length}</p>
    </div>

    <div>
      <p className="text-slate-500">Cancelled</p>
      <p className="font-semibold text-slate-700">{cancelledPurchaseOrderList.length}</p>
    </div>
  </div>

  <div className="mt-4 border-t pt-4 space-y-2 text-sm">
    <p className="text-slate-700 font-medium">
      Active PO Value: ${activePurchaseOrderValue.toFixed(2)}
    </p>

    <p className="text-slate-700 font-medium">
      Received PO Value: ${receivedPurchaseOrderValue.toFixed(2)}
    </p>

    <p className="text-slate-700 font-medium">
      Units Received: {totalUnitsReceived}
    </p>
  </div>
</div>

      <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
  <p className="font-semibold">Finance Report</p>

  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
    <div>
      <p className="text-slate-500">Total Bills</p>
      <p className="font-semibold text-slate-900">{vendorBills.length}</p>
    </div>

    <div>
      <p className="text-slate-500">Unpaid</p>
      <p className="font-semibold text-red-700">
        {unpaidVendorBills.length}
      </p>
    </div>

    <div>
      <p className="text-slate-500">Partial</p>
      <p className="font-semibold text-yellow-700">
        {partialVendorBills.length}
      </p>
    </div>

    <div>
      <p className="text-slate-500">Paid</p>
      <p className="font-semibold text-green-700">
        {paidVendorBills.length}
      </p>
    </div>

    <div>
      <p className="text-slate-500">Overdue</p>
      <p className="font-semibold text-red-700">
        {overdueVendorBills.length}
      </p>
    </div>

    <div>
      <p className="text-slate-500">Due Soon</p>
      <p className="font-semibold text-orange-700">
        {dueSoonVendorBills.length}
      </p>
    </div>
  </div>

  <div className="mt-4 border-t pt-4 space-y-2 text-sm">
    <p className="text-slate-700 font-medium">
      Total Bill Value: ${totalVendorBillValue.toFixed(2)}
    </p>

    <p className="text-red-700 font-medium">
    Outstanding: ${outstandingVendorBillValue.toFixed(2)}
    </p>
    <p className="text-green-700 font-medium">
    Payments Recorded: ${totalVendorPaymentValue.toFixed(2)}
    </p>

    <p className="text-red-700 font-medium">
      Overdue Amount: ${overdueVendorBillValue.toFixed(2)}
    </p>
  </div>
</div>

      <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
  <p className="font-semibold">Task Performance</p>

  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
    <div>
      <p className="text-slate-500">Total Tasks</p>
      <p className="font-semibold text-slate-900">{totalTasks}</p>
    </div>

    <div>
      <p className="text-slate-500">Pending</p>
      <p className="font-semibold text-yellow-700">{pendingTasks}</p>
    </div>

    <div>
      <p className="text-slate-500">In Progress</p>
      <p className="font-semibold text-blue-700">{inProgressTasks}</p>
    </div>

    <div>
      <p className="text-slate-500">Completed</p>
      <p className="font-semibold text-green-700">{completedTasks}</p>
    </div>
  </div>

  <div className="mt-4 border-t pt-4 space-y-2 text-sm">
    <p className="text-slate-700 font-medium">
      Open Work Orders: {openWorkOrders}
    </p>

    <p className="text-slate-700 font-medium">
      Completion Rate: {taskCompletionRate}%
    </p>
  </div>
</div>

      <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
  <p className="font-semibold">Receiving Report</p>

  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
    <div>
      <p className="text-slate-500">Receiving Movements</p>
      <p className="font-semibold text-slate-900">
        {inventoryMovements.filter(
          (movement) => movement.movement_type === "in"
        ).length}
      </p>
    </div>

    <div>
      <p className="text-slate-500">PO Line Items</p>
      <p className="font-semibold text-slate-900">
        {purchaseOrderItems.length}
      </p>
    </div>

    <div>
      <p className="text-slate-500">Units Received</p>
      <p className="font-semibold text-green-700">
        {totalUnitsReceived}
      </p>
    </div>

    <div>
      <p className="text-slate-500">Open Line Items</p>
      <p className="font-semibold text-yellow-700">
        {purchaseOrderItems.filter(
          (item) =>
            Number(item.received_quantity || 0) <
            Number(item.quantity || 0)
        ).length}
      </p>
    </div>
</div>

<div className="mt-4 border-t pt-4 space-y-2 text-sm">
  <p className="text-slate-700 font-medium">
    Total Receiving Movements: {
      inventoryMovements.filter(
        (movement) => movement.movement_type === "in"
      ).length
    }
  </p>

  <p className="text-slate-700 font-medium">
    Receiving Completion Rate: {
      purchaseOrderItems.length === 0
        ? 0
        : Math.round(
            (
              purchaseOrderItems.filter(
                (item) =>
                  Number(item.received_quantity || 0) >=
                  Number(item.quantity || 0)
              ).length /
              purchaseOrderItems.length
            ) * 100
          )
    }%
  </p>
</div>

</div>

<div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
  <p className="font-semibold">Sales Performance</p>

  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
    <div>
      <p className="text-slate-500">Completed Orders</p>
      <p className="font-semibold text-green-700">
        {completedSalesOrders.length}
      </p>
    </div>

    <div>
      <p className="text-slate-500">Revenue</p>
      <p className="font-semibold text-slate-900">
        ${completedSalesValue.toFixed(2)}
      </p>
    </div>

    <div>
      <p className="text-slate-500">Units Sold</p>
      <p className="font-semibold text-slate-900">
        {totalUnitsSold}
      </p>
    </div>

    <div>
      <p className="text-slate-500">Average Order Value</p>
      <p className="font-semibold text-slate-900">
        ${averageSalesOrderValue.toFixed(2)}
      </p>
    </div>
  </div>

  <div className="mt-4 border-t pt-4 space-y-2 text-sm">
    <p className="text-slate-700 font-medium">
      Revenue Delivered: ${completedSalesValue.toFixed(2)}
    </p>
  </div>
</div>
    </div>

    <div className="bg-white border rounded-xl p-5 shadow-sm">
  <p className="font-semibold">Report Readiness</p>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">
    <div className="rounded-lg bg-green-50 border border-green-100 p-3">
      <p className="font-medium text-green-700">Live</p>
      <p className="text-slate-600 mt-1">
        Inventory, purchasing, finance, tasks, and receiving reports are connected to current ERP data.
      </p>
    </div>

    <div className="rounded-lg bg-yellow-50 border border-yellow-100 p-3">
      <p className="font-medium text-yellow-700">Planned</p>
      <p className="text-slate-600 mt-1">
        Sales reporting will connect after the Sales module is built.
      </p>
    </div>

    <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
      <p className="font-medium text-slate-700">Next</p>
      <p className="text-slate-600 mt-1">
        Export tools, date filters, and advanced analytics can be added after MVP workflows are complete.
      </p>
    </div>
  </div>
</div>
  </section>
)}

{activeModule === "Executive Intelligence" &&
  canUseExecutiveIntelligence && (

<ExecutiveIntelligencePanel
  riskCount={riskCount}
  growthOpportunityCount={growthOpportunityCount}
  lowStockCount={lowStockCount}
  overdueCustomerInvoiceCount={overdueCustomerInvoiceCount}
  lateTaskCount={lateTaskCount}
  unfulfilledSalesOrderCount={unfulfilledSalesOrderCount}
  actionableRecommendationCount={actionableRecommendationCount}
  executiveRecommendations={executiveRecommendations}
/>

)}

{activeModule === "Smart AI Assist" && canUseSmartAi && aiAssistEnabled && (
  <section className="space-y-6">
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-xl">
      <div className="border-b border-slate-800 px-6 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Smart AI Operations
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Recovery Command Center
            </h2>

            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Detect workflow risks, preserve business continuity,
              and guide approved recovery actions.
            </p>
          </div>
         
          <div className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              System Status
            </p>

            <p className="mt-1 text-xl font-bold capitalize">
              {smartAiSystemStatus}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Recovery Mode
          </p>

          <p className="mt-2 text-2xl font-bold">
            {recoveryModeIsArmed ? "Armed" : "Inactive"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Active Incidents
          </p>

          <p className="mt-2 text-2xl font-bold">
            {activeAiIncidents.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Critical Incidents
          </p>

          <p className="mt-2 text-2xl font-bold">
            {criticalAiIncidents.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Safe Auto Retry
          </p>

          <p className="mt-2 text-2xl font-bold">
            {recoveryAutoRetryIsAvailable
              ? "Available"
              : "Unavailable"}
          </p>
        </div>
      </div>
            <div className="border-t border-slate-800 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Incident Monitor
            </p>

            <h3 className="mt-1 text-xl font-semibold">
              Active Workflow Risks
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
  <button
    type="button"
    onClick={runSmartAiRiskScan}
    disabled={aiIncidentLoading}
    className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {aiIncidentLoading
      ? "Scanning..."
      : "Run Risk Scan"}
  </button>

  <button
    type="button"
    onClick={loadAiIncidents}
    disabled={aiIncidentLoading}
    className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {aiIncidentLoading
      ? "Refreshing..."
      : "Refresh Incidents"}
  </button>
</div>
        </div>

        {aiIncidentMessage && (
          <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            {aiIncidentMessage}
          </div>
        )}

        {aiIncidentLoading ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-300">
            Loading Smart AI incidents...
          </div>
        ) : activeAiIncidents.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-6">
            <p className="text-sm font-semibold text-emerald-200">
              No active incidents detected
            </p>

            <p className="mt-2 text-sm text-slate-300">
              Recovery Mode is ready to monitor supported workflows.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {activeAiIncidents.map((incident) => (
              <div
                key={incident.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                        {incident.module}
                      </span>

                      <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                        {incident.severity}
                      </span>

                      <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                        {incident.status}
                      </span>
                    </div>

                    <h4 className="mt-3 text-lg font-semibold">
                      {incident.title}
                    </h4>

                    {incident.user_message && (
                      <p className="mt-2 text-sm text-slate-300">
                        {incident.user_message}
                      </p>
                    )}
                  </div>

                  <div className="text-sm text-slate-400">
                    Seen {incident.occurrence_count} time
                    {incident.occurrence_count === 1 ? "" : "s"}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 md:mt-0 md:justify-end">
  <button
    type="button"
    onClick={() =>
      updateAiIncidentStatus(
        incident.id,
        "investigating"
      )
    }
    className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-400/20"
  >
    Investigate
  </button>

  <button
    type="button"
    onClick={() =>
      updateAiIncidentStatus(
        incident.id,
        "resolved"
      )
    }
    className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/20"
  >
    Resolve
  </button>

  <button
    type="button"
    onClick={() =>
      updateAiIncidentStatus(
        incident.id,
        "ignored"
      )
    }
    className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
  >
    Ignore
  </button>
</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
            <div className="border-t border-slate-800 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
              AI Recommendations
            </p>

            <h3 className="mt-1 text-xl font-semibold">
              Suggested Recovery Actions
            </h3>

            <p className="mt-2 text-sm text-slate-300">
              Review AI-generated guidance before approving any corrective action.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAiRecommendations}
            disabled={aiRecommendationLoading}
            className="rounded-xl border border-violet-400/40 bg-violet-400/10 px-4 py-2 text-sm font-semibold text-violet-200 hover:bg-violet-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {aiRecommendationLoading
              ? "Refreshing..."
              : "Refresh Recommendations"}
          </button>
        </div>

        {aiRecommendationMessage && (
          <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            {aiRecommendationMessage}
          </div>
        )}

        {aiRecommendationLoading ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-300">
            Loading Smart AI recommendations...
          </div>
        ) : aiRecommendations.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm font-semibold text-slate-200">
              No recommendations available
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Recommendations will appear when Smart AI analyzes supported incidents.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {aiRecommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-violet-200">
                        {recommendation.recommendation_type}
                      </span>

                      <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                        Risk: {recommendation.risk_level}
                      </span>

                      <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                        {recommendation.status}
                      </span>
                    </div>

                    <h4 className="mt-3 text-lg font-semibold">
                      {recommendation.summary}
                    </h4>

                    {recommendation.rationale && (
                      <p className="mt-2 text-sm text-slate-300">
                        {recommendation.rationale}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
    {recommendation.requires_approval
      ? "Admin approval required"
      : "No approval required"}
  </div>

  {recommendation.status === "pending" && (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() =>
          updateAiRecommendationStatus(
            recommendation.id,
            "approved"
          )
        }
        className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/20"
      >
        Approve
      </button>

      <button
        type="button"
        onClick={() =>
          updateAiRecommendationStatus(
            recommendation.id,
            "rejected"
          )
        }
        className="rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-400/20"
      >
        Reject
      </button>
    </div>
  )}

  {recommendation.status === "approved" && (
  <div className="flex flex-col items-start gap-2 md:items-end">
    <p className="text-xs font-medium text-emerald-300">
      Approved — ready for safe recovery
    </p>

    {recommendation.risk_level === "low" &&
      recommendation.proposed_action?.action_type ===
        "refresh_erp_data" && (
        <button
          type="button"
          onClick={() =>
            applySafeAiRecommendation(recommendation)
          }
          className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/20"
        >
          Apply Recovery
        </button>
      )}
  </div>
)}

  {recommendation.status === "rejected" && (
    <p className="text-xs font-medium text-rose-300">
      Rejected
    </p>
  )}
</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
            <div className="border-t border-slate-800 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
              Recovery Audit
            </p>

            <h3 className="mt-1 text-xl font-semibold">
              Action History
            </h3>

            <p className="mt-2 text-sm text-slate-300">
              Every approved recovery action and result is preserved for review.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAiActionLogs}
            disabled={aiActionLogLoading}
            className="rounded-xl border border-sky-400/40 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {aiActionLogLoading
              ? "Refreshing..."
              : "Refresh Audit History"}
          </button>
        </div>

        {aiActionLogMessage && (
          <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            {aiActionLogMessage}
          </div>
        )}

        {aiActionLogLoading ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-300">
            Loading Recovery Mode audit history...
          </div>
        ) : aiActionLogs.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm font-semibold text-slate-200">
              No recovery actions recorded
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Approved fixes and their outcomes will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {aiActionLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-sky-200">
                        {log.action_type}
                      </span>

                      <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                        {log.result}
                      </span>
                    </div>

                    {log.error_message && (
                      <p className="mt-3 text-sm text-rose-300">
                        {log.error_message}
                      </p>
                    )}
                  </div>

                  <div className="text-sm text-slate-400">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </section>
  )}
{activeModule === "Smart AI Assist" && !aiAssistEnabled && (
  <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <h2 className="text-2xl font-bold">
      Smart AI Assist
    </h2>

    <p className="mt-2 text-slate-500">
      Smart AI Assist is available on higher-tier plans.
    </p>

    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      Upgrade your plan to unlock AI diagnostics, recovery recommendations, and adaptive workflow assistance.
    </div>
  </section>
)}

{activeModule === "My Profile" && (
  <section className="space-y-6">
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold mb-4">
        My Profile
      </h3>

      <form
  onSubmit={updateMyProfile}
  className="grid gap-4 md:grid-cols-3"
>
  <input
    value={profileName}
    onChange={(e) => setProfileName(e.target.value)}
    placeholder="Full name"
    className="border px-3 py-2 rounded-lg"
  />

  <input
    value={profilePhone}
    onChange={(e) => setProfilePhone(e.target.value)}
    placeholder="Phone"
    className="border px-3 py-2 rounded-lg"
  />

  <input
    value={profileJobTitle}
    onChange={(e) => setProfileJobTitle(e.target.value)}
    placeholder="Job title"
    className="border px-3 py-2 rounded-lg"
  />

  <button
    type="submit"
    className="bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
  >
    Save Profile
  </button>

  {profileSaved && (
    <p className="text-green-600 text-sm md:col-span-3">
      Profile saved successfully.
    </p>
  )}
</form>
    </section>
  </section>
)}

{activeModule === "Settings" && canManageSettings && (
  <section className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold">
        Settings
      </h2>

      <p className="text-slate-500">
        Configure system preferences, users, and organization settings.
      </p>
    </div>

    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Plan and Access
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Review your organization&apos;s current subscription and system access.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium capitalize text-slate-700">
        {subscriptionTier} plan
      </span>

      <span
        className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
          subscriptionStatus === "active" ||
          subscriptionStatus === "trialing"
            ? "bg-green-100 text-green-700"
            : subscriptionStatus === "past_due"
              ? "bg-amber-100 text-amber-700"
              : "bg-red-100 text-red-700"
        }`}
      >
        Subscription: {subscriptionStatus.replace("_", " ")}
      </span>

      <span
        className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
          accessStatus === "active"
            ? "bg-green-100 text-green-700"
            : accessStatus === "suspended"
              ? "bg-amber-100 text-amber-700"
              : "bg-red-100 text-red-700"
        }`}
      >
        Access: {accessStatus}
      </span>
    </div>
  </div>

  {trialEndsAt && (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <p className="text-sm text-slate-500">
        Trial ends
      </p>

      <p className="mt-1 font-medium text-slate-900">
        {new Date(trialEndsAt).toLocaleDateString()}
      </p>
    </div>
  )}
  <div className="mt-5 border-t border-slate-100 pt-4">
  <p className="text-sm text-slate-500">
    Seat Usage
  </p>

  <p className="mt-1 font-medium text-slate-900">
    {usedSeats} of {seatLimit} seats used
  </p>

  <p
    className={`mt-1 text-sm ${
      seatLimitReached
        ? "text-red-600"
        : seatsRemaining <= 1
          ? "text-amber-600"
          : "text-green-600"
    }`}
  >
    {seatLimitReached
      ? "Seat limit reached. Upgrade or revoke an invitation before adding another user."
      : `${seatsRemaining} seat${seatsRemaining === 1 ? "" : "s"} remaining.`}
  </p>
</div>
<div className="mt-5 border-t border-slate-100 pt-4">
  <p className="text-sm text-slate-500">
    Plan Limits
  </p>

  <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4 text-sm">
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-slate-500">Companies</p>
      <p className="font-semibold">
        {companies.length} / {maxCompanies}
      </p>
    </div>

    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-slate-500">Clients</p>
      <p className="font-semibold">
        {activeClients.length} / {maxClients}
      </p>
    </div>

    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-slate-500">Inventory Items</p>
      <p className="font-semibold">
        {activeInventoryItems.length} / {maxInventoryItems}
      </p>
    </div>

    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-slate-500">Monthly Invoices</p>
      <p className="font-semibold">
        {customerInvoices.length} / {maxMonthlyInvoices}
      </p>
    </div>
  </div>
</div>
<div className="mt-5 border-t border-slate-100 pt-4">
  <p className="text-sm text-slate-500">
    Feature Access
  </p>

  <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm">
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-slate-500">Advanced Reports</p>
      <p
        className={`font-semibold ${
          advancedReportsEnabled
            ? "text-green-700"
            : "text-red-600"
        }`}
      >
        {advancedReportsEnabled ? "Enabled" : "Upgrade Required"}
      </p>
    </div>

    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-slate-500">AI Assist</p>
      <p
        className={`font-semibold ${
          aiAssistEnabled
            ? "text-green-700"
            : "text-red-600"
        }`}
      >
        {aiAssistEnabled ? "Enabled" : "Upgrade Required"}
      </p>
    </div>
  </div>
</div>
</section>    

<section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div>
      <h3 className="text-lg font-semibold text-slate-950">
        Subscription & Support
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Manage your Sephomic subscription, plan access, and support.
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
        {subscriptionTier} plan
      </span>

      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
          subscriptionStatus === "active" ||
          subscriptionStatus === "trialing"
            ? "bg-green-100 text-green-700"
            : subscriptionStatus === "past_due"
              ? "bg-amber-100 text-amber-700"
              : "bg-red-100 text-red-700"
        }`}
      >
        {subscriptionStatus.replace("_", " ")}
      </span>
    </div>
  </div>

  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    {subscriptionStatus === "trialing" && (
      <button
        type="button"
        onClick={() =>
          router.push("/account/subscription")
        }
        className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Subscribe to a Plan
      </button>
    )}

    {[
      "inactive",
      "cancelled",
      "canceled",
      "expired",
    ].includes(subscriptionStatus) && (
      <button
        type="button"
        onClick={() =>
          router.push("/account/subscription")
        }
        className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Purchase a Plan
      </button>
    )}

    {subscriptionStatus === "active" && (
      <>
        <button
          type="button"
          onClick={() =>
            router.push("/account/subscription")
          }
          className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Manage Subscription
        </button>

        {subscriptionTier !== "enterprise" && (
          <button
            type="button"
            onClick={() =>
              router.push("/account/subscription?mode=upgrade")
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Upgrade Plan
          </button>
        )}

        <button
          type="button"
          onClick={() =>
            router.push("/account/subscription?mode=cancel")
          }
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        >
          Terminate Service
        </button>
      </>
    )}

    {subscriptionStatus === "past_due" && (
      <button
        type="button"
        onClick={() =>
          router.push("/account/subscription?mode=billing")
        }
        className="rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
      >
        Update Billing
      </button>
    )}

    <button
      type="button"
      onClick={() =>
        router.push("/support")
      }
      className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
    >
      Contact Support
    </button>
  </div>

  {subscriptionStatus === "trialing" &&
    trialEndsAt && (
      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-900">
          Your Full Platform Evaluation ends{" "}
          {new Date(
            trialEndsAt
          ).toLocaleDateString()}.
        </p>

        <p className="mt-1 text-xs text-blue-700">
          Subscribe before the evaluation ends to
          continue using your selected Sephomic plan.
        </p>
      </div>
    )}

  {subscriptionStatus === "past_due" && (
    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-medium text-amber-900">
        Your subscription requires billing attention.
      </p>

      <p className="mt-1 text-xs text-amber-700">
        Update your billing information to maintain
        uninterrupted platform access.
      </p>
    </div>
  )}
</section>

{isAdmin && (
  <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
    <h3 className="text-lg font-semibold mb-4">Team Roles</h3>
    <form
    onSubmit={createInvitation}
    className="grid gap-3 md:grid-cols-4 mb-6 rounded-xl border bg-slate-50 p-4"
    >
  <input
    value={inviteEmail}
    onChange={(e) => setInviteEmail(e.target.value)}
    placeholder="Invite user by email"
    className="border px-3 py-2 rounded-lg md:col-span-2"
  />

  <select
    value={inviteRole}
    onChange={(e) => setInviteRole(e.target.value)}
    className="border px-3 py-2 rounded-lg"
  >
    <option value="admin">Admin</option>
    <option value="manager">Manager</option>
    <option value="accounting">Accounting</option>
    <option value="sales">Sales</option>
    <option value="warehouse">Warehouse</option>
    <option value="purchasing">Purchasing</option>
    <option value="member">Member</option>
  </select>

  <button
  type="submit"
  disabled={seatLimitReached}
  className={`px-4 py-2 rounded-xl shadow-md transition-all duration-200 font-medium ${
    seatLimitReached
      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
      : "bg-slate-950 text-white hover:shadow-lg hover:-translate-y-0.5"
  }`}
>
  Invite User
</button>
</form>
<div className="mb-6">
  <h4 className="font-semibold mb-3">
    Pending Invitations
  </h4>

  {userInvitations.length === 0 ? (
    <p className="text-sm text-slate-500">
      No invitations have been created yet.
    </p>
  ) : (
    <div className="grid gap-3">
      {userInvitations.map((invitation) => (
        <div
          key={invitation.id}
          className="border rounded-lg p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="font-semibold">
              {invitation.email}
            </p>

            <p className="text-sm text-slate-500 capitalize">
              Role: {invitation.role}
            </p>

            <p className="text-xs text-slate-400">
              Expires:{" "}
              {invitation.expires_at
                ? new Date(invitation.expires_at).toLocaleDateString()
                : "No expiration"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
           <span
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
          invitation.status === "pending" &&
          !isInvitationExpired(invitation)
          ? "bg-yellow-100 text-yellow-700"
          : invitation.status === "accepted"
          ? "bg-green-100 text-green-700"
          : invitation.status === "revoked"
          ? "bg-red-100 text-red-700"
          : "bg-slate-100 text-slate-600"
          }`}
          >
              {invitation.status === "pending" &&
              isInvitationExpired(invitation)
              ? "expired"
              : invitation.status}
            </span>


            {invitation.status === "pending" &&
            !isInvitationExpired(invitation) && (
              <button
                type="button"
                onClick={() => revokeInvitation(invitation.id)}
                className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
              >
                Revoke
              </button>
            )}
            {(
  invitation.status === "revoked" ||
  invitation.status === "expired" ||
  (
    invitation.status === "pending" &&
    isInvitationExpired(invitation)
  )
) && (
  <button
    type="button"
    onClick={() => resendInvitation(invitation)}
    className="bg-slate-950 text-white px-3 py-2 rounded-lg text-sm"
  >
    Resend
  </button>
)}
          </div>
        </div>
      ))}
    </div>
  )}
</div>

   <div className="grid gap-3">
  {teamMembers.map((member) => {
    const isCurrentUser =
      member.id === currentTeamMember?.id

    const isOwner =
      member.role === "owner"

    const isActive =
      member.is_active !== false

    return (
      <div
        key={member.id}
        className="border rounded-lg p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
      >
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold">
              {member.full_name || member.email}
            </p>

            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>

            {isCurrentUser && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                You
              </span>
            )}

            {isOwner && (
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                Owner
              </span>
            )}
          </div>

          <p className="text-sm text-slate-500">
            {member.email}
          </p>
        </div>

        <div className="flex flex-col md:items-end gap-2">
          <select
            value={member.role || "member"}
            disabled={
              isCurrentUser ||
              isOwner ||
              !isActive
            }
            onChange={(e) =>
              updateUserRole(
                member.id,
                e.target.value
              )
            }
            className={`border px-3 py-2 rounded-lg ${
              isCurrentUser ||
              isOwner ||
              !isActive
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : ""
            }`}
          >
            {isOwner && (
              <option value="owner">
                Owner
              </option>
            )}

            <option value="admin">
              Admin
            </option>
            <option value="manager">
              Manager
            </option>
            <option value="accounting">
              Accounting
            </option>
            <option value="sales">
              Sales
            </option>
            <option value="warehouse">
              Warehouse
            </option>
            <option value="purchasing">
              Purchasing
            </option>
            <option value="member">
              Member
            </option>
          </select>

          <div className="flex gap-2 flex-wrap justify-end">
            {isActive &&
              !isCurrentUser &&
              !isOwner && (
                <button
                  type="button"
                  onClick={() =>
                    deactivateTeamMember(
                      member.id
                    )
                  }
                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Deactivate
                </button>
              )}

            {!isActive && !isOwner && (
              <button
                type="button"
                onClick={() =>
                  reactivateTeamMember(
                    member.id
                  )
                }
                className="bg-slate-950 text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition"
              >
                Reactivate
              </button>
            )}
          </div>

          {isCurrentUser && (
            <p className="text-xs text-slate-400">
              Your own role and account status are locked.
            </p>
          )}

          {isOwner && !isCurrentUser && (
            <p className="text-xs text-slate-400">
              The owner account is protected.
            </p>
          )}

          {!isActive && (
            <p className="text-xs text-slate-400">
              This user cannot access the organization.
            </p>
          )}
        </div>
      </div>
    )
  })}
</div>
  </section>

)}
<section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
  <h3 className="text-lg font-semibold mb-4">
    Organization Profile
  </h3>

  <div className="grid gap-4 md:grid-cols-2">
    <div>
      <p className="text-xs text-slate-500 mb-1">
        Organization Name
      </p>

      <input
        value={organizationName}
        onChange={(e) => setOrganizationName(e.target.value)}
        placeholder="Organization name"
        className="border px-3 py-2 rounded-lg w-full"
      />
    </div>
    <div>
  <p className="text-xs text-slate-500 mb-1">
    Contact Email
  </p>

  <input
    value={organizationEmail}
    onChange={(e) => setOrganizationEmail(e.target.value)}
    placeholder="Contact email"
    className="border px-3 py-2 rounded-lg w-full"
  />
</div>
<div>
  <p className="text-xs text-slate-500 mb-1">
    Phone
  </p>

  <input
    value={organizationPhone}
    onChange={(e) => setOrganizationPhone(e.target.value)}
    placeholder="Phone number"
    className="border px-3 py-2 rounded-lg w-full"
  />
</div>
<div>
  <p className="text-xs text-slate-500 mb-1">
    Website
  </p>

  <input
    value={organizationWebsite}
    onChange={(e) => setOrganizationWebsite(e.target.value)}
    placeholder="https://example.com"
    className="border px-3 py-2 rounded-lg w-full"
  />
</div>
<div className="md:col-span-2">
  <p className="text-xs text-slate-500 mb-1">
    Business Address
  </p>

  <textarea
    value={organizationAddress}
    onChange={(e) => setOrganizationAddress(e.target.value)}
    placeholder="Business address"
    className="border px-3 py-2 rounded-lg w-full"
  />
</div>

    <div>
      <p className="text-xs text-slate-500 mb-1">
        Organization ID
      </p>

      <input
        value={organizationId || ""}
        disabled
        className="border px-3 py-2 rounded-lg w-full bg-slate-100 text-slate-500 cursor-not-allowed"
      />
    </div>
  </div>

  <p className="text-sm text-slate-500 mt-4">
    Additional organization contact fields can be enabled after database columns are added.
  </p>
  <button
  type="button"
  onClick={updateOrganizationProfile}
  className="mt-4 bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
>
  Save Organization Profile
</button>
{successMessage === "Organization profile saved successfully." && (
  <p className="text-green-600 text-sm mt-3">
    Organization profile saved successfully.
  </p>
)}
</section>
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold mb-4">System Settings</h3>

      <div className="grid gap-3">
        {[
          "User Management",
          "Roles & Permissions",
          "Organization Settings",
          "Integrations",
          "Notifications",
        ].map((item) => (
          <div
            key={item}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <span className="font-medium">{item}</span>
            <span className="text-sm text-slate-500">Not connected yet</span>
          </div>
        ))}
      </div>
    </section>
  </section>
)}

{["Dashboard", "Tasks", "Production"].includes(activeModule) && (
  <>

{/* CREATE TASK */}
<section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
  <h2 className="text-xl font-semibold mb-1">Create New Task</h2>
<p className="text-sm text-slate-500 mb-4">
  Add a new task, assign ownership, and connect it to a client or company.
</p>

  <form onSubmit={handleCreateTask} className="grid gap-4 md:grid-cols-4">
    <input
      value={newTaskTitle}
      onChange={(e) => setNewTaskTitle(e.target.value)}
      placeholder="Task title"
      className="border px-3 py-2 rounded-lg md:col-span-2"
    />

    <select
      value={newTaskStatus}
      onChange={(e) => setNewTaskStatus(e.target.value)}
      className="border px-3 py-2 rounded-lg"
    >
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>

    <select
      value={newTaskPriority}
      onChange={(e) => setNewTaskPriority(e.target.value)}
      className="border px-3 py-2 rounded-lg"
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
    <select
      value={newTaskAssignedTo}
      onChange={(e) => setNewTaskAssignedTo(e.target.value)}
      className="border px-3 py-2 rounded-lg"
    >
      <option value="">Unassigned</option>
      {teamMembers.map((member) => (
        <option key={member.id} value={member.id}>
          {member.full_name || member.email}
        </option>
      ))}
    </select>
    <select
  value={newTaskClientId}
  onChange={(e) => setNewTaskClientId(e.target.value)}
  className="border px-3 py-2 rounded-lg"
>
  <option value="">No Client</option>
  {clients.map((client) => (
    <option key={client.id} value={client.id}>
      {client.name}
    </option>
  ))}
</select>
<select
  value={newTaskCompanyId}
  onChange={(e) => setNewTaskCompanyId(e.target.value)}
  className="border px-3 py-2 rounded-lg"
>
  <option value="">No Company</option>
  {companies.map((company) => (
    <option key={company.id} value={company.id}>
      {company.name}
    </option>
  ))}
</select>
    <input
      type="date"
      value={newTaskDueDate}
      onChange={(e) => setNewTaskDueDate(e.target.value)}
      className="border px-3 py-2 rounded-lg"
    />

 <button
  type="submit"
  disabled={!organizationId || creatingTask}
  className={`px-4 py-2 rounded-lg md:col-span-4 ${
    !organizationId || creatingTask
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-black text-white"
  }`}
>
  {creatingTask ? "Creating..." : "Create Task"}
</button>
  </form>
</section>
        {/* TASKS */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
  <h2 className="text-xl font-semibold">Tasks</h2>
  <span className="text-sm text-slate-500">
    Showing {filteredTasks.length} of {tasks.length}
  </span>
</div>
<div className="flex flex-wrap gap-2 mb-4 items-center">
  <button
    onClick={() => setTaskViewFilter("all")}
    className={`px-4 py-2 rounded-lg border ${
      taskViewFilter === "all"
        ? "bg-black text-white"
        : "bg-white text-black"
    }`}
  >
    All Tasks
  </button>

  <button
    onClick={() => setTaskViewFilter("mine")}
    className={`px-4 py-2 rounded-lg border ${
      taskViewFilter === "mine"
        ? "bg-black text-white"
        : "bg-white text-black"
    }`}
  >
  My Tasks
  </button>
</div>

<input
  value={taskSearch}
  onChange={(e) => setTaskSearch(e.target.value)}
  placeholder="Search tasks..."
  className="border px-3 py-2 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-black/10"
/>
{filteredTasks.length === 0 && (
  <div className="border border-dashed rounded-xl p-6 text-center text-slate-500">
    No tasks found.
  </div>
)}

{filteredTasks.map((task) => (
  <div
    key={task.id}
    className="bg-white shadow-sm rounded-2xl p-6 mb-5 border border-gray-100 hover:shadow-md transition-all"
  >
    <div className="flex justify-between items-center mb-3">
  <span className="text-xs uppercase tracking-wide text-slate-400">
    Task
  </span>

  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
    {task.status.replace("_", " ")}
  </span>
</div>

    {/* Title */}
    <input
      value={task.title}
      disabled={!canEditTask(task)}
      onChange={(e) => {
        if (canEditTask(task)) {
          updateTask(task.id, { title: e.target.value })
        }
      }}
      className={`w-full text-lg font-semibold border border-gray-200 px-3 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-black/10 ${
        !canEditTask(task)
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : ""
      }`}
    />

    {/* Status */}
    <div>
        <label className="text-sm text-gray-500">Status</label>
    <select
  value={task.status}
  disabled={!canEditTask(task)}
  onChange={(e) => {
    if (canEditTask(task)) {
      updateTask(task.id, { status: e.target.value })
    }
  }}
  className={`w-full border px-3 py-2 rounded-lg mt-1 ${
    !canEditTask(task)
      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
      : ""
  }`}
>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      {/* Priority */}
<div>
  <label className="text-sm text-gray-500">Priority</label>
 <select
  value={task.priority}
  disabled={!canEditTask(task)}
  onChange={(e) => {
    if (canEditTask(task)) {
      updateTask(task.id, { priority: e.target.value })
    }
  }}
  className={`w-full border px-3 py-2 rounded-lg mt-1 ${
    !canEditTask(task)
      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
      : ""
  }`}
>
    <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
  </select>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 mt-3">
  <div>
    <label className="text-sm text-gray-500">Client</label>
    <select
      value={task.client_id || ""}
      onChange={(e) =>
        updateTask(task.id, {
          client_id: e.target.value === "" ? null : e.target.value,
        })
      }
      className="w-full border px-3 py-2 rounded-lg mt-1"
    >
      <option value="">No client</option>
      {clients.map((client) => (
        <option key={client.id} value={client.id}>
          {client.name}
        </option>
      ))}
    </select>
  </div>

  <div>
    <label className="text-sm text-gray-500">Company</label>
    <select
      value={task.company_id || ""}
      onChange={(e) =>
        updateTask(task.id, {
          company_id: e.target.value === "" ? null : e.target.value,
        })
      }
      className="w-full border px-3 py-2 rounded-lg mt-1"
    >
      <option value="">No company</option>
      {companies.map((company) => (
        <option key={company.id} value={company.id}>
          {company.name}
        </option>
      ))}
    </select>
  </div>
</div>

{task.due_date && (
  <p className="text-sm text-gray-500 mb-2">
    Due: {new Date(task.due_date).toLocaleDateString()}
  </p>
)}

<div className="mt-3 mb-3">
  <label className="text-sm text-gray-500">Assigned To</label>
  <select
  value={task.assigned_to || ""}
  disabled={!isAdmin && task.assigned_to !== currentTeamMember?.id}
 onChange={(e) => {
  if (isAdmin) {
    updateTask(task.id, {
      assigned_to: e.target.value === "" ? null : e.target.value,
    })
  }
}}
  className={`w-full border px-3 py-2 rounded-lg mt-1 ${
    !canEditTask(task)
      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
      : ""
  }`}
>
    <option value="">Unassigned</option>
    {teamMembers.map((member) => (
      <option key={member.id} value={member.id}>
        {member.full_name || member.email}
      </option>
    ))}
  </select>
</div>
    {/* Footer Actions */}
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-400">
        Task ID: {task.id.slice(0, 8)}
      </span>

      {isAdmin && (
      <button
      onClick={() => deleteTask(task.id)}
      className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700"
      >
      Delete
      </button>
      )}
    </div>
  </div>
))}
        </section>

  </>
)}

{(["Dashboard"].includes(activeModule) ||
  (activeModule === "Clients" &&
    (canManageSales || canManageFinance || isManager || isAdmin))) && (
  <>

{/* CLIENTS */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
  <div>
    <h2 className="text-xl font-semibold">Clients</h2>
    <p className="text-sm text-slate-500">
      Manage customer records and link them to companies.
    </p>
  </div>

  <span className="text-sm text-slate-500">
    {clients.length} total
  </span>
</div>
       <form onSubmit={handleCreateClient} className="flex gap-2 mb-4">
  <input
    value={newClientName}
    onChange={(e) => setNewClientName(e.target.value)}
    placeholder="New client name"
    className="border px-3 py-2 rounded-lg flex-1"
  />

  <button
    type="submit"
    className="bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
  >
    Add Client
  </button>
</form>
{successMessage && (
  <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-4">
    {successMessage}
  </div>
)}

{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
    {error}
  </div>
)}
{activeClients.length === 0 && (
  <div className="border border-dashed rounded-xl p-6 text-center text-slate-500">
    No clients created yet.
  </div>
)}

  {activeClients.map((c) => (
  <div
  key={c.id}
  className="border border-gray-100 bg-white rounded-xl p-4 mb-3 flex flex-col md:flex-row gap-3 md:items-center"
>
    <input
      value={c.name}
      onChange={(e) => updateClient(c.id, { name: e.target.value })}
      className="border px-3 py-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-black/10"
    />

    <select
      value={c.company_id || ""}
      onChange={(e) =>
        updateClient(c.id, {
          company_id: e.target.value === "" ? null : e.target.value,
        })
      }
      className="border px-3 py-2 rounded-lg"
    >
      <option value="">No Company</option>
      {companies.map((company) => (
        <option key={company.id} value={company.id}>
          {company.name}
        </option>
      ))}
    </select>

    {isAdmin && (
  <button
    type="button"
    onClick={() => archiveClient(c.id)}
    className="bg-slate-600 text-white px-3 py-2 rounded-lg hover:bg-slate-700 transition"
  >
    Archive Client
  </button>
)}
  </div>
))}
               </section>

{archivedClients.length > 0 && (
  <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
    <h3 className="text-lg font-semibold mb-4">
      Archived Clients
    </h3>

    <p className="text-sm text-slate-500">
      Archived clients are hidden from active client views but retained for audit history.
    </p>

    <div className="grid gap-3 mt-4">
      {archivedClients.map((client) => (
        <div
          key={client.id}
          className="border rounded-xl p-4 bg-slate-50"
        >
          <div className="font-semibold">
            {client.name}
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => restoreClient(client.id)}
              className="mt-3 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Restore Client
            </button>
          )}
        </div>
      ))}
    </div>
  </section>
)}

  </>
)}


{(["Dashboard"].includes(activeModule) ||
  (activeModule === "Companies" && canManageCompanies)) && (
  <>
    {/* COMPANIES */}
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Companies</h2>
          <p className="text-sm text-slate-500">
            Manage organizations, vendors, and customer companies.
          </p>
        </div>

        <span className="text-sm text-slate-500">
          {companies.length} total
        </span>
      </div>

      <form onSubmit={handleCreateCompany} className="flex gap-2 mb-4">
        <input
          value={newCompanyName}
          onChange={(e) => setNewCompanyName(e.target.value)}
          placeholder="New company name"
          className="border px-3 py-2 rounded-lg flex-1"
        />

        <button
          type="submit"
          className="bg-slate-950 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
        >
          Add Company
        </button>
      </form>

      {companies.length === 0 && (
        <div className="border border-dashed rounded-xl p-6 text-center text-slate-500">
          No companies created yet.
        </div>
      )}

            {companies.map((c) => (
        <div
          key={c.id}
          className="border border-gray-100 bg-white rounded-xl p-4 mb-3 flex flex-col md:flex-row gap-3 md:items-center"
        >
          <input
          key={`${c.id}-${c.name}`}
          defaultValue={c.name}
          disabled={!canManageCompanies}
          onBlur={(e) => {

          const updatedName = e.target.value.trim()

    if (!updatedName) {
      setError("Company name is required.")
      e.target.value = c.name
      return
    }

    if (updatedName === c.name) {
      return
    }

    updateCompany(c.id, {
      name: updatedName,
    })
  }}
  className={`border px-3 py-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-black/10 ${
    !canManageCompanies
      ? "bg-slate-100 text-slate-500 cursor-not-allowed"
      : ""
  }`}
/>

          {isAdmin && (
            <button
              type="button"
              onClick={() => deleteCompany(c.id)}
              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </section>
  </>
)}

      {error && <p className="text-red-600">{error}</p>}
    </div>
  </div>
</main>
  )
}