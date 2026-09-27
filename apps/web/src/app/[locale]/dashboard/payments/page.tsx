"use client"

import * as React from "react"
import { ShieldCheck, Download, Plus, Receipt, DollarSign, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboard } from "@/context/DashboardContext"
import { ClientPaymentMethods } from "@/components/dashboard/payments/ClientPaymentMethods"
import { TransactionsTable } from "@/components/dashboard/payments/TransactionsTable"
import {
  CLIENT_PAYMENTS_SUMMARY,
  CLIENT_INVOICES,
  type TransactionRecord,
} from "@/data/dashboard/payments"

export default function PaymentsPage() {
  const { showToast } = useDashboard()
  const [invoices] = React.useState<TransactionRecord[]>(CLIENT_INVOICES)

  const handleExportAnnualTax = () => {
    showToast({
      title: "Annual Tax Statement",
      message: "Generated 2026 Fiscal Spending Summary PDF.",
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
              Payments & Billing
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              100% Escrow Protection
            </span>
          </div>
          <p className="text-sm text-[#4B4B5C] mt-1">
            Manage your project spending, escrow deposits, corporate cards, and tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleExportAnnualTax}
            variant="outline"
            size="sm"
            className="h-9 px-3.5 text-xs text-[#0B0B14] border-[rgba(15,15,30,0.12)] hover:bg-[#F4F4F8] flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5 text-blue-600" />
            <span>Annual Statement</span>
          </Button>

          <Button
            onClick={() =>
              showToast({
                title: "Deposit Escrow",
                message: "Select an active order to fund additional milestones.",
                type: "info",
              })
            }
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-medium text-xs shadow-sm h-9 px-4 rounded-xl flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Fund Escrow</span>
          </Button>
        </div>
      </div>

      {/* 4 Client Spending Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Project Investment */}
        <div className="bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[rgba(15,15,30,0.16)] transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <Receipt className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-[#4B4B5C]">Total Project Spend</span>
            </div>
            <span className="text-[10px] font-medium text-[#6B6B7B] bg-[#F4F4F8] px-2 py-0.5 rounded-full">
              6 Completed
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#0B0B14]">
              $
              {CLIENT_PAYMENTS_SUMMARY.totalSpent.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[11px] text-[#6B6B7B] mt-1">
              Total cleared payments across all milestones.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[rgba(15,15,30,0.06)] flex items-center justify-between text-[11px] text-[#6B6B7B]">
            <span>Average project budget</span>
            <span className="font-medium text-[#0B0B14]">$908.33</span>
          </div>
        </div>

        {/* 2. Escrow in Hold */}
        <div className="bg-white rounded-2xl border border-blue-200/80 p-5 shadow-[0_4px_20px_rgba(59,130,246,0.06)] flex flex-col justify-between hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-[#4B4B5C]">Protected in Escrow</span>
            </div>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Active Lock
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#0B0B14]">
              $
              {CLIENT_PAYMENTS_SUMMARY.fundsInEscrow.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[11px] text-[#6B6B7B] mt-1">
              Held until you approve milestone deliverables.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[rgba(15,15,30,0.06)] flex items-center justify-between text-[11px] text-[#6B6B7B]">
            <span>Active contracts</span>
            <span className="font-medium text-blue-700">3 ongoing</span>
          </div>
        </div>

        {/* 3. Account Credits */}
        <div className="bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[rgba(15,15,30,0.16)] transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                <DollarSign className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-[#4B4B5C]">Account Balance</span>
            </div>
            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Available
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#0B0B14]">
              $
              {CLIENT_PAYMENTS_SUMMARY.availableCredits.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[11px] text-[#6B6B7B] mt-1">
              Refund credits applicable to future milestones.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[rgba(15,15,30,0.06)] flex items-center justify-between text-[11px] text-[#6B6B7B]">
            <span>Auto-apply to orders</span>
            <span className="font-medium text-emerald-700">Enabled</span>
          </div>
        </div>

        {/* 4. Active Contracts */}
        <div className="bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[rgba(15,15,30,0.16)] transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                <Briefcase className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-[#4B4B5C]">Active Orders</span>
            </div>
            <span className="text-[10px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              3 In Progress
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#0B0B14]">
              {CLIENT_PAYMENTS_SUMMARY.activeContractsCount} Contracts
            </h3>
            <p className="text-[11px] text-[#6B6B7B] mt-1">
              Under active production delivery with top talent.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[rgba(15,15,30,0.06)] flex items-center justify-between text-[11px] text-[#6B6B7B]">
            <span>Verified specialists</span>
            <span className="font-medium text-[#0B0B14]">3 specialists</span>
          </div>
        </div>
      </div>

      {/* Saved Payment Methods & Tax Details */}
      <ClientPaymentMethods />

      {/* Client Billing & Invoices Table */}
      <TransactionsTable
        transactions={invoices}
        title="Invoices & Escrow Funding History"
        subtitle="All project payments, escrow fundings, and downloadable tax receipts."
      />
    </div>
  )
}
