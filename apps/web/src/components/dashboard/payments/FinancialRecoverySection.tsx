"use client"

import * as React from "react"
import {
  FileText,
  History,
  Lock,
  Paperclip,
  RefreshCw,
  Search,
  ShieldAlert,
  UserCheck,
} from "lucide-react"
import { requestData, jsonRequest } from "@/lib/marketplace"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type RecoveryStatus = "OPEN" | "INVESTIGATING" | "AWAITING_EVIDENCE" | "PENDING_VERIFICATION"
type RecoveryStatusFilter = "ALL" | RecoveryStatus
type RecoverySortField = "lastActivityAt" | "createdAt" | "recoveryAmount"
type RecoveryEventActionType = "NOTE_ADDED" | "EVIDENCE_ATTACHED" | "EVIDENCE_REQUESTED"

interface RecoveryBalances {
  pending: string
  available: string
  reserved: string
  paid: string
  fee: string
}

interface RecoveryQueueItem {
  id: string
  disputeId: string
  orderId: string
  sellerProfileId: string
  sellerRef: string
  status: RecoveryStatus
  recoveryAmount: string
  currency: string
  providerDisputeId: string | null
  providerStatus: string | null
  disputeStatus: string
  recoveryRequired: boolean
  orderStatus: string
  orderAmount: string
  assignedAdmin: { id: string; role: string } | null
  balances: RecoveryBalances
  payout: { id: string; status: string; amount: string; updatedAt: string } | null
  lastActivityAt: string
  createdAt: string
  updatedAt: string
}

interface RecoveryListResponse {
  overview: {
    totalCases: number
    totalRecoveryAmount: string
    currency: string
    countsByStatus: Record<RecoveryStatus, number>
    unassignedCount: number
    activeFinancialHoldCount: number
    externalPayoutsDisabled: boolean
  }
  items: RecoveryQueueItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  availableAdmins: { id: string; role: string }[]
}

interface RecoveryCaseDetailResponse {
  recoveryCase: {
    id: string
    disputeId: string
    orderId: string
    sellerProfileId: string
    sellerRef: string
    status: RecoveryStatus
    allowedNextStatuses: RecoveryStatus[]
    recoveryAmount: string
    currency: string
    assignedAdmin: { id: string; role: string } | null
    financialHoldActive: boolean
    externalPayoutsDisabled: boolean
    lastActivityAt: string
    createdAt: string
    updatedAt: string
  }
  dispute: {
    id: string
    status: string
    category: string
    description: string
    providerDisputeId: string | null
    providerStatus: string | null
    lastProviderEventId: string | null
    lastProviderEventType: string | null
    lastProviderEventCreated: number | null
    recoveryRequired: boolean
    resolutionReason: string | null
  }
  seller: {
    id: string
    displayName: string
    status: string
    verificationStatus: string
  }
  order: {
    id: string
    status: string
    amount: string
    currency: string
    platformFeeBps: number | null
    createdAt: string
    completedAt: string | null
  }
  balances: RecoveryBalances
  payouts: {
    id: string
    amount: string
    status: string
    attempt: number
    failureReason: string | null
    createdAt: string
    updatedAt: string
  }[]
  transactions: {
    id: string
    stripePaymentId: string | null
    amount: string
    refundedAmount: string
    currency: string
    status: string
    createdAt: string
  }[]
  refunds: {
    id: string
    amount: string
    status: string
    reason: string
    stripeRefundId: string | null
    createdAt: string
  }[]
  ledgerHistory: {
    id: string
    type: string
    actorId: string | null
    providerId: string | null
    reason: string | null
    amount: string
    pendingDelta: string
    availableDelta: string
    reservedDelta: string
    paidDelta: string
    feeDelta: string
    createdAt: string
  }[]
  timeline: {
    id: string
    type: string
    previousStatus: string | null
    nextStatus: string | null
    assignedAdminId: string | null
    note: string | null
    evidenceRef: string | null
    createdAt: string
    actor: { id: string; role: string } | null
  }[]
}

const STATUS_LABELS: Record<RecoveryStatus, string> = {
  OPEN: "Open",
  INVESTIGATING: "Investigating",
  AWAITING_EVIDENCE: "Awaiting Evidence",
  PENDING_VERIFICATION: "Pending Verification",
}

function statusBadgeVariant(status: RecoveryStatus): "warning" | "default" | "secondary" {
  if (status === "OPEN" || status === "AWAITING_EVIDENCE") return "warning"
  if (status === "INVESTIGATING") return "default"
  return "secondary"
}

function formatDateTime(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString()
}

export function FinancialRecoverySection() {
  const [statusFilter, setStatusFilter] = React.useState<RecoveryStatusFilter>("ALL")
  const [searchInput, setSearchInput] = React.useState("")
  const [appliedSearch, setAppliedSearch] = React.useState("")
  const [sortBy, setSortBy] = React.useState<RecoverySortField>("lastActivityAt")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc")
  const [page, setPage] = React.useState(1)

  const [listData, setListData] = React.useState<RecoveryListResponse | null>(null)
  const [listLoading, setListLoading] = React.useState(true)
  const [listError, setListError] = React.useState("")

  const [selectedCaseId, setSelectedCaseId] = React.useState<string | null>(null)
  const [detail, setDetail] = React.useState<RecoveryCaseDetailResponse | null>(null)
  const [detailLoading, setDetailLoading] = React.useState(false)
  const [detailError, setDetailError] = React.useState("")

  const [actionBusy, setActionBusy] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const [assigneeId, setAssigneeId] = React.useState("")
  const [assignNote, setAssignNote] = React.useState("")

  const [nextStatus, setNextStatus] = React.useState<RecoveryStatus | "">("")
  const [statusReason, setStatusReason] = React.useState("")

  const [eventType, setEventType] = React.useState<RecoveryEventActionType>("NOTE_ADDED")
  const [eventNote, setEventNote] = React.useState("")
  const [evidenceRef, setEvidenceRef] = React.useState("")

  const loadList = React.useCallback(async () => {
    setListLoading(true)
    setListError("")
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        sortBy,
        sortOrder,
      })
      if (statusFilter !== "ALL") params.set("status", statusFilter)
      if (appliedSearch) params.set("search", appliedSearch)
      const data = await requestData<RecoveryListResponse>(
        `/api/v1/financial/admin/recovery-cases?${params.toString()}`
      )
      setListData(data)
    } catch (error) {
      setListError(error instanceof Error ? error.message : "Failed to load recovery cases.")
    } finally {
      setListLoading(false)
    }
  }, [appliedSearch, page, sortBy, sortOrder, statusFilter])

  const loadDetail = React.useCallback(
    async (caseId: string, options?: { preserveFeedback?: boolean }) => {
      setSelectedCaseId(caseId)
      setDetailLoading(true)
      setDetailError("")
      if (!options?.preserveFeedback) {
        setFeedback(null)
      }
      try {
        const data = await requestData<RecoveryCaseDetailResponse>(
          `/api/v1/financial/admin/recovery-cases/${caseId}`
        )
        setDetail(data)
        setAssigneeId(data.recoveryCase.assignedAdmin?.id ?? "")
        setNextStatus(data.recoveryCase.allowedNextStatuses[0] ?? "")
      } catch (error) {
        setDetailError(error instanceof Error ? error.message : "Failed to load recovery case.")
      } finally {
        setDetailLoading(false)
      }
    },
    []
  )

  React.useEffect(() => {
    void loadList()
  }, [loadList])

  async function submitAssignment(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedCaseId) return
    setActionBusy(true)
    setFeedback(null)
    try {
      await requestData(
        `/api/v1/financial/admin/recovery-cases/${selectedCaseId}/assign`,
        jsonRequest("PATCH", {
          assignedAdminId: assigneeId ? assigneeId : null,
          ...(assignNote.trim() ? { note: assignNote.trim() } : {}),
          idempotencyKey: `assign_${crypto.randomUUID().replaceAll("-", "")}`,
        })
      )
      setAssignNote("")
      setFeedback({ type: "success", message: "Administrator assignment recorded." })
      await Promise.all([loadList(), loadDetail(selectedCaseId, { preserveFeedback: true })])
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to update assignment.",
      })
    } finally {
      setActionBusy(false)
    }
  }

  async function submitStatusUpdate(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedCaseId || !nextStatus) return
    setActionBusy(true)
    setFeedback(null)
    try {
      await requestData(
        `/api/v1/financial/admin/recovery-cases/${selectedCaseId}/status`,
        jsonRequest("PATCH", {
          status: nextStatus,
          reason: statusReason.trim(),
          idempotencyKey: `status_${crypto.randomUUID().replaceAll("-", "")}`,
        })
      )
      setStatusReason("")
      setFeedback({
        type: "success",
        message: `Investigation status updated to ${STATUS_LABELS[nextStatus]}. Financial hold remains active.`,
      })
      await Promise.all([loadList(), loadDetail(selectedCaseId, { preserveFeedback: true })])
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to update status.",
      })
    } finally {
      setActionBusy(false)
    }
  }

  async function submitEvent(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedCaseId) return
    setActionBusy(true)
    setFeedback(null)
    try {
      await requestData(
        `/api/v1/financial/admin/recovery-cases/${selectedCaseId}/events`,
        jsonRequest("POST", {
          type: eventType,
          note: eventNote.trim(),
          ...(evidenceRef.trim() ? { evidenceRef: evidenceRef.trim() } : {}),
          idempotencyKey: `event_${crypto.randomUUID().replaceAll("-", "")}`,
        })
      )
      setEventNote("")
      setEvidenceRef("")
      setFeedback({
        type: "success",
        message: "Investigation event appended to immutable recovery history.",
      })
      await Promise.all([loadList(), loadDetail(selectedCaseId, { preserveFeedback: true })])
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to append investigation event.",
      })
    } finally {
      setActionBusy(false)
    }
  }

  const overview = listData?.overview

  return (
    <section
      aria-labelledby="financial-recovery-heading"
      className="space-y-6 rounded-xl border border-border-default bg-bg-surface p-5 sm:p-6"
    >
      {/* 1. Recovery Overview */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" aria-hidden="true" />
            <h2 id="financial-recovery-heading" className="text-lg font-semibold text-foreground">
              Financial Recovery Management
            </h2>
            <Badge variant="warning">Investigation Only</Badge>
          </div>
          <p className="text-sm text-text-secondary">
            Track unresolved chargeback recoveries separately from the authoritative{" "}
            <code>FinancialEntry</code> ledger. Investigation updates never clear financial holds or
            enable payouts.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={listLoading}
          onClick={() => void loadList()}
        >
          <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Refresh queue
        </Button>
      </div>

      <div
        role="note"
        className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950"
      >
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
        <p>
          <strong>Financial Safety Boundary:</strong> External seller payouts and Stripe Live Mode
          remain disabled. Adding investigation notes, attaching evidence, or changing investigation
          status cannot clear <code>recoveryRequired</code> or alter ledger balances.
        </p>
      </div>

      {overview && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg border border-border-default bg-bg-subtle p-3">
            <p className="text-xs text-text-secondary">Total cases</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{overview.totalCases}</p>
          </div>
          <div className="rounded-lg border border-border-default bg-bg-subtle p-3">
            <p className="text-xs text-text-secondary">Recovery total</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              USD {overview.totalRecoveryAmount}
            </p>
          </div>
          <div className="rounded-lg border border-border-default bg-bg-subtle p-3">
            <p className="text-xs text-text-secondary">Active holds</p>
            <p className="mt-1 text-lg font-semibold text-amber-700">
              {overview.activeFinancialHoldCount}
            </p>
          </div>
          <div className="rounded-lg border border-border-default bg-bg-subtle p-3">
            <p className="text-xs text-text-secondary">Open / Investigating</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {overview.countsByStatus.OPEN} / {overview.countsByStatus.INVESTIGATING}
            </p>
          </div>
          <div className="rounded-lg border border-border-default bg-bg-subtle p-3">
            <p className="text-xs text-text-secondary">Awaiting / Pending</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {overview.countsByStatus.AWAITING_EVIDENCE} /{" "}
              {overview.countsByStatus.PENDING_VERIFICATION}
            </p>
          </div>
          <div className="rounded-lg border border-border-default bg-bg-subtle p-3">
            <p className="text-xs text-text-secondary">Unassigned</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{overview.unassignedCount}</p>
          </div>
        </div>
      )}

      {/* 2. Recovery Queue */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <form
            className="flex flex-1 flex-wrap items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              setPage(1)
              setAppliedSearch(searchInput.trim())
            }}
          >
            <label className="min-w-[200px] flex-1 text-xs font-medium text-text-secondary">
              Search recovery queue
              <div className="relative mt-1">
                <Search
                  className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Case, dispute, order, or seller ID"
                  className="min-h-9 w-full rounded-lg border border-border-default bg-bg-surface pl-8 pr-3 text-sm text-foreground"
                />
              </div>
            </label>
            <Button type="submit" variant="outline" size="sm">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            <label className="text-xs font-medium text-text-secondary">
              Status
              <select
                value={statusFilter}
                onChange={(event) => {
                  setPage(1)
                  setStatusFilter(event.target.value as RecoveryStatusFilter)
                }}
                className="mt-1 block min-h-9 rounded-lg border border-border-default bg-bg-surface px-2.5 text-sm text-foreground"
              >
                <option value="ALL">All statuses</option>
                <option value="OPEN">Open</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="AWAITING_EVIDENCE">Awaiting Evidence</option>
                <option value="PENDING_VERIFICATION">Pending Verification</option>
              </select>
            </label>
            <label className="text-xs font-medium text-text-secondary">
              Sort by
              <select
                value={sortBy}
                onChange={(event) => {
                  setPage(1)
                  setSortBy(event.target.value as RecoverySortField)
                }}
                className="mt-1 block min-h-9 rounded-lg border border-border-default bg-bg-surface px-2.5 text-sm text-foreground"
              >
                <option value="lastActivityAt">Last activity</option>
                <option value="createdAt">Created date</option>
                <option value="recoveryAmount">Recovery amount</option>
              </select>
            </label>
            <label className="text-xs font-medium text-text-secondary">
              Order
              <select
                value={sortOrder}
                onChange={(event) => {
                  setPage(1)
                  setSortOrder(event.target.value as "asc" | "desc")
                }}
                className="mt-1 block min-h-9 rounded-lg border border-border-default bg-bg-surface px-2.5 text-sm text-foreground"
              >
                <option value="desc">Newest / Highest</option>
                <option value="asc">Oldest / Lowest</option>
              </select>
            </label>
          </div>
        </div>

        {listError && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            <span>{listError}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadList()}>
              Retry
            </Button>
          </div>
        )}

        {listLoading && (
          <p role="status" className="text-sm text-text-secondary">
            Loading recovery cases…
          </p>
        )}

        {!listLoading && !listError && listData && listData.items.length === 0 && (
          <div className="rounded-lg border border-dashed border-border-default bg-bg-subtle p-6 text-center text-sm text-text-secondary">
            No financial recovery cases match the current filters.
          </div>
        )}

        {!listLoading && listData && listData.items.length > 0 && (
          <div className="space-y-3">
            <div className="hidden overflow-x-auto rounded-lg border border-border-default lg:block">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-subtle text-text-secondary">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">Case / Order</th>
                    <th className="px-3 py-2.5 font-medium">Seller</th>
                    <th className="px-3 py-2.5 font-medium">Recovery</th>
                    <th className="px-3 py-2.5 font-medium">Provider / Hold</th>
                    <th className="px-3 py-2.5 font-medium">Investigation</th>
                    <th className="px-3 py-2.5 font-medium">Payout / Last Activity</th>
                    <th className="px-3 py-2.5 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {listData.items.map((item) => (
                    <tr
                      key={item.id}
                      className={
                        selectedCaseId === item.id ? "bg-bg-subtle/80" : "hover:bg-bg-subtle/40"
                      }
                    >
                      <td className="px-3 py-2.5 align-top">
                        <p className="font-mono font-medium text-foreground">{item.id}</p>
                        <p className="text-text-secondary">Order: {item.orderId}</p>
                        <p className="text-text-secondary">Dispute: {item.disputeId}</p>
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <p className="font-medium text-foreground">{item.sellerRef}</p>
                        <p className="font-mono text-[11px] text-text-secondary">
                          {item.sellerProfileId}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <p className="font-semibold text-foreground">USD {item.recoveryAmount}</p>
                        <p className="text-[11px] text-text-secondary">
                          Res: ${item.balances.reserved} · Paid: ${item.balances.paid}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <p className="font-medium text-foreground">
                          {item.providerStatus || "unknown"}
                        </p>
                        <Badge variant={item.recoveryRequired ? "warning" : "secondary"}>
                          {item.recoveryRequired ? "Hold Active" : "Hold Cleared"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <Badge variant={statusBadgeVariant(item.status)}>
                          {STATUS_LABELS[item.status]}
                        </Badge>
                        <p className="mt-1 text-[11px] text-text-secondary">
                          {item.assignedAdmin ? `Admin ${item.assignedAdmin.id}` : "Unassigned"}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <p className="text-foreground">
                          {item.payout
                            ? `Payout ${item.payout.status} ($${item.payout.amount})`
                            : "No payout row"}
                        </p>
                        <p className="text-[11px] text-text-secondary">
                          {formatDateTime(item.lastActivityAt)}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 text-right align-top">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void loadDetail(item.id)}
                        >
                          Inspect case
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile responsive queue cards */}
            <div className="space-y-3 lg:hidden">
              {listData.items.map((item) => (
                <article
                  key={item.id}
                  className="space-y-2 rounded-lg border border-border-default bg-bg-subtle p-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono font-semibold text-foreground">{item.id}</span>
                    <Badge variant={statusBadgeVariant(item.status)}>
                      {STATUS_LABELS[item.status]}
                    </Badge>
                  </div>
                  <p className="text-foreground">
                    <strong>USD {item.recoveryAmount}</strong> · {item.sellerRef} (
                    {item.sellerProfileId})
                  </p>
                  <p className="text-text-secondary">
                    Order: {item.orderId} · Dispute: {item.disputeId}
                  </p>
                  <p className="text-text-secondary">
                    Provider: {item.providerStatus || "unknown"} ·{" "}
                    {item.recoveryRequired ? "Financial Hold Active" : "No Active Hold"}
                  </p>
                  <p className="text-text-secondary">
                    Last activity: {formatDateTime(item.lastActivityAt)}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void loadDetail(item.id)}
                  >
                    Inspect case
                  </Button>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>
                Page {listData.meta.page} of {listData.meta.totalPages} ({listData.meta.total}{" "}
                total)
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || listLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= listData.meta.totalPages || listLoading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3–8. Selected Recovery Case Details & Investigation Controls */}
      {detailLoading && (
        <p role="status" className="text-sm text-text-secondary">
          Loading recovery case dossier…
        </p>
      )}
      {detailError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {detailError}
        </p>
      )}

      {detail && !detailLoading && (
        <div className="space-y-5 border-t border-border-default pt-5">
          {feedback && (
            <p
              role={feedback.type === "error" ? "alert" : "status"}
              className={
                feedback.type === "error"
                  ? "rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                  : "rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
              }
            >
              {feedback.message}
            </p>
          )}

          {/* 3. Recovery Case Details */}
          <div className="space-y-3 rounded-lg border border-border-default bg-bg-subtle p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Case Details · <span className="font-mono">{detail.recoveryCase.id}</span>
                </h3>
                <p className="text-xs text-text-secondary">
                  Last activity: {formatDateTime(detail.recoveryCase.lastActivityAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={statusBadgeVariant(detail.recoveryCase.status)}>
                  {STATUS_LABELS[detail.recoveryCase.status]}
                </Badge>
                <Badge variant={detail.recoveryCase.financialHoldActive ? "warning" : "secondary"}>
                  {detail.recoveryCase.financialHoldActive
                    ? "Financial Hold Active"
                    : "Hold Inactive"}
                </Badge>
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-text-secondary">Recovery Amount</dt>
                <dd className="font-semibold text-foreground">
                  USD {detail.recoveryCase.recoveryAmount}
                </dd>
              </div>
              <div>
                <dt className="text-text-secondary">Dispute ID / Provider</dt>
                <dd className="font-mono text-foreground">
                  {detail.dispute.id} ({detail.dispute.providerDisputeId || "internal"} ·{" "}
                  {detail.dispute.providerStatus || detail.dispute.status})
                </dd>
              </div>
              <div>
                <dt className="text-text-secondary">Order ID / Status</dt>
                <dd className="font-mono text-foreground">
                  {detail.order.id} ({detail.order.status} · USD {detail.order.amount})
                </dd>
              </div>
              <div>
                <dt className="text-text-secondary">Seller Reference</dt>
                <dd className="text-foreground">
                  {detail.seller.displayName} ({detail.seller.id} · {detail.seller.status})
                </dd>
              </div>
            </dl>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(
                [
                  ["Pending", detail.balances.pending],
                  ["Available", detail.balances.available],
                  ["Reserved", detail.balances.reserved],
                  ["Paid", detail.balances.paid],
                  ["Platform Fee", detail.balances.fee],
                ] as const
              ).map(([label, amount]) => (
                <div
                  key={label}
                  className="rounded border border-border-default bg-bg-surface p-2 text-xs"
                >
                  <p className="text-text-secondary">{label}</p>
                  <p className="font-semibold text-foreground">USD {amount}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-3">
              <div className="rounded border border-border-default bg-bg-surface p-3">
                <p className="font-semibold text-foreground">Related Payouts</p>
                {detail.payouts.length === 0 ? (
                  <p className="mt-1 text-text-secondary">No payout records.</p>
                ) : (
                  detail.payouts.map((p) => (
                    <p key={p.id} className="mt-1 text-text-secondary">
                      {p.id}: USD {p.amount} · {p.status} (attempt {p.attempt})
                    </p>
                  ))
                )}
              </div>
              <div className="rounded border border-border-default bg-bg-surface p-3">
                <p className="font-semibold text-foreground">Transactions</p>
                {detail.transactions.map((t) => (
                  <p key={t.id} className="mt-1 text-text-secondary">
                    {t.stripePaymentId || t.id}: USD {t.amount} (refunded ${t.refundedAmount}) ·{" "}
                    {t.status}
                  </p>
                ))}
              </div>
              <div className="rounded border border-border-default bg-bg-surface p-3">
                <p className="font-semibold text-foreground">Refunds</p>
                {detail.refunds.length === 0 ? (
                  <p className="mt-1 text-text-secondary">No refund records.</p>
                ) : (
                  detail.refunds.map((r) => (
                    <p key={r.id} className="mt-1 text-text-secondary">
                      {r.id}: USD {r.amount} · {r.status}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 6, 7, 8. Investigation Actions Grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* 7. Administrator Assignment */}
            <form
              onSubmit={(event) => void submitAssignment(event)}
              className="space-y-3 rounded-lg border border-border-default bg-bg-subtle p-4"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-foreground" aria-hidden="true" />
                <h4 className="text-sm font-semibold text-foreground">Administrator Assignment</h4>
              </div>
              <label className="block text-xs font-medium text-text-secondary">
                Assigned investigator
                <select
                  value={assigneeId}
                  onChange={(event) => setAssigneeId(event.target.value)}
                  className="mt-1 block min-h-9 w-full rounded-lg border border-border-default bg-bg-surface px-2.5 text-sm text-foreground"
                >
                  <option value="">Unassigned</option>
                  {listData?.availableAdmins.map((adm) => (
                    <option key={adm.id} value={adm.id}>
                      Admin {adm.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium text-text-secondary">
                Assignment note (optional)
                <input
                  value={assignNote}
                  onChange={(event) => setAssignNote(event.target.value)}
                  maxLength={2000}
                  placeholder="Optional handoff note"
                  className="mt-1 block min-h-9 w-full rounded-lg border border-border-default bg-bg-surface px-2.5 text-sm text-foreground"
                />
              </label>
              <Button type="submit" variant="outline" size="sm" disabled={actionBusy}>
                Save assignment
              </Button>
            </form>

            {/* 8. Investigation Status Management */}
            <form
              onSubmit={(event) => void submitStatusUpdate(event)}
              className="space-y-3 rounded-lg border border-border-default bg-bg-subtle p-4"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-foreground" aria-hidden="true" />
                <h4 className="text-sm font-semibold text-foreground">
                  Investigation Status Management
                </h4>
              </div>
              <label className="block text-xs font-medium text-text-secondary">
                Next permitted status
                <select
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value as RecoveryStatus)}
                  className="mt-1 block min-h-9 w-full rounded-lg border border-border-default bg-bg-surface px-2.5 text-sm text-foreground"
                >
                  {detail.recoveryCase.allowedNextStatuses.map((st) => (
                    <option key={st} value={st}>
                      {STATUS_LABELS[st]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium text-text-secondary">
                Status transition reason
                <textarea
                  required
                  minLength={3}
                  maxLength={2000}
                  rows={2}
                  value={statusReason}
                  onChange={(event) => setStatusReason(event.target.value)}
                  placeholder="Document why investigation status is advancing"
                  className="mt-1 block w-full rounded-lg border border-border-default bg-bg-surface p-2 text-sm text-foreground"
                />
              </label>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={actionBusy || !nextStatus || statusReason.trim().length < 3}
              >
                Update investigation status
              </Button>
            </form>

            {/* 6. Evidence Management */}
            <form
              onSubmit={(event) => void submitEvent(event)}
              className="space-y-3 rounded-lg border border-border-default bg-bg-subtle p-4"
            >
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-foreground" aria-hidden="true" />
                <h4 className="text-sm font-semibold text-foreground">Evidence & Notes</h4>
              </div>
              <label className="block text-xs font-medium text-text-secondary">
                Event type
                <select
                  value={eventType}
                  onChange={(event) => setEventType(event.target.value as RecoveryEventActionType)}
                  className="mt-1 block min-h-9 w-full rounded-lg border border-border-default bg-bg-surface px-2.5 text-sm text-foreground"
                >
                  <option value="NOTE_ADDED">Add investigation note</option>
                  <option value="EVIDENCE_ATTACHED">Attach evidence reference</option>
                  <option value="EVIDENCE_REQUESTED">Request additional evidence</option>
                </select>
              </label>
              <label className="block text-xs font-medium text-text-secondary">
                Investigation note
                <textarea
                  required
                  minLength={3}
                  maxLength={2000}
                  rows={2}
                  value={eventNote}
                  onChange={(event) => setEventNote(event.target.value)}
                  placeholder="Record verified observations or requested evidence"
                  className="mt-1 block w-full rounded-lg border border-border-default bg-bg-surface p-2 text-sm text-foreground"
                />
              </label>
              <label className="block text-xs font-medium text-text-secondary">
                Evidence reference {eventType === "EVIDENCE_ATTACHED" ? "(required)" : "(optional)"}
                <input
                  required={eventType === "EVIDENCE_ATTACHED"}
                  value={evidenceRef}
                  onChange={(event) => setEvidenceRef(event.target.value)}
                  placeholder="ref:stripe-dispute-doc-1 or https://..."
                  className="mt-1 block min-h-9 w-full rounded-lg border border-border-default bg-bg-surface px-2.5 text-sm text-foreground"
                />
              </label>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={
                  actionBusy ||
                  eventNote.trim().length < 3 ||
                  (eventType === "EVIDENCE_ATTACHED" && evidenceRef.trim().length < 3)
                }
              >
                Append recovery event
              </Button>
            </form>
          </div>

          {/* 4 & 5. Financial Ledger History & Investigation Timeline */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* 4. Financial Ledger History */}
            <div className="space-y-2 rounded-lg border border-border-default bg-bg-subtle p-4">
              <h4 className="text-sm font-semibold text-foreground">
                Financial Ledger History (Authoritative Read-Only)
              </h4>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1 text-xs">
                {detail.ledgerHistory.map((entryRow) => (
                  <article
                    key={entryRow.id}
                    className="rounded border border-border-default bg-bg-surface p-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="font-mono font-semibold text-foreground">
                        {entryRow.type}
                      </span>
                      <span className="text-text-secondary">
                        {formatDateTime(entryRow.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-foreground">
                      Amount: USD {entryRow.amount} · Pending {entryRow.pendingDelta} · Avail{" "}
                      {entryRow.availableDelta} · Res {entryRow.reservedDelta} · Paid{" "}
                      {entryRow.paidDelta} · Fee {entryRow.feeDelta}
                    </p>
                    {entryRow.reason && (
                      <p className="mt-0.5 text-text-secondary">{entryRow.reason}</p>
                    )}
                  </article>
                ))}
              </div>
            </div>

            {/* 5. Investigation Timeline */}
            <div className="space-y-2 rounded-lg border border-border-default bg-bg-subtle p-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-foreground" aria-hidden="true" />
                <h4 className="text-sm font-semibold text-foreground">
                  Investigation Timeline (Append-Only)
                </h4>
              </div>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1 text-xs">
                {detail.timeline.map((evt) => (
                  <article
                    key={evt.id}
                    className="rounded border border-border-default bg-bg-surface p-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="font-mono font-semibold text-foreground">{evt.type}</span>
                      <span className="text-text-secondary">{formatDateTime(evt.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 text-text-secondary">
                      Actor: {evt.actor ? `${evt.actor.role} (${evt.actor.id})` : "System"}
                      {evt.previousStatus && evt.nextStatus
                        ? ` · ${evt.previousStatus} -> ${evt.nextStatus}`
                        : evt.nextStatus
                          ? ` · ${evt.nextStatus}`
                          : ""}
                    </p>
                    {evt.note && <p className="mt-1 text-foreground">{evt.note}</p>}
                    {evt.evidenceRef && (
                      <p className="mt-0.5 font-mono text-[11px] text-text-secondary break-all">
                        Evidence: {evt.evidenceRef}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
