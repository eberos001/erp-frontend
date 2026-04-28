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
  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }
}
async function handleLogout() {
  await supabase.auth.signOut()
  router.push('/login')
}
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

        {/* CREATE TASK */}
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

            <button className="bg-black text-white px-4 py-2 rounded-lg md:col-span-4">
              {creatingTask ? 'Creating...' : 'Create Task'}
            </button>
          </form>
        </section>

        {/* TASKS */}
        <section className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>

          {tasks.map((task) => (
            <div key={task.id} className="border p-3 rounded-lg mb-3">
              <input
  value={task.title}
  onChange={(e) => updateTask(task.id, { title: e.target.value })}
  className="w-full border px-3 py-2 rounded-lg font-medium mb-2"
/>

             <label className="text-sm text-gray-600 mt-2 block">Priority</label>
<select
  value={task.priority}
  onChange={(e) => updateTask(task.id, { priority: e.target.value })}
  className="w-full border px-3 py-2 rounded-lg mt-1"
>
  <option value="low">Low</option>
  <option value="medium">Medium</option>
  <option value="high">High</option>
</select>

<button
  type="button"
  onClick={() => deleteTask(task.id)}
  className="mt-3 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
>
  Delete Task
</button>
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
