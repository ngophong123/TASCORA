"use client"

import * as React from "react"
import {
  CheckCircle2,
  Download,
  Eye,
  FileSearch,
  History,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  X,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { apiFetch } from "@/lib/auth-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type KycQueueStatus =
  "ALL" | "PENDING" | "UNDER_REVIEW" | "NEEDS_RESUBMISSION" | "APPROVED" | "VERIFIED" | "REJECTED"

type DocumentSlot = "front" | "back" | "selfie"

interface KycQueueItem {
  id: string
  sellerProfileId: string
  status: Exclude<KycQueueStatus, "ALL">
  documentType: string
  legalName: string | null
  documentNumberMasked: string | null
  country: string | null
  scanStatus: string
  submittedAt: string
  reviewedAt: string | null
  seller: {
    id: string
    userId: string
    email: string
    accountStatus: string
    firstName: string | null
    lastName: string | null
    profileStatus: string
  }
}

interface KycQueueResponse {
  items: KycQueueItem[]
  counts: {
    pending: number
    underReview: number
    needsResubmission: number
    approved: number
    rejected: number
    actionable: number
  }
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface KycDocumentSlotMeta {
  slot: DocumentSlot
  filename: string
  extension: string
  downloadable?: boolean
  downloadEndpoint: string | null
}

interface KycReviewHistoryEntry {
  id: string
  decision: string
  previousState: string
  newState: string
  reason: string | null
  comments: string | null
  createdAt: string
  actor?: { id: string; email: string; role: string } | null
}

interface KycAdminDetail {
  id: string
  status: Exclude<KycQueueStatus, "ALL">
  documentType: string
  legalName: string | null
  documentNumber: string | null
  documentNumberMasked: string | null
  dateOfBirth: string | null
  country: string | null
  scanStatus: string
  scanResult?: string | null
  scannedAt?: string | null
  scanEngineVersion?: string | null
  submittedAt: string
  reviewedAt: string | null
  decisionReason: string | null
  comments: string | null
  version?: number
  seller: {
    email: string
    firstName: string | null
    lastName: string | null
    profileStatus: string
    accountStatus: string
  }
  documents: {
    front: KycDocumentSlotMeta | null
    back: KycDocumentSlotMeta | null
    selfie: KycDocumentSlotMeta | null
  }
  reviewHistory: KycReviewHistoryEntry[]
}

interface AdminAuditLogEntry {
  id: string
  action: string
  targetEntity: string
  targetId: string
  correlationId: string
  previousState: string | null
  newState: string | null
  reason: string | null
  createdAt: string
  admin: { id: string; email: string; role: string }
}

interface AuditLogResponse {
  logs: AdminAuditLogEntry[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

function statusBadgeVariant(status: string): "success" | "warning" | "secondary" | "default" {
  if (status === "APPROVED" || status === "VERIFIED") return "success"
  if (status === "PENDING" || status === "UNDER_REVIEW" || status === "NEEDS_RESUBMISSION") {
    return "warning"
  }
  return "secondary"
}

function scanStatusBadgeVariant(scanStatus: string): "success" | "warning" | "secondary" {
  if (scanStatus === "VERIFIED_SAFE") return "success"
  if (
    scanStatus === "PENDING_SCAN" ||
    scanStatus === "SCANNING" ||
    scanStatus === "QUARANTINED" ||
    scanStatus === "SCAN_FAILED" ||
    scanStatus === "SCAN_UNAVAILABLE"
  ) {
    return "warning"
  }
  return "secondary"
}

function normalizeScanKey(
  scanStatus: string
):
  | "VERIFIED_SAFE"
  | "PENDING_SCAN"
  | "SCANNING"
  | "SCAN_FAILED"
  | "SCAN_UNAVAILABLE"
  | "INFECTED"
  | "QUARANTINED" {
  if (
    scanStatus === "VERIFIED_SAFE" ||
    scanStatus === "PENDING_SCAN" ||
    scanStatus === "SCANNING" ||
    scanStatus === "SCAN_FAILED" ||
    scanStatus === "SCAN_UNAVAILABLE" ||
    scanStatus === "INFECTED"
  ) {
    return scanStatus
  }
  return "QUARANTINED"
}

export function AdminKycPanel({ accountRole }: { accountRole?: string }) {
  const t = useTranslations("adminKyc")
  const kycT = useTranslations("kyc")

  const [statusFilter, setStatusFilter] = React.useState<KycQueueStatus>("ALL")
  const [searchInput, setSearchInput] = React.useState("")
  const [queueData, setQueueData] = React.useState<KycQueueResponse | null>(null)
  const [queueLoading, setQueueLoading] = React.useState(false)
  const [queueError, setQueueError] = React.useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = React.useState(
    Boolean(accountRole && accountRole !== "ADMIN")
  )

  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [detail, setDetail] = React.useState<KycAdminDetail | null>(null)
  const [detailLoading, setDetailLoading] = React.useState(false)

  const [reason, setReason] = React.useState("")
  const [comments, setComments] = React.useState("")
  const [actionBusy, setActionBusy] = React.useState(false)
  const [actionFeedback, setActionFeedback] = React.useState<{
    type: "error" | "success"
    message: string
  } | null>(null)

  const [docLoadingSlot, setDocLoadingSlot] = React.useState<DocumentSlot | null>(null)
  const [previewDoc, setPreviewDoc] = React.useState<{
    slot: DocumentSlot
    filename: string
    objectUrl: string | null
    isImage: boolean
  } | null>(null)

  const [auditActionFilter, setAuditActionFilter] = React.useState("")
  const [auditPage, setAuditPage] = React.useState(1)
  const [auditData, setAuditData] = React.useState<AuditLogResponse | null>(null)
  const [auditError, setAuditError] = React.useState<string | null>(null)

  const cleanupPreviewUrl = React.useCallback(() => {
    setPreviewDoc((prev) => {
      if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl)
      return null
    })
  }, [])

  React.useEffect(() => {
    return () => {
      if (previewDoc?.objectUrl) URL.revokeObjectURL(previewDoc.objectUrl)
    }
  }, [previewDoc])

  React.useEffect(() => {
    if (accountRole && accountRole !== "ADMIN") {
      setPermissionDenied(true)
    } else if (accountRole === "ADMIN") {
      setPermissionDenied(false)
    }
  }, [accountRole])

  const loadQueue = React.useCallback(async () => {
    if (accountRole && accountRole !== "ADMIN") {
      setPermissionDenied(true)
      return
    }
    setQueueLoading(true)
    setQueueError(null)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "ALL") params.set("status", statusFilter)
      if (searchInput.trim()) params.set("search", searchInput.trim())
      const response = await apiFetch(`/api/v1/admin/kyc?${params.toString()}`, {
        cache: "no-store",
      })
      if (response.status === 403) {
        setPermissionDenied(true)
        return
      }
      const json = await response.json().catch(() => null)
      if (!response.ok || !json?.success) {
        throw new Error(json?.error?.message || t("decisionFailed"))
      }
      setQueueData(json.data as KycQueueResponse)
    } catch (err: unknown) {
      setQueueError(err instanceof Error ? err.message : t("decisionFailed"))
    } finally {
      setQueueLoading(false)
    }
  }, [accountRole, searchInput, statusFilter, t])

  const loadAuditLogs = React.useCallback(async () => {
    if (accountRole && accountRole !== "ADMIN") return
    setAuditError(null)
    try {
      const params = new URLSearchParams({ page: String(auditPage), limit: "10" })
      if (auditActionFilter) params.set("action", auditActionFilter)
      const response = await apiFetch(`/api/v1/admin/audit-logs?${params.toString()}`, {
        cache: "no-store",
      })
      if (response.status === 403) {
        setPermissionDenied(true)
        return
      }
      const json = await response.json().catch(() => null)
      if (!response.ok || !json?.success) {
        throw new Error(json?.error?.message || t("auditLoadError"))
      }
      setAuditData(json.data as AuditLogResponse)
    } catch (err: unknown) {
      setAuditError(err instanceof Error ? err.message : t("auditLoadError"))
    }
  }, [accountRole, auditActionFilter, auditPage, t])

  React.useEffect(() => {
    if (accountRole === "ADMIN") {
      void loadQueue()
      void loadAuditLogs()
    }
  }, [accountRole, loadQueue, loadAuditLogs])

  const inspectSubmission = async (id: string, preserveFeedback = false) => {
    cleanupPreviewUrl()
    setSelectedId(id)
    setDetailLoading(true)
    if (!preserveFeedback) setActionFeedback(null)
    try {
      const response = await apiFetch(`/api/v1/admin/kyc/${id}`, { cache: "no-store" })
      if (response.status === 403) {
        setPermissionDenied(true)
        return
      }
      const json = await response.json().catch(() => null)
      if (!response.ok || !json?.success) {
        throw new Error(json?.error?.message || t("decisionFailed"))
      }
      setDetail(json.data as KycAdminDetail)
      setReason("")
      setComments("")
      void loadAuditLogs()
    } catch (err: unknown) {
      setActionFeedback({
        type: "error",
        message: err instanceof Error ? err.message : t("decisionFailed"),
      })
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDocumentInspect = async (slot: DocumentSlot, meta: KycDocumentSlotMeta) => {
    if (!detail || detail.scanStatus !== "VERIFIED_SAFE" || !meta.downloadEndpoint) {
      setActionFeedback({ type: "error", message: t("quarantineBanner") })
      return
    }
    setDocLoadingSlot(slot)
    setActionFeedback(null)
    try {
      const response = await apiFetch(meta.downloadEndpoint, { cache: "no-store" })
      if (!response.ok) {
        const errJson = await response.json().catch(() => null)
        throw new Error(errJson?.error?.message || t("decisionFailed"))
      }
      const serverScanStatus = response.headers.get("x-tascora-scan-status")
      if (serverScanStatus !== "VERIFIED_SAFE") {
        throw new Error(t("quarantineBanner"))
      }

      const contentType = response.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        const json = await response.json()
        if (json?.data?.scanStatus !== "VERIFIED_SAFE") {
          throw new Error(t("quarantineBanner"))
        }
        const url = json?.data?.downloadUrl as string | undefined
        if (!url) throw new Error(t("decisionFailed"))
        const link = document.createElement("a")
        link.href = url
        link.rel = "noopener noreferrer"
        link.click()
        void loadAuditLogs()
        return
      }

      const rawBlob = await response.blob()
      const ext = meta.extension.toLowerCase()
      const mimeMap: Record<string, string> = {
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        webp: "image/webp",
        pdf: "application/pdf",
      }
      const typedBlob = rawBlob.slice(0, rawBlob.size, mimeMap[ext] || "application/octet-stream")
      const objectUrl = URL.createObjectURL(typedBlob)
      const isImage = ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp"
      cleanupPreviewUrl()
      setPreviewDoc({ slot, filename: meta.filename, objectUrl, isImage })
      void loadAuditLogs()
    } catch (err: unknown) {
      setActionFeedback({
        type: "error",
        message: err instanceof Error ? err.message : t("decisionFailed"),
      })
    } finally {
      setDocLoadingSlot(null)
    }
  }

  const submitDecision = async (
    decision: "under-review" | "approve" | "request-resubmission" | "reject"
  ) => {
    if (!detail || typeof detail.version !== "number" || detail.version < 1) {
      setActionFeedback({ type: "error", message: t("decisionFailed") })
      return
    }
    if (decision === "approve" && detail.scanStatus !== "VERIFIED_SAFE") {
      setActionFeedback({ type: "error", message: t("approvalBlockedByScan") })
      return
    }
    const trimmedReason = reason.trim()
    if (
      (decision === "reject" || decision === "request-resubmission") &&
      trimmedReason.length < 5
    ) {
      setActionFeedback({ type: "error", message: t("reasonRequiredError") })
      return
    }

    setActionBusy(true)
    setActionFeedback(null)
    try {
      const response = await apiFetch(`/api/v1/admin/kyc/${detail.id}/${decision}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(trimmedReason ? { reason: trimmedReason } : {}),
          ...(comments.trim() ? { comments: comments.trim() } : {}),
          expectedVersion: detail.version,
        }),
      })
      const json = await response.json().catch(() => null)
      if (!response.ok || !json?.success) {
        if (response.status === 409) {
          await Promise.all([loadQueue(), inspectSubmission(detail.id, true)])
        }
        throw new Error(json?.error?.message || t("decisionFailed"))
      }

      setActionFeedback({ type: "success", message: t("decisionSaved") })
      await Promise.all([loadQueue(), loadAuditLogs(), inspectSubmission(detail.id, true)])
    } catch (err: unknown) {
      setActionFeedback({
        type: "error",
        message: err instanceof Error ? err.message : t("decisionFailed"),
      })
    } finally {
      setActionBusy(false)
    }
  }

  if (permissionDenied) {
    return (
      <section
        role="alert"
        aria-labelledby="admin-kyc-denied"
        className="rounded-xl border border-error bg-error-subtle p-6 text-error"
      >
        <div className="flex items-start gap-3">
          <ShieldX aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-1">
            <h2 id="admin-kyc-denied" className="text-base font-semibold">
              {t("permissionDeniedTitle")}
            </h2>
            <p className="text-sm">{t("permissionDeniedDescription")}</p>
          </div>
        </div>
      </section>
    )
  }

  if (accountRole && accountRole !== "ADMIN") {
    return null
  }

  const counts = queueData?.counts

  return (
    <div className="space-y-8">
      <section
        aria-labelledby="admin-kyc-queue-heading"
        className="space-y-5 rounded-xl border border-border-default bg-bg-surface p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 id="admin-kyc-queue-heading" className="text-lg font-semibold text-text-primary">
              {t("sectionTitle")}
            </h2>
            <p className="text-sm text-text-secondary">{t("sectionSubtitle")}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void loadQueue()
              void loadAuditLogs()
            }}
            disabled={queueLoading}
            className="min-h-10 gap-2"
          >
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            <span>{t("refresh")}</span>
          </Button>
        </div>

        {counts && (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: t("countsActionable"), value: counts.actionable },
              { label: t("countsPending"), value: counts.pending },
              { label: t("countsUnderReview"), value: counts.underReview },
              { label: t("countsNeedsResubmission"), value: counts.needsResubmission },
              { label: t("countsApproved"), value: counts.approved },
              { label: t("countsRejected"), value: counts.rejected },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-lg border border-border-default bg-bg-subtle p-3"
              >
                <p className="text-xs text-text-muted">{card.label}</p>
                <p className="mt-1 text-xl font-semibold text-text-primary">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="h-11 min-w-[240px] flex-1 rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-primary"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as KycQueueStatus)}
            aria-label={t("filterAll")}
            className="h-11 rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-primary"
          >
            <option value="ALL">{t("filterAll")}</option>
            <option value="PENDING">{kycT("statuses.PENDING")}</option>
            <option value="UNDER_REVIEW">{kycT("statuses.UNDER_REVIEW")}</option>
            <option value="NEEDS_RESUBMISSION">{kycT("statuses.NEEDS_RESUBMISSION")}</option>
            <option value="APPROVED">{kycT("statuses.APPROVED")}</option>
            <option value="REJECTED">{kycT("statuses.REJECTED")}</option>
          </select>
        </div>

        {queueError && (
          <div
            role="alert"
            className="rounded-lg border border-error bg-error-subtle p-4 text-sm text-error"
          >
            {queueError}
          </div>
        )}

        <div className="space-y-3">
          {!queueLoading && queueData?.items.length === 0 && (
            <p className="rounded-lg border border-border-default bg-bg-subtle p-4 text-sm text-text-secondary">
              {t("emptyQueue")}
            </p>
          )}
          {queueData?.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border-default p-4"
            >
              <div className="space-y-1 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-text-primary">
                    {item.legalName || item.seller.email}
                  </span>
                  <Badge variant={statusBadgeVariant(item.status)}>
                    {t("reviewStatusLabel")}: {kycT(`statuses.${item.status}`)}
                  </Badge>
                  <Badge variant={scanStatusBadgeVariant(item.scanStatus)}>
                    {t("securityScanLabel")}:{" "}
                    {kycT(`scanStatuses.${normalizeScanKey(item.scanStatus)}`)}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary">
                  {t("sellerEmail")}: {item.seller.email} · {t("maskedId")}:{" "}
                  <span className="font-mono">{item.documentNumberMasked || "—"}</span> ·{" "}
                  {t("submitted")}: {new Date(item.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                type="button"
                variant={selectedId === item.id ? "outline" : "primary"}
                onClick={() => {
                  if (selectedId === item.id) {
                    setSelectedId(null)
                    setDetail(null)
                    cleanupPreviewUrl()
                  } else {
                    void inspectSubmission(item.id)
                  }
                }}
                className="min-h-10 gap-2"
              >
                <FileSearch aria-hidden="true" className="h-4 w-4" />
                <span>{selectedId === item.id ? t("hideDetails") : t("inspectRecord")}</span>
              </Button>
            </div>
          ))}
        </div>

        {selectedId && (
          <div className="space-y-5 rounded-xl border border-primary/30 bg-bg-subtle p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-text-primary">{t("detailTitle")}</h3>
                <p className="text-xs text-text-secondary">{t("sensitiveAccessNotice")}</p>
              </div>
              {detail && (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusBadgeVariant(detail.status)} size="md">
                    {t("reviewStatusLabel")}: {kycT(`statuses.${detail.status}`)}
                  </Badge>
                  <Badge variant={scanStatusBadgeVariant(detail.scanStatus)} size="md">
                    {t("securityScanLabel")}:{" "}
                    {kycT(`scanStatuses.${normalizeScanKey(detail.scanStatus)}`)}
                  </Badge>
                </div>
              )}
            </div>

            {detailLoading && <p className="text-sm text-text-secondary">{kycT("loading")}</p>}

            {detail && (
              <>
                <div
                  className={
                    detail.scanStatus === "VERIFIED_SAFE"
                      ? "flex items-start gap-2 rounded-lg border border-success-subtle bg-success-subtle p-3 text-xs text-success"
                      : detail.scanStatus === "INFECTED"
                        ? "flex items-start gap-2 rounded-lg border border-error bg-error-subtle p-3 text-xs text-error"
                        : "flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50/70 p-3 text-xs text-amber-950"
                  }
                >
                  {detail.scanStatus === "VERIFIED_SAFE" ? (
                    <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : detail.scanStatus === "INFECTED" ? (
                    <ShieldX aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <ShieldAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <span>
                    {detail.scanStatus === "VERIFIED_SAFE"
                      ? t("scanVerifiedBanner")
                      : detail.scanStatus === "INFECTED"
                        ? t("scanInfectedBanner")
                        : detail.scanStatus === "PENDING_SCAN" ||
                            detail.scanStatus === "SCANNING" ||
                            detail.scanStatus === "SCAN_FAILED" ||
                            detail.scanStatus === "SCAN_UNAVAILABLE"
                          ? t("scanPendingBanner")
                          : t("quarantineBanner")}{" "}
                    ({detail.scanStatus})
                  </span>
                </div>

                <div className="grid gap-3 rounded-lg border border-border-default bg-bg-surface p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <span className="block text-xs text-text-muted">{t("sellerEmail")}</span>
                    <span className="font-medium text-text-primary">{detail.seller.email}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-text-muted">{kycT("legalNameLabel")}</span>
                    <span className="font-medium text-text-primary">{detail.legalName || "—"}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-text-muted">{kycT("countryLabel")}</span>
                    <span className="font-medium text-text-primary">{detail.country || "—"}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-text-muted">{kycT("dobLabel")}</span>
                    <span className="font-mono font-medium text-text-primary">
                      {detail.dateOfBirth || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-text-muted">
                      {kycT("documentNumberLabel")}
                    </span>
                    <span className="font-mono font-medium text-text-primary">
                      {detail.documentNumber || detail.documentNumberMasked || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-text-muted">
                      {kycT("documentTypeLabel")}
                    </span>
                    <span className="font-medium text-text-primary">{detail.documentType}</span>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {(
                    [
                      {
                        key: "front" as const,
                        label: t("docSlotFront"),
                        meta: detail.documents.front,
                      },
                      {
                        key: "back" as const,
                        label: t("docSlotBack"),
                        meta: detail.documents.back,
                      },
                      {
                        key: "selfie" as const,
                        label: t("docSlotSelfie"),
                        meta: detail.documents.selfie,
                      },
                    ] as const
                  )
                    .filter((entry) => entry.meta !== null)
                    .map((entry) => (
                      <div
                        key={entry.key}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border-default bg-bg-surface p-3 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-text-primary">{entry.label}</p>
                          <p className="truncate text-text-muted">{entry.meta!.filename}</p>
                        </div>
                        {detail.scanStatus === "VERIFIED_SAFE" && entry.meta!.downloadEndpoint ? (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={docLoadingSlot !== null}
                            onClick={() => void handleDocumentInspect(entry.key, entry.meta!)}
                            className="min-h-9 shrink-0 gap-1.5 px-3 text-xs"
                          >
                            <Eye aria-hidden="true" className="h-3.5 w-3.5" />
                            <span>
                              {docLoadingSlot === entry.key
                                ? t("loadingDoc")
                                : t("viewOrDownloadDoc")}
                            </span>
                          </Button>
                        ) : (
                          <Badge variant="warning" size="sm">
                            <Lock aria-hidden="true" className="h-3 w-3" />
                            <span>{t("docLockedQuarantined")}</span>
                          </Badge>
                        )}
                      </div>
                    ))}
                </div>

                {detail.scanStatus === "VERIFIED_SAFE" && previewDoc && previewDoc.objectUrl && (
                  <div className="space-y-3 rounded-lg border border-border-default bg-bg-surface p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-text-primary">
                        {previewDoc.filename}
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={previewDoc.objectUrl}
                          download={previewDoc.filename}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border-default px-3 text-xs font-medium text-text-primary hover:bg-bg-subtle"
                        >
                          <Download aria-hidden="true" className="h-3.5 w-3.5" />
                          <span>{t("downloadAttachment")}</span>
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={cleanupPreviewUrl}
                          className="min-h-9 px-2 text-xs"
                          aria-label={t("closePreview")}
                        >
                          <X aria-hidden="true" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {previewDoc.isImage && (
                      // Safe raster object URL created explicitly from binary response after admin audit click.
                      <img
                        src={previewDoc.objectUrl}
                        alt={previewDoc.filename}
                        className="max-h-96 rounded-md border border-border-default object-contain"
                      />
                    )}
                  </div>
                )}

                {actionFeedback && (
                  <div
                    role={actionFeedback.type === "error" ? "alert" : "status"}
                    className={
                      actionFeedback.type === "error"
                        ? "rounded-lg border border-error bg-error-subtle p-3 text-sm text-error"
                        : "flex items-center gap-2 rounded-lg border border-success-subtle bg-success-subtle p-3 text-sm text-success"
                    }
                  >
                    {actionFeedback.type === "success" && (
                      <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" />
                    )}
                    <span>{actionFeedback.message}</span>
                  </div>
                )}

                <div className="space-y-3 rounded-lg border border-border-default bg-bg-surface p-4">
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-text-primary">{t("reasonFieldLabel")}</span>
                    <textarea
                      rows={2}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={t("reasonPlaceholder")}
                      className="w-full rounded-lg border border-border-default bg-bg-surface p-3 text-sm text-text-primary"
                    />
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-text-primary">{t("commentsFieldLabel")}</span>
                    <input
                      type="text"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-primary"
                    />
                  </label>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {detail.status === "PENDING" && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={actionBusy}
                        onClick={() => void submitDecision("under-review")}
                        className="min-h-10"
                      >
                        {t("markUnderReview")}
                      </Button>
                    )}
                    {(detail.status === "PENDING" || detail.status === "UNDER_REVIEW") && (
                      <>
                        <Button
                          type="button"
                          disabled={actionBusy || detail.scanStatus !== "VERIFIED_SAFE"}
                          onClick={() => void submitDecision("approve")}
                          className="min-h-10"
                        >
                          {t("approveAction")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={actionBusy}
                          onClick={() => void submitDecision("request-resubmission")}
                          className="min-h-10"
                        >
                          {t("requestResubmissionAction")}
                        </Button>
                      </>
                    )}
                    {(detail.status === "PENDING" ||
                      detail.status === "UNDER_REVIEW" ||
                      detail.status === "NEEDS_RESUBMISSION") && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={actionBusy}
                        onClick={() => void submitDecision("reject")}
                        className="min-h-10 border-error text-error hover:bg-error-subtle"
                      >
                        {t("rejectAction")}
                      </Button>
                    )}
                  </div>
                  {(detail.status === "PENDING" || detail.status === "UNDER_REVIEW") &&
                    detail.scanStatus !== "VERIFIED_SAFE" && (
                      <p className="text-xs text-amber-900">{t("approvalBlockedByScan")}</p>
                    )}
                </div>

                <div className="space-y-2 rounded-lg border border-border-default bg-bg-surface p-4">
                  <h4 className="text-sm font-semibold text-text-primary">
                    {t("reviewHistoryTitle")}
                  </h4>
                  {detail.reviewHistory.length === 0 ? (
                    <p className="text-xs text-text-muted">{t("noHistory")}</p>
                  ) : (
                    <ul className="space-y-2 text-xs">
                      {detail.reviewHistory.map((item) => (
                        <li
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-default bg-bg-subtle px-3 py-2"
                        >
                          <div>
                            <span className="font-semibold text-text-primary">
                              {item.decision} ({item.previousState} → {item.newState})
                            </span>
                            {item.reason && <p className="text-text-secondary">{item.reason}</p>}
                          </div>
                          <time dateTime={item.createdAt} className="text-text-muted">
                            {new Date(item.createdAt).toLocaleString()}
                          </time>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      <section
        aria-labelledby="admin-audit-log-heading"
        className="space-y-4 rounded-xl border border-border-default bg-bg-surface p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <History aria-hidden="true" className="h-5 w-5 text-primary" />
              <h2 id="admin-audit-log-heading" className="text-lg font-semibold text-text-primary">
                {t("auditLogTitle")}
              </h2>
            </div>
            <p className="text-sm text-text-secondary">{t("auditLogSubtitle")}</p>
          </div>
          <select
            value={auditActionFilter}
            onChange={(e) => {
              setAuditPage(1)
              setAuditActionFilter(e.target.value)
            }}
            aria-label={t("auditActionFilterAll")}
            className="h-10 rounded-lg border border-border-default bg-bg-surface px-3 text-xs text-text-primary"
          >
            <option value="">{t("auditActionFilterAll")}</option>
            <option value="KYC_RECORD_VIEWED">KYC_RECORD_VIEWED</option>
            <option value="KYC_DOCUMENT_VIEWED">KYC_DOCUMENT_VIEWED</option>
            <option value="KYC_MARKED_UNDER_REVIEW">KYC_MARKED_UNDER_REVIEW</option>
            <option value="KYC_APPROVED">KYC_APPROVED</option>
            <option value="KYC_RESUBMISSION_REQUESTED">KYC_RESUBMISSION_REQUESTED</option>
            <option value="KYC_REJECTED">KYC_REJECTED</option>
            <option value="SELLER_REVIEWED">SELLER_REVIEWED</option>
            <option value="USER_STATUS_CHANGED">USER_STATUS_CHANGED</option>
            <option value="SERVICE_APPROVED">SERVICE_APPROVED</option>
          </select>
        </div>

        {auditError ? (
          <div
            role="alert"
            className="rounded-lg border border-error bg-error-subtle p-4 text-sm text-error"
          >
            {auditError}
          </div>
        ) : !auditData?.logs.length ? (
          <p className="rounded-lg border border-border-default bg-bg-subtle p-4 text-sm text-text-secondary">
            {t("auditEmpty")}
          </p>
        ) : (
          <ul className="space-y-2 text-xs">
            {auditData.logs.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-default bg-bg-subtle px-3 py-2.5"
              >
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-semibold text-text-primary">
                      {entry.action}
                    </span>
                    {entry.previousState && entry.newState && (
                      <span className="text-text-secondary">
                        {t("auditTransition")}: {entry.previousState} → {entry.newState}
                      </span>
                    )}
                  </div>
                  <p className="text-text-muted">
                    {t("auditActor")}: {entry.admin.email} · {t("auditTarget")}:{" "}
                    {entry.targetEntity}#{entry.targetId} · {t("auditCorrelation")}:{" "}
                    <span className="font-mono">{entry.correlationId}</span>
                  </p>
                  {entry.reason && <p className="text-text-secondary">{entry.reason}</p>}
                </div>
                <time dateTime={entry.createdAt} className="text-text-muted">
                  {new Date(entry.createdAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        )}

        {auditData && auditData.meta.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 text-xs text-text-secondary">
            <Button
              type="button"
              variant="outline"
              disabled={auditPage <= 1}
              onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
              className="min-h-9"
            >
              {t("previousPage")}
            </Button>
            <span>
              {t("pageLabel", { page: auditData.meta.page, totalPages: auditData.meta.totalPages })}
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={auditPage >= auditData.meta.totalPages}
              onClick={() => setAuditPage((p) => p + 1)}
              className="min-h-9"
            >
              {t("nextPage")}
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
