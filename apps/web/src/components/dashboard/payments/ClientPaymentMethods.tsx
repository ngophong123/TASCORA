"use client"

import * as React from "react"
import { CreditCard, Plus, Trash2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CLIENT_SAVED_PAYMENT_METHODS, type PaymentMethodItem } from "@/data/dashboard/payments"
import { useDashboard } from "@/context/DashboardContext"

export function ClientPaymentMethods() {
  const { showToast } = useDashboard()
  const [methods, setMethods] = React.useState<PaymentMethodItem[]>(CLIENT_SAVED_PAYMENT_METHODS)

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
      message: "Secure Payment Modal initialized.",
      type: "info",
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Saved Methods */}
      <div className="stripe-card lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Saved Payment Methods
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Credit cards and digital wallets used for funding project escrow.
            </p>
          </div>

          <Button
            onClick={handleAddCard}
            size="sm"
            className="h-8.5 px-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 hover:from-indigo-500 hover:via-violet-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer active:scale-[0.98]"
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
                  ? "border-primary/40 bg-primary/5 dark:bg-primary/10 shadow-xs"
                  : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {method.brand || "Card"} ending in {method.last4 || "••••"}
                    </span>
                    {method.isDefault && (
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Expires {method.expDate || "12/28"} • 256-bit Encrypted Escrow Vault
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!method.isDefault && (
                  <Button
                    onClick={() => handleSetDefault(method.id)}
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-[11px] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
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
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
      <div className="stripe-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-200/60 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Billing & Tax Details
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Applied automatically to all verified invoice PDFs.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Legal Entity Name
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              Fintech Corp International Ltd.
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Billing Address
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              452 Innovation Blvd, Suite 800, San Francisco, CA 94107
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              VAT / Tax Identification
            </span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">
              US-EIN 94-8219041
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Tax exemption certificate validated</span>
          </div>
        </div>
      </div>
    </div>
  )
}
