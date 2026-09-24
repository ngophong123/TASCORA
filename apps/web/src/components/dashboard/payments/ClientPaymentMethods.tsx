"use client"

import * as React from "react"
import {
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Building,
  FileCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CLIENT_SAVED_PAYMENT_METHODS,
  type PaymentMethodItem,
} from "@/data/dashboard/payments"
import { useDashboard } from "@/context/DashboardContext"

export function ClientPaymentMethods() {
  const { showToast } = useDashboard()
  const [methods, setMethods] = React.useState<PaymentMethodItem[]>(
    CLIENT_SAVED_PAYMENT_METHODS
  )

  const handleSetDefault = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    )
    showToast({
      title: "Default Method Updated",
      message: "Primary payment method for escrow funding updated.",
      type: "success",
    })
  }

  const handleAddCard = () => {
    showToast({
      title: "Add Payment Method",
      message: "Stripe Elements secure payment modal initialized.",
      type: "info",
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Saved Methods */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(15,15,30,0.06)]">
          <div>
            <h3 className="text-base font-semibold text-[#0B0B14]">
              Saved Payment Methods
            </h3>
            <p className="text-xs text-[#6B6B7B]">
              Credit cards and digital wallets used for funding project escrow.
            </p>
          </div>

          <Button
            onClick={handleAddCard}
            size="sm"
            className="h-8.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Card</span>
          </Button>
        </div>

        <div className="space-y-3">
          {methods.map((method) => (
            <div
              key={method.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                method.isDefault
                  ? "border-blue-300 bg-blue-50/40 shadow-xs"
                  : "border-[rgba(15,15,30,0.08)] bg-white hover:bg-[#FAFAFC]"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#FAFAFC] border border-[rgba(15,15,30,0.08)] text-[#0B0B14]">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#0B0B14]">
                      {method.brand || "Card"} ending in {method.last4 || "••••"}
                    </span>
                    {method.isDefault && (
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6B6B7B] mt-0.5">
                    Expires {method.expDate || "12/28"} • Encrypted via Stripe Vault
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!method.isDefault && (
                  <Button
                    onClick={() => handleSetDefault(method.id)}
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-[11px] text-[#4B4B5C] hover:text-[#0B0B14] border-[rgba(15,15,30,0.12)] hover:bg-white"
                  >
                    Set as Default
                  </Button>
                )}

                <button
                  onClick={() =>
                    showToast({
                      title: "Card Retained",
                      message: "Cards attached to active escrow contracts cannot be deleted.",
                      type: "warning",
                    })
                  }
                  className="p-1.5 text-[#6B6B7B] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove card"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Col: Billing Entity & Tax Info */}
      <div className="bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        <div className="pb-3 border-b border-[rgba(15,15,30,0.06)]">
          <h3 className="text-base font-semibold text-[#0B0B14]">
            Billing & Tax Details
          </h3>
          <p className="text-xs text-[#6B6B7B]">
            Applied automatically to all verified invoice PDFs.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-[11px] text-[#6B6B7B] block">Legal Entity Name</span>
            <span className="font-medium text-[#0B0B14]">Fintech Corp International Ltd.</span>
          </div>

          <div>
            <span className="text-[11px] text-[#6B6B7B] block">Billing Address</span>
            <span className="font-medium text-[#0B0B14]">
              452 Innovation Blvd, Suite 800, San Francisco, CA 94107
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#6B6B7B] block">VAT / Tax Identification</span>
            <span className="font-mono font-medium text-[#0B0B14]">US-EIN 94-8219041</span>
          </div>

          <div className="pt-2 border-t border-[rgba(15,15,30,0.06)] flex items-center gap-1.5 text-[11px] text-emerald-700">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Tax exemption certificate validated</span>
          </div>
        </div>
      </div>
    </div>
  )
}
