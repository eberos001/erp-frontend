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
  organization_id: string
}

type Company = {
  id: string
  name: string
  organization_id: string
}

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
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

      const [
        { data: tasksData, error: tasksError },
        { data: clientsData, error: clientsError },
        { data: companiesData, error: companiesError },
      ] = await Promise.all([
        supabase
          .from('tasks')
          .select('id, title, status, priority, organization_id')
          .order('created_at', { ascending: false }),
        supabase
          .from('clients')
          .select('id, name, organization_id')
          .order('created_at', { ascending: false }),
        supabase
          .from('companies')
          .select('id, name, organization_id')
          .order('created_at', { ascending: false }),
      ])

      if (tasksError || clientsError || companiesError) {
        setError(
          tasksError?.message ||
            clientsError?.message ||
            companiesError?.message ||
            'Failed to load dashboard data.'
        )
        setLoading(false)
        return
      }

      setTasks(tasksData ?? [])
      setClients(clientsData ?? [])
      setCompanies(companiesData ?? [])
      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">EBEROS ERP Dashboard</h1>
            <p className="text-gray-600">Signed in as: {email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90"
          >
            Logout
          </button>
        </div>

        {loading ? <p>Loading...</p> : null}
        {error ? <p className="text-red-600">{error}</p> : null}

        {!loading && !error ? (
          <div className="grid gap-6 md:grid-cols-3">
            <section className="rounded-xl bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">Tasks</h2>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-sm text-gray-500">No visible tasks.</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="rounded-lg border p-3">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-gray-600">Status: {task.status}</p>
                      <p className="text-sm text-gray-600">Priority: {task.priority}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">Clients</h2>
              <div className="space-y-3">
                {clients.length === 0 ? (
                  <p className="text-sm text-gray-500">No visible clients.</p>
                ) : (
                  clients.map((client) => (
                    <div key={client.id} className="rounded-lg border p-3">
                      <p className="font-medium">{client.name}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">Companies</h2>
              <div className="space-y-3">
                {companies.length === 0 ? (
                  <p className="text-sm text-gray-500">No visible companies.</p>
                ) : (
                  companies.map((company) => (
                    <div key={company.id} className="rounded-lg border p-3">
                      <p className="font-medium">{company.name}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  )
}
