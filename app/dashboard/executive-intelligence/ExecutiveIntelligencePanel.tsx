"use client"

import { useMemo, useState } from "react"

type ExecutiveIntelligenceProps = {
  riskCount: number
  growthOpportunityCount: number
  lowStockCount: number
  overdueCustomerInvoiceCount: number
  lateTaskCount: number
  unfulfilledSalesOrderCount: number
  actionableRecommendationCount: number
  executiveRecommendations: string[]
}

type IntelligenceSignal = {
  id: string
  area: string
  label: string
  count: number
  severity: "critical" | "high" | "medium" | "positive" | "normal"
  priorityScore: number
  action: string
}

type QuestionHistoryItem = {
  question: string
  answer: string
}

export default function ExecutiveIntelligencePanel({
  riskCount,
  growthOpportunityCount,
  lowStockCount,
  overdueCustomerInvoiceCount,
  lateTaskCount,
  unfulfilledSalesOrderCount,
  actionableRecommendationCount,
  executiveRecommendations,
}: ExecutiveIntelligenceProps) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [isAnswering, setIsAnswering] = useState(false)
  const [showQuestionPanel, setShowQuestionPanel] = useState(false)
  const [questionHistory, setQuestionHistory] = useState<
    QuestionHistoryItem[]
  >([])

  const intelligenceSignals = useMemo<IntelligenceSignal[]>(() => {
    return [
      {
        id: "vendor-bills",
        area: "Purchasing and Finance",
        label: "Overdue vendor bills",
        count: riskCount,
        severity:
          riskCount >= 5
            ? "critical"
            : riskCount > 0
              ? "high"
              : "normal",
        priorityScore: riskCount * 10,
        action:
          "Review supplier importance, payment timing, available cash, and possible service interruption.",
      },
      {
        id: "customer-invoices",
        area: "Finance",
        label: "Overdue customer invoices",
        count: overdueCustomerInvoiceCount,
        severity:
          overdueCustomerInvoiceCount >= 5
            ? "critical"
            : overdueCustomerInvoiceCount > 0
              ? "high"
              : "normal",
        priorityScore: overdueCustomerInvoiceCount * 12,
        action:
          "Prioritize collection follow-up to protect cash flow and reduce outstanding receivables.",
      },
      {
        id: "low-stock",
        area: "Inventory",
        label: "Low-stock items",
        count: lowStockCount,
        severity:
          lowStockCount >= 10
            ? "critical"
            : lowStockCount > 0
              ? "high"
              : "normal",
        priorityScore: lowStockCount * 9,
        action:
          "Review reorder requirements, supplier lead times, and open customer commitments.",
      },
      {
        id: "late-tasks",
        area: "Operations",
        label: "Late tasks",
        count: lateTaskCount,
        severity:
          lateTaskCount >= 10
            ? "critical"
            : lateTaskCount > 0
              ? "medium"
              : "normal",
        priorityScore: lateTaskCount * 6,
        action:
          "Review task ownership, deadlines, dependencies, and business impact.",
      },
      {
        id: "unfulfilled-orders",
        area: "Sales and Fulfillment",
        label: "Orders awaiting fulfillment",
        count: unfulfilledSalesOrderCount,
        severity:
          unfulfilledSalesOrderCount >= 10
            ? "critical"
            : unfulfilledSalesOrderCount > 0
              ? "high"
              : "normal",
        priorityScore: unfulfilledSalesOrderCount * 11,
        action:
          "Review inventory availability and prioritize confirmed customer orders.",
      },
      {
        id: "growth-opportunities",
        area: "Sales",
        label: "Growth opportunities",
        count: growthOpportunityCount,
        severity:
          growthOpportunityCount > 0
            ? "positive"
            : "normal",
        priorityScore: 0,
        action:
          "Review active opportunities for fulfillment, follow-up, and revenue acceleration.",
      },
    ]
  }, [
    riskCount,
    overdueCustomerInvoiceCount,
    lowStockCount,
    lateTaskCount,
    unfulfilledSalesOrderCount,
    growthOpportunityCount,
  ])

  const activeRiskSignals = useMemo(() => {
    return intelligenceSignals
      .filter(
        (signal) =>
          signal.count > 0 &&
          signal.severity !== "positive" &&
          signal.severity !== "normal"
      )
      .sort(
        (firstSignal, secondSignal) =>
          secondSignal.priorityScore - firstSignal.priorityScore
      )
  }, [intelligenceSignals])

  const highestPrioritySignal =
    activeRiskSignals.length > 0
      ? activeRiskSignals[0]
      : null

  const totalOperationalIssues = activeRiskSignals.reduce(
    (total, signal) => total + signal.count,
    0
  )

  const operationalHealth =
    activeRiskSignals.some(
      (signal) => signal.severity === "critical"
    )
      ? "Critical attention required"
      : activeRiskSignals.length >= 3
        ? "Multiple areas need attention"
        : activeRiskSignals.length > 0
          ? "Attention recommended"
          : "Operations stable"

  function includesAny(
    value: string,
    keywords: string[]
  ) {
    return keywords.some((keyword) =>
      value.includes(keyword)
    )
  }

  function formatSignalSummary(
    signals: IntelligenceSignal[]
  ) {
    if (signals.length === 0) {
      return "No active operational issues are currently detected."
    }

    return signals
      .map(
        (signal) =>
          `${signal.count} ${signal.label.toLowerCase()}`
      )
      .join(", ")
  }

  function createSystemOverviewAnswer() {
    if (activeRiskSignals.length === 0) {
      if (growthOpportunityCount > 0) {
        return `Operations are currently stable. No overdue vendor bills, overdue customer invoices, low-stock items, late tasks, or fulfillment delays are detected. Sephomic has identified ${growthOpportunityCount} active sales opportunit${
          growthOpportunityCount === 1 ? "y" : "ies"
        } for review.`
      }

      return "Operations are currently stable. No immediate purchasing, inventory, sales, finance, fulfillment, or task risks are detected."
    }

    return `Sephomic currently detects ${totalOperationalIssues} operational issue${
      totalOperationalIssues === 1 ? "" : "s"
    } across ${activeRiskSignals.length} business area${
      activeRiskSignals.length === 1 ? "" : "s"
    }: ${formatSignalSummary(
      activeRiskSignals
    )}. The highest-priority area is ${
      highestPrioritySignal?.label.toLowerCase() ??
      "operational review"
    }.`
  }

  function createPriorityAnswer() {
    if (!highestPrioritySignal) {
      if (growthOpportunityCount > 0) {
        return `No immediate operational risk requires attention. The best current priority is to review ${growthOpportunityCount} active sales opportunit${
          growthOpportunityCount === 1 ? "y" : "ies"
        } for fulfillment and revenue growth.`
      }

      return "No immediate operational risks are detected. Continue monitoring purchasing, inventory, sales, finance, fulfillment, and task activity."
    }

    return `Address ${highestPrioritySignal.label.toLowerCase()} first. Sephomic detected ${highestPrioritySignal.count}. ${highestPrioritySignal.action}`
  }

  function createInventoryAnswer() {
    if (lowStockCount === 0) {
      return "No low-stock items are currently detected. Inventory does not require immediate replenishment based on the available organization data."
    }

    return `${lowStockCount} inventory item${
      lowStockCount === 1 ? " is" : "s are"
    } currently below the configured stock threshold. Review reorder quantities, supplier lead times, open purchase orders, and customer commitments before purchasing additional inventory.`
  }

  function createSalesAnswer() {
    if (
      unfulfilledSalesOrderCount > 0 &&
      growthOpportunityCount > 0
    ) {
      return `${unfulfilledSalesOrderCount} sales order${
        unfulfilledSalesOrderCount === 1 ? " is" : "s are"
      } awaiting fulfillment, while ${growthOpportunityCount} active sales opportunit${
        growthOpportunityCount === 1 ? "y is" : "ies are"
      } available. Prioritize existing customer commitments before expanding new sales activity.`
    }

    if (unfulfilledSalesOrderCount > 0) {
      return `${unfulfilledSalesOrderCount} sales order${
        unfulfilledSalesOrderCount === 1 ? " is" : "s are"
      } awaiting fulfillment. Review inventory availability, order status, and delivery commitments.`
    }

    if (growthOpportunityCount > 0) {
      return `${growthOpportunityCount} active sales opportunit${
        growthOpportunityCount === 1 ? "y is" : "ies are"
      } currently identified. Review confirmed and shipped orders for opportunities to accelerate fulfillment and revenue recognition.`
    }

    return "No active sales opportunities or fulfillment issues are currently detected."
  }

  function createFinanceAnswer() {
    if (
      overdueCustomerInvoiceCount > 0 &&
      riskCount > 0
    ) {
      return `Finance requires attention on both receivables and payables. Sephomic detects ${overdueCustomerInvoiceCount} overdue customer invoice${
        overdueCustomerInvoiceCount === 1 ? "" : "s"
      } and ${riskCount} overdue vendor bill${
        riskCount === 1 ? "" : "s"
      }. Prioritize customer collections, then review supplier payment timing against available cash.`
    }

    if (overdueCustomerInvoiceCount > 0) {
      return `${overdueCustomerInvoiceCount} customer invoice${
        overdueCustomerInvoiceCount === 1 ? " is" : "s are"
      } overdue. Prioritize collection follow-up to reduce cash-flow exposure.`
    }

    if (riskCount > 0) {
      return `${riskCount} vendor bill${
        riskCount === 1 ? " is" : "s are"
      } overdue. Review payment timing, supplier importance, available cash, and possible operational impact.`
    }

    return "No overdue customer invoices or vendor bills are currently detected. The available finance signals do not show an immediate payment or collection risk."
  }

  function createTaskAnswer() {
    if (lateTaskCount === 0) {
      return "No late tasks are currently detected. Operational deadlines appear current based on the available task data."
    }

    return `${lateTaskCount} task${
      lateTaskCount === 1 ? " is" : "s are"
    } overdue. Review ownership, dependencies, due dates, and business impact before reprioritizing the work.`
  }

  function createPurchasingAnswer() {
    if (riskCount > 0 && lowStockCount > 0) {
      return `Purchasing requires a balanced review. Sephomic detects ${riskCount} overdue vendor bill${
        riskCount === 1 ? "" : "s"
      } and ${lowStockCount} low-stock item${
        lowStockCount === 1 ? "" : "s"
      }. Confirm supplier availability and cash position before creating additional purchase commitments.`
    }

    if (lowStockCount > 0) {
      return `${lowStockCount} low-stock item${
        lowStockCount === 1 ? " requires" : "s require"
      } purchasing review. Check open purchase orders, supplier lead times, and customer demand before reordering.`
    }

    if (riskCount > 0) {
      return `${riskCount} overdue vendor bill${
        riskCount === 1 ? " may" : "s may"
      } affect supplier relationships or future purchasing. Review supplier priority and payment timing.`
    }

    return "No immediate purchasing risk is detected. There are no low-stock items or overdue vendor bills requiring attention."
  }

  function createRecommendationAnswer() {
    if (executiveRecommendations.length === 0) {
      return createSystemOverviewAnswer()
    }

    const recommendations = executiveRecommendations
      .slice(0, 3)
      .map(
        (recommendation, index) =>
          `${index + 1}. ${recommendation}`
      )
      .join(" ")

    return `The leading recommended actions are: ${recommendations}`
  }

  function generateIntelligenceAnswer(
    normalizedQuestion: string
  ) {
    const asksOverview = includesAny(
      normalizedQuestion,
      [
        "overview",
        "summary",
        "status",
        "health",
        "how are we doing",
        "how is business",
        "entire system",
        "everything",
        "overall",
      ]
    )

    const asksPriority = includesAny(
      normalizedQuestion,
      [
        "priority",
        "first",
        "most important",
        "urgent",
        "attention",
        "biggest risk",
        "main risk",
        "what should i do",
        "what should we do",
        "focus",
      ]
    )

    const asksInventory = includesAny(
      normalizedQuestion,
      [
        "inventory",
        "stock",
        "reorder",
        "warehouse",
        "quantity",
        "items",
      ]
    )

    const asksSales = includesAny(
      normalizedQuestion,
      [
        "sales",
        "revenue",
        "order",
        "orders",
        "fulfillment",
        "customer demand",
        "opportunity",
        "opportunities",
      ]
    )

    const asksFinance = includesAny(
      normalizedQuestion,
      [
        "finance",
        "cash",
        "cash flow",
        "invoice",
        "invoices",
        "bill",
        "bills",
        "payment",
        "payments",
        "receivable",
        "payable",
      ]
    )

    const asksTasks = includesAny(
      normalizedQuestion,
      [
        "task",
        "tasks",
        "late",
        "deadline",
        "deadlines",
        "workload",
      ]
    )

    const asksPurchasing = includesAny(
      normalizedQuestion,
      [
        "purchase",
        "purchasing",
        "supplier",
        "suppliers",
        "vendor",
        "vendors",
        "procurement",
      ]
    )

    const asksRecommendations = includesAny(
      normalizedQuestion,
      [
        "recommend",
        "recommendation",
        "actions",
        "next steps",
        "improve",
      ]
    )

    if (asksOverview) {
      return createSystemOverviewAnswer()
    }

    if (asksPriority) {
      return createPriorityAnswer()
    }

    if (asksPurchasing) {
      return createPurchasingAnswer()
    }

    if (asksInventory) {
      return createInventoryAnswer()
    }

    if (asksSales) {
      return createSalesAnswer()
    }

    if (asksFinance) {
      return createFinanceAnswer()
    }

    if (asksTasks) {
      return createTaskAnswer()
    }

    if (asksRecommendations) {
      return createRecommendationAnswer()
    }

    return `${createSystemOverviewAnswer()} ${createPriorityAnswer()}`
  }

  function handleQuestionSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    const trimmedQuestion = question.trim()

    if (!trimmedQuestion) {
      setAnswer(
        "Enter a business question before submitting."
      )
      return
    }

    setIsAnswering(true)

    const generatedAnswer =
      generateIntelligenceAnswer(
        trimmedQuestion.toLowerCase()
      )

    setAnswer(generatedAnswer)

    setQuestionHistory((currentHistory) => [
      {
        question: trimmedQuestion,
        answer: generatedAnswer,
      },
      ...currentHistory,
    ].slice(0, 5))

    setIsAnswering(false)
  }

  function askSuggestedQuestion(
    suggestedQuestion: string
  ) {
    setQuestion(suggestedQuestion)
    setAnswer("")
  }

  function clearQuestionHistory() {
    setQuestionHistory([])
    setAnswer("")
    setQuestion("")
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-600">
          Executive Intelligence
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Sephomic Executive Intelligence
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Executive Intelligence analyzes purchasing,
          inventory, sales, finance, fulfillment, and
          operational activity to identify risks,
          bottlenecks, priorities, and growth opportunities.
        </p>
      </div>

      <div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Today&apos;s Executive Summary
          </h3>

          <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {operationalHealth}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Overdue vendor bills
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {riskCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Growth opportunities
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {growthOpportunityCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Actionable recommendations
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {actionableRecommendationCount}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Operational Signals
        </h3>

        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">
              Low-stock items
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {lowStockCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">
              Overdue invoices
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {overdueCustomerInvoiceCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">
              Late tasks
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {lateTaskCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">
              Orders awaiting fulfillment
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {unfulfilledSalesOrderCount}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="font-semibold text-slate-900">
          Recommended Actions
        </h3>

        <div className="mt-3 space-y-3">
          {executiveRecommendations.map(
            (recommendation, index) => (
              <div
                key={`${recommendation}-${index}`}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <p className="text-sm font-medium text-slate-800">
                  {recommendation}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">
              Ask Executive Intelligence
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              Ask questions about risks, cash flow,
              purchasing, inventory, sales, fulfillment,
              deadlines, and operational priorities.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowQuestionPanel(
                (currentValue) => !currentValue
              )
            }
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {showQuestionPanel
              ? "Close Questions"
              : "Ask a Question"}
          </button>
        </div>

        {showQuestionPanel && (
          <form
            onSubmit={handleQuestionSubmit}
            className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Suggested questions
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  "What should I address first?",
                  "Give me an overall business summary.",
                  "Do we have any cash-flow risks?",
                  "What inventory needs attention?",
                  "Are any orders awaiting fulfillment?",
                ].map((suggestedQuestion) => (
                  <button
                    key={suggestedQuestion}
                    type="button"
                    onClick={() =>
                      askSuggestedQuestion(
                        suggestedQuestion
                      )
                    }
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-500"
                  >
                    {suggestedQuestion}
                  </button>
                ))}
              </div>
            </div>

            <label
              htmlFor="executive-intelligence-question"
              className="mt-4 block text-sm font-medium text-slate-700"
            >
              Business question
            </label>

            <textarea
              id="executive-intelligence-question"
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              placeholder="Example: What should I address first today?"
              rows={4}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
            />

            <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-slate-500">
                Answers are generated from the
                organization-scoped operational signals
                currently available to Executive Intelligence.
              </p>

              <button
                type="submit"
                disabled={
                  isAnswering || !question.trim()
                }
                className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                {isAnswering
                  ? "Analyzing..."
                  : "Ask Intelligence"}
              </button>
            </div>

            {answer && (
              <div
                aria-live="polite"
                className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Executive Intelligence Response
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-800">
                  {answer}
                </p>
              </div>
            )}

            {questionHistory.length > 0 && (
              <div className="mt-5 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    Recent Questions
                  </p>

                  <button
                    type="button"
                    onClick={clearQuestionHistory}
                    className="text-xs font-medium text-slate-500 hover:text-slate-900"
                  >
                    Clear
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {questionHistory.map(
                    (historyItem, index) => (
                      <div
                        key={`${historyItem.question}-${index}`}
                        className="rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <p className="text-sm font-semibold text-slate-800">
                          {historyItem.question}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {historyItem.answer}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </form>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="font-medium text-slate-900">
          Organization intelligence active
        </p>

        <p className="mt-1 text-sm text-slate-600">
          Recommendations and answers are generated from
          organization-scoped purchasing, inventory, sales,
          finance, fulfillment, and task activity.
        </p>
      </div>
    </section>
  )
}