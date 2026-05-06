'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
}

type Company = {
  id: string
  name: string
}

type TeamMember = {
  id: string
  full_name: string
  email: string
  role?: string | null
  avatar_url?: string | null
  phone?: string | null
  job_title?: string | null
}

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskStatus, setNewTaskStatus] = useState('pending')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState("")
  const [newTaskClientId, setNewTaskClientId] = useState("")
  const [newTaskCompanyId, setNewTaskCompanyId] = useState("")
  const [newClientName, setNewClientName] = useState("")
  const [newCompanyName, setNewCompanyName] = useState("")
  const [profileName, setProfileName] = useState("")
  const [profilePhone, setProfilePhone] = useState("")
  const [profileJobTitle, setProfileJobTitle] = useState("")
  const [profileSaved, setProfileSaved] = useState(false)
  const [creatingTask, setCreatingTask] = useState(false)
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [taskViewFilter, setTaskViewFilter] = useState("all")
  const [taskSearch, setTaskSearch] = useState("")
  const [activeModule, setActiveModule] = useState("Dashboard")

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

  const { data: memberData } = await supabase
    .from('team_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!memberData) {
    setError('No team member record found.')
    setLoading(false)
    return
  }
   const loadedOrgId = memberData.organization_id
setOrganizationId(loadedOrgId)
localStorage.setItem("erp_org_id", loadedOrgId)
console.log("ORG ID LOADED:", loadedOrgId)

const { data: tasksData, error: tasksError } = await supabase
  .from('tasks')
  .select('id, title, status, priority, organization_id, assigned_to, due_date, client_id, company_id')
  .order('created_at', { ascending: false })

if (tasksError) {
  console.error("TASKS LOAD ERROR:", tasksError)
  setError(tasksError.message)
}

const { data: clientsData } = await supabase
  .from('clients')
  .select('id, name, company_id')
  .order('created_at', { ascending: false })

const { data: companiesData } = await supabase
  .from('companies')
  .select('id, name')
  .order('created_at', { ascending: false })

const { data: teamData } = await supabase
  .from('team_members')
  .select('id, full_name, email, role, avatar_url, phone, job_title')
  .eq('organization_id', memberData.organization_id)

setTasks(tasksData || [])
setClients(clientsData || [])
setCompanies(companiesData || [])
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

async function handleCreateTask(e: React.FormEvent) {
  e.preventDefault()

  console.log("CREATE TASK FUNCTION TRIGGERED")

  if (!newTaskTitle.trim()) return

  setCreatingTask(true)
  setError("")
  console.log("CREATE TASK ORG ID:", organizationId)

  let orgIdForInsert =
  organizationId ||
  localStorage.getItem("erp_org_id") ||
  "58e9d330-d320-46b7-8c43-dacfbc3f1236"

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

console.log("ORG ID USED:", orgIdForInsert)
console.log("TASK PAYLOAD:", taskPayload)

const { error: insertError } = await supabase.from("tasks").insert(taskPayload)

if (insertError) {
  console.error("CREATE TASK ERROR FULL:", insertError)
  setError(insertError.message)
  setCreatingTask(false)
  return
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

  if (!newClientName.trim()) return

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError("No organization loaded. Please refresh and log in again.")
    return
  }

  const { error } = await supabase.from("clients").insert({
    organization_id: orgId,
    name: newClientName,
  })

  if (error) {
    setError(error.message)
    return
  }

  setNewClientName("")
  await loadData()
}
async function updateClient(clientId: string, updates: Partial<Client>) {
  const { error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", clientId)

  if (error) {
    setError(error.message)
    return
  }

  await loadData()
}
async function deleteClient(clientId: string) {
  const confirmed = window.confirm("Delete this client?")
  if (!confirmed) return

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId)

  if (error) {
    setError(error.message)
    return
  }

  await loadData()
}

async function handleCreateCompany(e: React.FormEvent) {
  e.preventDefault()

  if (!newCompanyName.trim()) return

  const orgId =
    organizationId ||
    localStorage.getItem("erp_org_id")

  if (!orgId) {
    setError("No organization loaded. Please refresh and log in again.")
    return
  }

  const { error } = await supabase.from("companies").insert({
    organization_id: orgId,
    name: newCompanyName,
  })

  if (error) {
    setError(error.message)
    return
  }

  setNewCompanyName("")
  await loadData()
}

async function updateCompany(companyId: string, updates: Partial<Company>) {
  const { error } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", companyId)

  if (error) {
    setError(error.message)
    return
  }

  await loadData()
}
async function deleteCompany(companyId: string) {
  const confirmed = window.confirm("Delete this company?")
  if (!confirmed) return

  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", companyId)

  if (error) {
    setError(error.message)
    return
  }

  await loadData()
}
async function updateMyProfile(e: React.FormEvent) {
  e.preventDefault()

  console.log("SAVE PROFILE CLICKED")
  console.log("CURRENT TEAM MEMBER:", currentTeamMember)
  console.log("PROFILE DATA:", profileName, profilePhone, profileJobTitle)

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

async function updateUserRole(memberId: string, newRole: string) {
  const { error } = await supabase
    .from("team_members")
    .update({ role: newRole })
    .eq("id", memberId)

  if (error) {
    setError(error.message)
    return
  }

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
  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)

  if (error) {
    setError(error.message)
    return
  }

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
const totalTasks = tasks.length;
const pendingTasks = tasks.filter((task) => task.status === "pending").length;
const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length;
const completedTasks = tasks.filter((task) => task.status === "completed").length;
const openWorkOrders = tasks.filter((task) => task.status !== "completed").length;
const totalClients = clients.length;
const totalCompanies = companies.length;
const activeTeamMembers = teamMembers.length;
const currentTeamMember = teamMembers.find((member) => member.email === email)
const isAdmin = currentTeamMember?.role === "admin"
const canEditTask = (task: Task) =>
  isAdmin || task.assigned_to === currentTeamMember?.id
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
  (taskViewFilter === "mine" && task.assigned_to === currentTeamMember?.id)

  return matchesStatus && matchesPriority && matchesAssignee && matchesTaskView
})
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
  <div className="flex min-h-screen">
    {/* SIDEBAR */}
    <aside className="w-64 bg-slate-950 text-white p-6 hidden md:block">
      <h1 className="text-2xl font-bold mb-8">EBEROS ERP</h1>

      <nav className="space-y-2 text-sm">
  {[
    "Dashboard",
    "Sales",
    "Purchasing",
    "Inventory",
    "Production",
    "Finance",
    "Clients",
    "Companies",
    "Tasks",
    "Reports",
    "Settings",
  ].map((item) => (
    <button
      key={item}
      type="button"
      onClick={() => setActiveModule(item)}
      className={`w-full text-left px-4 py-2 rounded-lg transition ${
        activeModule === item
          ? "bg-white text-slate-950 font-semibold"
          : "text-slate-300 hover:bg-slate-800"
      }`}
    >
      {item}
    </button>
  ))}
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

      {activeModule === "Dashboard" && (
  <>
    {/* ERP KPI CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open Work Orders</p>
          <p className="text-3xl font-bold">{openWorkOrders}</p>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Tasks</p>
          <p className="text-3xl font-bold">{totalTasks}</p>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">Clients</p>
          <p className="text-3xl font-bold">{totalClients}</p>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">Companies</p>
          <p className="text-3xl font-bold">{totalCompanies}</p>
        </div>
      </div>

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
          <p className="text-2xl font-bold mt-4">Coming Soon</p>
        </section>

        <section className="bg-white border rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Finance</h2>
          <p className="text-sm text-slate-500">Receivables, payables, purchasing, and sales totals.</p>
          <p className="text-2xl font-bold mt-4">Coming Soon</p>
        </section>
       </div>
    </>
  )}
{activeModule === "Production" && (
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
    <section className="bg-white p-6 rounded-xl shadow">
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
{activeModule === "Inventory" && (
  <section className="space-y-6">

    <div>
      <h2 className="text-2xl font-bold">Inventory</h2>
      <p className="text-slate-500">
        Track materials, stock levels, parts, and low-stock alerts.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Total Items</p>
        <p className="text-2xl font-bold">Coming Soon</p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Low Stock</p>
        <p className="text-2xl font-bold">Coming Soon</p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Inventory Value</p>
        <p className="text-2xl font-bold">Coming Soon</p>
      </div>
    </div>

    <section className="bg-white p-6 rounded-xl shadow">
      <h3 className="text-lg font-semibold mb-4">Inventory Summary</h3>

      <div className="grid gap-3">
        {[
          "Raw Materials",
          "Finished Goods",
          "Packaging Supplies",
          "Machine Parts",
          "Low Stock Alerts",
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
{activeModule === "Sales" && (
  <section className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold">Sales</h2>
      <p className="text-slate-500">
        Track customer orders, quotes, invoices, and sales activity.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Open Orders</p>
        <p className="text-2xl font-bold">Coming Soon</p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Revenue</p>
        <p className="text-2xl font-bold">Coming Soon</p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Pending Quotes</p>
        <p className="text-2xl font-bold">Coming Soon</p>
      </div>
    </div>

    <section className="bg-white p-6 rounded-xl shadow">
      <h3 className="text-lg font-semibold mb-4">Sales Workflow</h3>

      <div className="grid gap-3">
        {[
          "Quotes",
          "Sales Orders",
          "Invoices",
          "Customer Payments",
          "Delivery Status",
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
{activeModule === "Purchasing" && (
  <section className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold">Purchasing</h2>
      <p className="text-slate-500">
        Manage suppliers, purchase orders, material requests, and receiving.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Open Purchase Orders</p>
        <p className="text-2xl font-bold">Coming Soon</p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Pending Receiving</p>
        <p className="text-2xl font-bold">Coming Soon</p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Supplier Count</p>
        <p className="text-2xl font-bold">Coming Soon</p>
      </div>
    </div>

    <section className="bg-white p-6 rounded-xl shadow">
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
{activeModule === "Finance" && (
  <section className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold">Finance</h2>
      <p className="text-slate-500">
        Track receivables, payables, cash flow, and basic financial health.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Receivables</p>
        <p className="text-2xl font-bold">Coming Soon</p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Payables</p>
        <p className="text-2xl font-bold">Coming Soon</p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Cash Flow</p>
        <p className="text-2xl font-bold">Coming Soon</p>
      </div>
    </div>

    <section className="bg-white p-6 rounded-xl shadow">
      <h3 className="text-lg font-semibold mb-4">Finance Workflow</h3>

      <div className="grid gap-3">
        {[
          "Customer Invoices",
          "Vendor Bills",
          "Payments",
          "Expenses",
          "Financial Reports",
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
{activeModule === "Reports" && (
  <section className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold">Reports</h2>
      <p className="text-slate-500">
        View operational, production, inventory, sales, and finance summaries.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        "Production Report",
        "Inventory Report",
        "Sales Report",
        "Purchasing Report",
        "Finance Report",
        "Task Performance",
      ].map((report) => (
        <div
          key={report}
          className="bg-white border rounded-xl p-5 shadow-sm"
        >
          <p className="font-semibold">{report}</p>
          <p className="text-sm text-slate-500 mt-2">Not connected yet</p>
        </div>
      ))}
    </div>
  </section>
)}
{activeModule === "Settings" && (
  <section className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold">Settings</h2>
      <p className="text-slate-500">
        Configure system preferences, users, and organization settings.
      </p>
    </div>
<section className="bg-white p-6 rounded-xl shadow">
  <h3 className="text-lg font-semibold mb-4">My Profile</h3>

  <form onSubmit={updateMyProfile} className="grid gap-4 md:grid-cols-3">
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
  type="button"
  onClick={updateMyProfile}
  className="bg-black text-white px-4 py-2 rounded-lg md:col-span-3"
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

{isAdmin && (
  <section className="bg-white p-6 rounded-xl shadow">
    <h3 className="text-lg font-semibold mb-4">Team Roles</h3>

    <div className="grid gap-3">
      {teamMembers.map((member) => (
        <div
          key={member.id}
          className="border rounded-lg p-4 flex justify-between items-center gap-3"
        >
          <div>
            <p className="font-semibold">
              {member.full_name || member.email}
            </p>
            <p className="text-sm text-slate-500">{member.email}</p>
          </div>

          <div className="flex flex-col items-end">
            <select
              value={member.role || "user"}
              disabled={member.id === currentTeamMember?.id}
              onChange={(e) =>
                updateUserRole(member.id, e.target.value)
              }
              className={`border px-3 py-2 rounded-lg ${
                member.id === currentTeamMember?.id
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : ""
              }`}
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>

            {member.id === currentTeamMember?.id && (
              <p className="text-xs text-slate-400 mt-1">
                Your own role is locked.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  </section>
)}

    <section className="bg-white p-6 rounded-xl shadow">
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
        <section className="bg-white p-6 rounded-xl shadow">
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

{["Dashboard", "Clients"].includes(activeModule) && (
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
    className="bg-black text-white px-4 py-2 rounded-lg"
  >
    Add Client
  </button>
</form>
{clients.length === 0 && (
  <div className="border border-dashed rounded-xl p-6 text-center text-slate-500">
    No clients created yet.
  </div>
)}

   {clients.map((c) => (
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
    onClick={() => deleteClient(c.id)}
    className="bg-red-600 text-white px-3 py-2 rounded-lg"
  >
    Delete
  </button>
)}
  </div>
))}
        </section>

  </>
)}

{["Dashboard", "Companies"].includes(activeModule) && (
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
    className="bg-black text-white px-4 py-2 rounded-lg"
  >
    Add Company
  </button>
</form>

          {companies.map((c) => (
  <div
  key={c.id}
  className="border border-gray-100 bg-white rounded-xl p-4 mb-3 flex flex-col md:flex-row gap-3 md:items-center"
>
    <input
      value={c.name}
      onChange={(e) => updateCompany(c.id, { name: e.target.value })}
      className="border px-3 py-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-black/10"
    />

    {isAdmin && (
  <button
    onClick={() => deleteCompany(c.id)}
    className="bg-red-600 text-white px-3 py-2 rounded-lg"
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