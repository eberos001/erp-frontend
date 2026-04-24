import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="max-w-xl text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold">ERP Secure Test Shell</h1>
        <p className="text-lg text-gray-600">
          Minimal frontend connected to Supabase for authentication and tenant-isolation testing.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-black px-6 py-3 text-white hover:opacity-90"
        >
          Go to Login
        </Link>
      </div>
    </main>
  )
}
