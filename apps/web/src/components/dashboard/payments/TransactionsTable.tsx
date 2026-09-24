"use client"

import * as React from "react"
import {
  Search,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  FileText,
  ExternalLink,
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
    <div className="bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-[rgba(15,15,30,0.06)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#0B0B14] tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-[#6B6B7B] mt-0.5">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B6B7B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, client, method..."
              className="w-full rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] pl-8.5 pr-3 py-1.5 text-xs text-[#0B0B14] placeholder:text-[#6B6B7B] outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Export CSV Button */}
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="h-8.5 px-3 text-xs text-[#0B0B14] border-[rgba(15,15,30,0.12)] hover:bg-[#F4F4F8] flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5 text-blue-600" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 sm:px-5 py-2.5 bg-[#FAFAFC]/60 border-b border-[rgba(15,15,30,0.06)] flex items-center gap-1 overflow-x-auto">
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
            onClick={() => setSelectedType(tab.id as any)}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedType === tab.id
                ? "bg-white text-blue-700 shadow-xs border border-[rgba(15,15,30,0.08)]"
                : "text-[#6B6B7B] hover:text-[#0B0B14] hover:bg-[#F4F4F8]"
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
            <tr className="border-b border-[rgba(15,15,30,0.06)] bg-[#FAFAFC]/80 text-[11px] font-semibold text-[#6B6B7B] uppercase tracking-wider">
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
          <tbody className="divide-y divide-[rgba(15,15,30,0.04)] text-xs">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-[#6B6B7B]">
                  No transactions match your search or filter criteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isPositive = tx.amount > 0
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#FAFAFC] transition-colors group"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 sm:px-5 font-mono text-[11px] font-semibold text-blue-700 whitespace-nowrap">
                      {tx.id}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-[#4B4B5C]">
                      <div>{tx.date}</div>
                      <div className="text-[10px] text-[#6B6B7B]">{tx.timestamp}</div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {renderTypeBadge(tx.type)}
                    </td>

                    {/* Description & Order */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-medium text-[#0B0B14] truncate">
                        {tx.description}
                      </p>
                      {tx.counterpartName && (
                        <p className="text-[11px] text-[#6B6B7B] mt-0.5">
                          Counterpart: <span className="text-[#4B4B5C]">{tx.counterpartName}</span>
                        </p>
                      )}
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-medium text-[#4B4B5C]">
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
                            ? "text-emerald-600"
                            : "text-[#0B0B14]"
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
                        className="p-1 text-[#6B6B7B] hover:text-blue-600 hover:bg-[#F4F4F8] rounded transition-colors inline-flex items-center justify-center"
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
