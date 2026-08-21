"use client"

import Link from "next/link"
import { useState } from "react"

export default function SignupPage() {
  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [teamSize, setTeamSize] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)

 async function handleDemoRequest(e: React.FormEvent) {
  e.preventDefault()

  setError("")
  setSuccessMessage("")
  setLoading(true)

  if (!fullName.trim()) {
    setError("Your name is required.")
    setLoading(false)
    return
  }

  if (!companyName.trim()) {
    setError("Company name is required.")
    setLoading(false)
    return
  }

  if (!email.trim()) {
    setError("Email is required.")
    setLoading(false)
    return
  }

  try {
    const response = await fetch("/api/demo-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        companyName,
        email,
        phone,
        teamSize,
        message,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      setError(
        result.error ||
          "Unable to submit your demo request."
      )
      return
    }

    setFullName("")
    setCompanyName("")
    setEmail("")
    setPhone("")
    setTeamSize("")
    setMessage("")

    setSuccessMessage(
      result.message ||
        "Your demo request was submitted successfully. We will contact you soon."
    )
  } catch (requestError) {
    console.error(
      "DEMO REQUEST SUBMISSION ERROR:",
      requestError
    )

    setError(
      "Unable to submit your demo request. Please try again."
    )
  } finally {
    setLoading(false)
  }
}

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-slate-300 hover:text-white"
          >
            ← Back to Sephomic
          </Link>

          <h1 className="mt-6 text-4xl font-bold">
            Request a Sephomic Demo
          </h1>

          <p className="mt-4 text-slate-300">
            Tell us about your business and the workflows you want to improve.
          </p>
        </div>

        <form
          onSubmit={handleDemoRequest}
          className="space-y-5 rounded-2xl border border-slate-700 bg-white p-8 text-slate-950 shadow-xl"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Your Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Jane Smith"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Company Name
            </label>

            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Example Manufacturing"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Work Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="jane@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Phone
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Team Size
            </label>

            <select
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">Select team size</option>
              <option value="1-5">1–5 employees</option>
              <option value="6-20">6–20 employees</option>
              <option value="21-50">21–50 employees</option>
              <option value="51-200">51–200 employees</option>
              <option value="201+">201+ employees</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              What would you like to improve?
            </label>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Purchasing, inventory, finance, reporting, workflow automation..."
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Request Demo"}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have access?{" "}
            <Link
              href="/login"
              className="font-semibold text-slate-950 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}