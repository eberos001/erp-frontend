import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 inline-flex rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300">
          ERP for growing operations teams
        </div>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
          Sephomic
        </h1>

        <p className="mt-6 max-w-3xl text-xl text-slate-300">
          A modern ERP platform for managing purchasing, inventory, vendor bills,
          payments, tasks, and real-time operational reports.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 shadow-lg hover:bg-slate-100"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-white hover:bg-slate-900"
          >
            Request Demo
          </Link>
        </div>
      </section>
      <section className="border-t border-slate-800 bg-slate-900 px-6 py-20">
  <div className="mx-auto max-w-6xl">
    <div className="mb-10 text-center">
      <h2 className="text-3xl font-bold md:text-4xl">
        Built for the workflows that keep your business moving
      </h2>
      <p className="mt-4 text-slate-300">
        Sephomic connects purchasing, inventory, finance, and reporting in one secure operations platform.
      </p>
    </div>

    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[
        {
          title: "Purchasing",
          description:
            "Manage suppliers, purchase orders, line items, and receiving workflows.",
        },
        {
          title: "Inventory",
          description:
            "Track stock levels, movements, low-stock items, uploads, and inventory value.",
        },
        {
          title: "Accounts Payable",
          description:
            "Record vendor bills, partial payments, full payments, due dates, and outstanding balances.",
        },
        {
          title: "Reports",
          description:
            "View live operational reports across inventory, purchasing, finance, receiving, and tasks.",
        },
      ].map((feature) => (
        <div
          key={feature.title}
          className="rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold">{feature.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  </div>
  </section>
  <section className="bg-slate-950 px-6 py-20">
  <div className="mx-auto max-w-6xl text-center">
    <h2 className="text-3xl font-bold md:text-4xl">
      Built for growing businesses
    </h2>

    <p className="mt-4 text-slate-300">
      Sephomic was designed for companies that have outgrown spreadsheets
      but don't want the complexity and cost of traditional enterprise systems.
    </p>

    <div className="mt-12 grid gap-6 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h3 className="text-xl font-semibold">
          Manufacturers
        </h3>

        <p className="mt-3 text-slate-300">
          Track purchasing, receiving, inventory, and supplier relationships
          from one operational dashboard.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h3 className="text-xl font-semibold">
          Distributors
        </h3>

        <p className="mt-3 text-slate-300">
          Maintain inventory visibility, manage vendor obligations,
          and streamline procurement processes.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h3 className="text-xl font-semibold">
          Growing Teams
        </h3>

        <p className="mt-3 text-slate-300">
          Replace disconnected tools with one secure platform that scales
          alongside your operations.
        </p>
      </div>
    </div>
  </div>
</section>
<section className="border-t border-slate-800 bg-slate-900 px-6 py-20">
  <div className="mx-auto max-w-6xl text-center">
    <h2 className="text-3xl font-bold md:text-4xl">
      Simple plans for growing operations
    </h2>

    <p className="mt-4 text-slate-300">
      Start with the tools your team needs now, then expand as your operations grow.
    </p>

    <div className="mt-12 grid gap-6 md:grid-cols-3">
      {[
        {
          name: "Starter",
          price: "Beta",
          description: "For small teams moving beyond spreadsheets.",
          features: ["Purchasing", "Inventory", "Vendor bills", "Basic reports"],
        },
        {
          name: "Professional",
          price: "Coming Soon",
          description: "For growing operations that need deeper control.",
          features: ["Everything in Starter", "Payments", "Advanced reports", "Team workflows"],
        },
        {
          name: "Enterprise",
          price: "Custom",
          description: "For businesses needing custom onboarding and support.",
          features: ["Custom setup", "Priority support", "Advanced permissions", "Future AI tools"],
        },
      ].map((plan) => (
        <div
          key={plan.name}
          className="rounded-2xl border border-slate-700 bg-slate-950 p-6 text-left"
        >
          <h3 className="text-xl font-semibold">{plan.name}</h3>
          <p className="mt-2 text-3xl font-bold">{plan.price}</p>
          <p className="mt-3 text-sm text-slate-300">{plan.description}</p>

          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            {plan.features.map((feature) => (
              <li key={feature}>✓ {feature}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
</section>
<section className="bg-slate-950 px-6 py-20">
  <div className="mx-auto max-w-4xl rounded-3xl border border-slate-700 bg-slate-900 p-10 text-center shadow-lg">
    <h2 className="text-3xl font-bold md:text-4xl">
      Ready to bring your operations into one system?
    </h2>

    <p className="mt-4 text-slate-300">
      Start with purchasing, inventory, accounts payable, and reporting — then grow into the full Sephomic platform.
    </p>

    <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
      <Link
        href="/signup"
        className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 shadow-lg hover:bg-slate-100"
      >
        Request Demo
      </Link>

      <Link
        href="/login"
        className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-white hover:bg-slate-800"
      >
        Login
      </Link>
    </div>
  </div>
</section>
<footer className="border-t border-slate-800 bg-slate-950 px-6 py-8">
  <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-slate-400 md:flex-row">
    <p>© 2026 Sephomic. All rights reserved.</p>

    <div className="flex gap-6">
      <Link href="/login" className="hover:text-white">
        Login
      </Link>

      <Link href="/signup" className="hover:text-white">
        Request Demo
      </Link>
    </div>
  </div>
</footer>
    </main>
  )
}