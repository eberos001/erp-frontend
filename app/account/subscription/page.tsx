import { Suspense } from "react"
import SubscriptionClient from "./SubscriptionClient"

export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 p-8 text-white">
          Loading subscription...
        </div>
      }
    >
      <SubscriptionClient />
    </Suspense>
  )
}
