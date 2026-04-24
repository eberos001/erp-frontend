import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="max-w-xl text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold">EBEROS ERP</h1>
        <p className="text-lg text-gray-600">
          A secure operations dashboard for managing tasks, clients, and company records.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-black px-6 py-3 text-white hover:opacity-90"
        >
          Login
        </Link>
      </div>
    </main>
  )
}
