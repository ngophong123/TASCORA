"use client"

import * as React from "react"
import {
  Search,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  ShieldCheck,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { type TransactionRecord, type TransactionType } from "@/data/dashboard/payments"
import { useDashboard } from "@/context/DashboardContext"

interface TransactionsTableProps {
  transactions: TransactionRecord[]
  title?: string
  subtitle?: string
}

export function TransactionsTable({
  transactions,
  title = "Transaction & Payout History",
  subtitle = "Audited record of all cleared project earnings, escrow locks, and bank transfers.",
}: TransactionsTableProps) {
  const { showToast } = useDashboard()
  const [search, setSearch] = React.useState("")
  const [selectedType, setSelectedType] = React.useState<"ALL" | TransactionType>("ALL")

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ["ID", "Date", "Type", "Description", "Method", "Status", "Amount"]
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.method}"`,
      t.status,
      t.amount,
    ])
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `tascora-statement-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast({
      title: "Statement Exported (CSV)",
      message: "Your audited transaction ledger has been downloaded successfully.",
      type: "success",
    })
  }

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.orderId && t.orderId.toLowerCase().includes(search.toLowerCase())) ||
      (t.counterpartName && t.counterpartName.toLowerCase().includes(search.toLowerCase())) ||
      t.method.toLowerCase().includes(search.toLowerCase())

    if (selectedType === "ALL") return matchesSearch
    return matchesSearch && t.type === selectedType
  })

  const renderTypeBadge = (type: TransactionType) => {
    switch (type) {
      case "ORDER_PAYMENT":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ArrowDownLeft className="h-3 w-3 text-emerald-600" />
            Order Payment
          </span>
        )
      case "WITHDRAWAL":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <ArrowUpRight className="h-3 w-3 text-blue-600" />
            Withdrawal
          </span>
        )
      case "ESCROW_HELD":
      case "ESCROW_DEPOSIT":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="h-3 w-3 text-blue-600" />
            Escrow Held
          </span>
        )
      case "REFUND":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <RotateCcw className="h-3 w-3 text-rose-600" />
            Refund
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
            Fee
          </span>
        )
    }
  }

  return (
    <div className="stripe-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, client, method..."
              className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 pl-8.5 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {/* Export CSV Button */}
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="h-8.5 px-3 text-xs text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-primary" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 sm:px-5 py-2.5 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 flex items-center gap-1 overflow-x-auto">
        {(
          [
            { id: "ALL", label: "All Transactions" },
            { id: "ORDER_PAYMENT", label: "Order Payments" },
            { id: "WITHDRAWAL", label: "Withdrawals" },
            { id: "ESCROW_HELD", label: "Escrow Held" },
            { id: "REFUND", label: "Refunds" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedType(tab.id)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedType === tab.id
                ? "bg-white dark:bg-slate-900 text-primary shadow-xs border border-slate-200/80 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-5">Transaction ID</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-4">Description & Project</th>
              <th className="py-3 px-3">Method / Destination</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 sm:px-5 text-right">Net Amount</th>
              <th className="py-3 px-3 text-center">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40 text-xs">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center text-xs text-slate-500 dark:text-slate-400"
                >
                  No transactions match your search or filter criteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isPositive = tx.amount > 0
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 sm:px-5 font-mono text-[11px] font-semibold text-primary whitespace-nowrap">
                      {tx.id}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      <div>{tx.date}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {tx.timestamp}
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">{renderTypeBadge(tx.type)}</td>

                    {/* Description & Order */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {tx.description}
                      </p>
                      {tx.counterpartName && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Counterpart:{" "}
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {tx.counterpartName}
                          </span>
                        </p>
                      )}
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-600 dark:text-slate-300">
                      {tx.method}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <StatusBadge status={tx.status.toLowerCase()} size="sm" />
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
                      <span
                        className={`font-mono text-xs font-bold ${
                          isPositive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {isPositive ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </td>

                    {/* Receipt download */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() =>
                          showToast({
                            title: "Invoice PDF",
                            message: `Generated tax receipt for ${tx.id}.`,
                            type: "info",
                          })
                        }
                        title="Download Tax Receipt"
                        className="p-1 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors inline-flex items-center justify-center cursor-pointer"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
