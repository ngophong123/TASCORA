"use client"

import * as React from "react"
import {
  Wallet,
  ArrowUpRight,
  Download,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboard } from "@/context/DashboardContext"
import { BalanceCards } from "@/components/dashboard/payments/BalanceCards"
import { RevenueBarChart } from "@/components/dashboard/payments/RevenueBarChart"
import { TransactionsTable } from "@/components/dashboard/payments/TransactionsTable"
import { WithdrawDialog } from "@/components/dashboard/payments/WithdrawDialog"
import {
  FREELANCER_EARNINGS_SUMMARY,
  FREELANCER_REVENUE_CHART_DATA,
  FREELANCER_TRANSACTIONS,
  type TransactionRecord,
} from "@/data/dashboard/payments"

export default function EarningsPage() {
  const { showToast } = useDashboard()

  const [availableBalance, setAvailableBalance] = React.useState(
    FREELANCER_EARNINGS_SUMMARY.availableBalance
  )
  const [withdrawnTotal, setWithdrawnTotal] = React.useState(
    FREELANCER_EARNINGS_SUMMARY.withdrawnTotal
  )
  const [transactions, setTransactions] = React.useState<TransactionRecord[]>(
    FREELANCER_TRANSACTIONS
  )
  const [isWithdrawOpen, setIsWithdrawOpen] = React.useState(false)

  const handleConfirmWithdraw = (amount: number, destination: string) => {
    // Deduct balance and increment withdrawn
    setAvailableBalance((prev) => Math.max(0, prev - amount))
    setWithdrawnTotal((prev) => prev + amount)

    // Add new transaction to list
    const newTx: TransactionRecord = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "WITHDRAWAL",
      description: `Direct Transfer Payout to ${destination}`,
      method: destination,
      status: "COMPLETED",
      amount: -amount,
      fee: 0,
      netAmount: -amount,
    }

    setTransactions((prev) => [newTx, ...prev])

    showToast({
      title: "Withdrawal Confirmed",
      message: `$${amount.toFixed(2)} transferred to ${destination}.`,
      type: "success",
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[#0B0B14]">
              Earnings & Payouts
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Tascora Verified Payouts
            </span>
          </div>
          <p className="text-sm text-[#4B4B5C] mt-1">
            Real-time accounting of cleared contract revenues, escrow holds, and direct bank transfers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsWithdrawOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-medium text-xs shadow-sm h-9 px-4 rounded-xl flex items-center gap-1.5"
          >
            <Wallet className="h-4 w-4" />
            <span>Withdraw Funds</span>
          </Button>
        </div>
      </div>

      {/* 4 Balance Cards */}
      <BalanceCards
        availableBalance={availableBalance}
        pendingClearance={FREELANCER_EARNINGS_SUMMARY.pendingClearance}
        withdrawnTotal={withdrawnTotal}
        inEscrowActive={FREELANCER_EARNINGS_SUMMARY.inEscrowActive}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
      />

      {/* Revenue Bar Chart */}
      <RevenueBarChart data={FREELANCER_REVENUE_CHART_DATA} />

      {/* Transactions & Payouts History Table */}
      <TransactionsTable transactions={transactions} />

      {/* Payout Withdrawal Modal Dialog */}
      <WithdrawDialog
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        availableBalance={availableBalance}
        onConfirmWithdraw={handleConfirmWithdraw}
      />
    </div>
  )
}
