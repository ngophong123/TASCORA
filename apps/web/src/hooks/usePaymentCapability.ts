"use client"
import { useApiResource } from "./useApiResource"

export const paymentsUnavailableMessage =
  "Payments are temporarily unavailable in this environment."
interface PaymentCapability {
  provider: "stripe" | "disabled"
  status: "configured" | "disabled" | "unavailable"
  available: boolean
}
export function usePaymentCapability() {
  const resource = useApiResource<PaymentCapability>("/api/v1/payments/capabilities")
  return {
    available:
      resource.data?.provider === "stripe" &&
      resource.data.status === "configured" &&
      resource.data.available === true,
    loading: resource.loading,
    message: resource.loading ? "Checking payment availability…" : paymentsUnavailableMessage,
  }
}
