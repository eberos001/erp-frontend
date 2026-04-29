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
}

type Client = {
  id: string
  name: string
}

type Company = {
  id: string
  name: string
}

type Company = {
  id: string
  name: string
}

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [organizationId, setOrganizationId] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskStatus, setNewTaskStatus] = useState('pending')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [creatingTask, setCreatingTask] = useState(false)
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

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

    setEmail(user.email ?? '')

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

    setOrganizationId(memberData.organization_id)

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('id, title, status, priority, organization_id')
      .order('created_at', { ascending: false })

    const { data: clientsData } = await supabase
      .from('clients')
      .select('id, name')
      .order('created_at', { ascending: false })

    const { data: companiesData } = await supabase
      .from('companies')
      .select('id, name')
      .order('created_at', { ascending: false })

    setTasks(tasksData || [])
    setClients(clientsData || [])
    setCompanies(companiesData || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault()

    if (!newTaskTitle.trim()) return

    setCreatingTask(true)

    const { error } = await supabase.from('tasks').insert({
  organization_id: organizationId,
  title: newTaskTitle,
  description: 'Created from dashboard',
  status: newTaskStatus,
  priority: newTaskPriority,
  due_date: newTaskDueDate || null,
})

    setCreatingTask(false)

    if (error) {
      setError(error.message)
      return
    }

    setNewTaskTitle('')
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
  return (
    <main className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">EBEROS ERP Dashboard</h1>
            <p className="text-gray-600">Signed in as: {email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
        {/* DASHBOARD STATS */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
  <div className="bg-white border rounded-xl p-4 shadow-sm">
    <p className="text-sm text-gray-500">Total Tasks</p>
    <p className="text-3xl font-bold">{totalTasks}</p>
  </div>

  <div className="bg-white border rounded-xl p-4 shadow-sm">
    <p className="text-sm text-gray-500">Pending</p>
    <p className="text-3xl font-bold">{pendingTasks}</p>
  </div>

  <div className="bg-white border rounded-xl p-4 shadow-sm">
    <p className="text-sm text-gray-500">In Progress</p>
    <p className="text-3xl font-bold">{inProgressTasks}</p>
  </div>

  <div className="bg-white border rounded-xl p-4 shadow-sm">
    <p className="text-sm text-gray-500">Completed</p>
    <p className="text-3xl font-bold">{completedTasks}</p>
  </div>
  </div>{/* CREATE TASK */}
<section className="bg-white p-6 rounded-xl shadow">
  <h2 className="text-xl font-semibold mb-4">Create New Task</h2>

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

    <input
      type="date"
      value={newTaskDueDate}
      onChange={(e) => setNewTaskDueDate(e.target.value)}
      className="border px-3 py-2 rounded-lg"
    />

    <button className="bg-black text-white px-4 py-2 rounded-lg md:col-span-4">
      {creatingTask ? "Creating..." : "Create Task"}
    </button>
  </form>
</section>
        {/* TASKS */}
        <section className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>

          {tasks.map((task) => (
  <div
    key={task.id}
    className="bg-white shadow-md rounded-2xl p-4 mb-4 border hover:shadow-lg transition"
  >
    {/* Title */}
    <input
      value={task.title}
      onChange={(e) => updateTask(task.id, { title: e.target.value })}
      className="w-full text-lg font-semibold border px-3 py-2 rounded-lg mb-3"
    />
      
      {/* Status */}
      <div>
        <label className="text-sm text-gray-500">Status</label>
        <select
          value={task.status}
          onChange={(e) => updateTask(task.id, { status: e.target.value })}
          className="w-full border px-3 py-2 rounded-lg mt-1"
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
          onChange={(e) => updateTask(task.id, { priority: e.target.value })}
          className="w-full border px-3 py-2 rounded-lg mt-1"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
                {task.due_date && (
  <p className="text-sm text-gray-500 mb-2">
    Due: {new Date(task.due_date).toLocaleDateString()}
  </p>
)}

    {/* Footer Actions */}
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-400">
        Task ID: {task.id.slice(0, 8)}
      </span>

      <button
        onClick={() => deleteTask(task.id)}
        className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700"
      >
        Delete
      </button>
    </div>
  </div>
))}
        </section>

        {/* CLIENTS */}
        <section className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Clients</h2>

          {clients.map((c) => (
            <div key={c.id} className="border p-3 rounded-lg mb-2">
              {c.name}
            </div>
          ))}
        </section>

        {/* COMPANIES */}
        <section className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Companies</h2>

          {companies.map((c) => (
            <div key={c.id} className="border p-3 rounded-lg mb-2">
              {c.name}
            </div>
          ))}
        </section>

        {error && <p className="text-red-600">{error}</p>}
      </div>
    </main>
  )
}
