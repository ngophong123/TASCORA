"use client"

import * as React from "react"
import { Wallet, Clock, ArrowUpRight, ShieldCheck, CheckCircle2, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BalanceCardsProps {
  availableBalance: number
  pendingClearance: number
  withdrawnTotal: number
  inEscrowActive: number
  onOpenWithdraw: () => void
}

export function BalanceCards({
  availableBalance,
  pendingClearance,
  withdrawnTotal,
  inEscrowActive,
  onOpenWithdraw,
}: BalanceCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Available For Withdrawal (Hero Card with Blue Gradient Accent) */}
      <div className="relative bg-white rounded-2xl border border-blue-200/80 p-5 shadow-[0_4px_20px_rgba(37,99,235,0.06)] flex flex-col justify-between overflow-hidden group hover:border-blue-300 transition-all">
        {/* Subtle background glow */}
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-blue-100/50 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <Wallet className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-[#4B4B5C]">Available for Payout</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Ready
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#0B0B14]">
              $
              {availableBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[11px] text-[#6B6B7B] mt-1">
              Cleared funds ready for instant transfer.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-[rgba(15,15,30,0.06)]">
          <Button
            onClick={onOpenWithdraw}
            size="sm"
            className="w-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white shadow-sm text-xs font-semibold h-8.5 rounded-xl flex items-center justify-center gap-1.5"
          >
            <span>Withdraw Funds</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 2. Pending Clearance */}
      <div className="bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[rgba(15,15,30,0.16)] transition-all">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                <Clock className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-[#4B4B5C]">Pending Clearance</span>
            </div>
            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              ~48 hrs
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#0B0B14]">
              $
              {pendingClearance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[11px] text-[#6B6B7B] mt-1">
              Under standard escrow hold after milestone approval.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-[rgba(15,15,30,0.06)] flex items-center justify-between text-[11px] text-[#6B6B7B]">
          <span>Next release</span>
          <span className="font-medium text-[#0B0B14]">Tomorrow, 14:00</span>
        </div>
      </div>

      {/* 3. Withdrawn to Date */}
      <div className="bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[rgba(15,15,30,0.16)] transition-all">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-[#4B4B5C]">Withdrawn to Date</span>
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700">
              <TrendingUp className="h-3 w-3" />
              +24% YoY
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#0B0B14]">
              $
              {withdrawnTotal.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[11px] text-[#6B6B7B] mt-1">
              Lifetime total paid out to verified bank accounts.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-[rgba(15,15,30,0.06)] flex items-center justify-between text-[11px] text-[#6B6B7B]">
          <span>Completed payouts</span>
          <span className="font-medium text-[#0B0B14]">14 transfers</span>
        </div>
      </div>

      {/* 4. Active In Escrow */}
      <div className="bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[rgba(15,15,30,0.16)] transition-all">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-[#4B4B5C]">Locked in Escrow</span>
            </div>
            <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              4 Orders
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#0B0B14]">
              $
              {inEscrowActive.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[11px] text-[#6B6B7B] mt-1">
              Protected client funds for active milestones.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-[rgba(15,15,30,0.06)] flex items-center justify-between text-[11px] text-[#6B6B7B]">
          <span>Security guarantee</span>
          <span className="font-medium text-blue-700">100% Guaranteed</span>
        </div>
      </div>
    </div>
  )
}
