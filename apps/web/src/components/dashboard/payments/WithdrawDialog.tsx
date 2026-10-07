"use client"

import * as React from "react"
import { X, CreditCard, Building2, ArrowRight, Zap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WithdrawDialogProps {
  isOpen: boolean
  onClose: () => void
  availableBalance: number
  onConfirmWithdraw: (amount: number, destination: string) => void
}

export function WithdrawDialog({
  isOpen,
  onClose,
  availableBalance,
  onConfirmWithdraw,
}: WithdrawDialogProps) {
  const [amount, setAmount] = React.useState<string>("")
  const [destination, setDestination] = React.useState<"stripe" | "bank" | "paypal">("stripe")
  const [isProcessing, setIsProcessing] = React.useState(false)

  // Reset or preset state when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setAmount(availableBalance.toFixed(2))
      setIsProcessing(false)
    }
  }, [isOpen, availableBalance])

  if (!isOpen) return null

  const parsedAmount = parseFloat(amount) || 0
  const isInvalid = parsedAmount <= 0 || parsedAmount > availableBalance

  const fee = destination === "paypal" ? parsedAmount * 0.01 : 0
  const netTransfer = Math.max(0, parsedAmount - fee)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isInvalid || isProcessing) return

    setIsProcessing(true)
    setTimeout(() => {
      const destName =
        destination === "stripe"
          ? "Stripe Express •••• 4242"
          : destination === "bank"
            ? "Bank of America ACH •••• 9104"
            : "PayPal (alexandre.dev@example.com)"

      onConfirmWithdraw(parsedAmount, destName)
      setIsProcessing(false)
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-[rgba(15,15,30,0.12)] p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(15,15,30,0.06)]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-[#0A0A23]">Withdraw Available Funds</h2>
              <p className="text-xs text-[#6B6B7B]">
                Transfer cleared earnings directly to your verified payout destination.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#6B6B7B] hover:text-[#0A0A23] hover:bg-[#F4F4F8] rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Destination Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#0A0A23]">Select Payout Method</label>

            <div className="space-y-2">
              {/* Stripe Express */}
              <button
                type="button"
                onClick={() => setDestination("stripe")}
                className={`w-full text-left flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  destination === "stripe"
                    ? "border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600"
                    : "border-[rgba(15,15,30,0.1)] hover:bg-[#FAFAFC]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-white border border-[rgba(15,15,30,0.08)] text-blue-700">
                    <CreditCard className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-[#0A0A23]">
                      Stripe Express Debit (•••• 4242)
                    </div>
                    <div className="text-[11px] text-[#6B6B7B]">
                      Instant payout • No platform transfer fee
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Instant
                </span>
              </button>

              {/* Direct Bank ACH */}
              <button
                type="button"
                onClick={() => setDestination("bank")}
                className={`w-full text-left flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  destination === "bank"
                    ? "border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600"
                    : "border-[rgba(15,15,30,0.1)] hover:bg-[#FAFAFC]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-white border border-[rgba(15,15,30,0.08)] text-[#4B4B5C]">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-[#0A0A23]">
                      Bank of America ACH (•••• 9104)
                    </div>
                    <div className="text-[11px] text-[#6B6B7B]">
                      Standard ACH transfer • 1-2 business days
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-[#6B6B7B] bg-[#F4F4F8] px-2 py-0.5 rounded-full">
                  1-2 Days
                </span>
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#0A0A23]">Withdrawal Amount</span>
              <span className="text-[#6B6B7B]">
                Available:{" "}
                <strong className="text-[#0A0A23] font-mono">${availableBalance.toFixed(2)}</strong>
              </span>
            </div>

            <div className="relative rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] focus-within:bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6B6B7B]">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent pl-8 pr-16 py-2.5 text-sm font-mono font-bold text-[#0A0A23] placeholder:text-[#6B6B7B] outline-none"
              />
              <button
                type="button"
                onClick={() => setAmount(availableBalance.toFixed(2))}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                Max
              </button>
            </div>

            {isInvalid && parsedAmount > availableBalance && (
              <p className="text-[11px] text-rose-600">
                Amount exceeds your cleared available balance of ${availableBalance.toFixed(2)}.
              </p>
            )}
          </div>

          {/* Breakdown Box */}
          <div className="bg-[#FAFAFC] rounded-xl p-3.5 border border-[rgba(15,15,30,0.06)] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#6B6B7B]">
              <span>Gross Withdrawal</span>
              <span className="font-mono text-[#0A0A23]">
                ${parsedAmount > 0 ? parsedAmount.toFixed(2) : "0.00"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#6B6B7B]">
              <span>Processing Fee</span>
              <span className="font-mono text-emerald-600 font-medium">
                {fee === 0 ? "Free ($0.00)" : `-$${fee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[rgba(15,15,30,0.06)] font-semibold text-[#0A0A23]">
              <span>Net Transfer Amount</span>
              <span className="font-mono text-sm font-bold text-blue-700">
                ${netTransfer.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs text-[#4B4B5C] border-[rgba(15,15,30,0.12)] hover:bg-[#F4F4F8]"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isInvalid || isProcessing}
              className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-medium text-xs shadow-sm px-5 h-9 flex items-center gap-1.5 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitting Payout...</span>
                </>
              ) : (
                <>
                  <span>Confirm Payout Transfer</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
