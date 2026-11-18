"use client"

import * as React from "react"
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Upload,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { apiFetch } from "@/lib/auth-client"
import { uploadFile } from "@/lib/marketplace"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type KycStatus =
  | "NOT_SUBMITTED"
  | "PENDING"
  | "UNDER_REVIEW"
  | "NEEDS_RESUBMISSION"
  | "APPROVED"
  | "VERIFIED"
  | "REJECTED"

type KycDocType = "PASSPORT" | "NATIONAL_ID" | "DRIVERS_LICENSE" | "RESIDENCE_PERMIT"
type UploadSlot = "front" | "back" | "selfie"

interface ReviewHistoryItem {
  id: string
  decision: string
  previousState: string
  newState: string
  reason: string | null
  comments: string | null
  createdAt: string
}

interface KycDocumentDescriptor {
  slot: UploadSlot
  uploaded: boolean
  filename: string
  downloadable?: boolean
  downloadPath: string | null
}

interface SellerKycSubmission {
  id: string
  status: KycStatus
  documentType: KycDocType
  legalName: string | null
  documentNumberMasked: string | null
  dateOfBirthMasked: string | null
  country: string | null
  scanStatus: string
  documents: {
    front: KycDocumentDescriptor | null
    back: KycDocumentDescriptor | null
    selfie: KycDocumentDescriptor | null
  }
  submittedAt: string
  reviewedAt: string | null
  resubmissionRequestedAt: string | null
  decisionReason: string | null
  comments: string | null
  version: number
  reviewHistory: ReviewHistoryItem[]
}

interface PayoutEligibilityView {
  eligibleForLivePayouts: boolean
  kycSatisfied: boolean
  sellerProfileApproved: boolean
  accountActive: boolean
  providerPayoutsEnabled: boolean
  blockingReasons: string[]
  verificationStatus: string
  evaluatedAt: string
}

interface SellerKycPayload {
  status: KycStatus
  sellerProfileStatus: string
  submission: SellerKycSubmission | null
  payoutEligibility: PayoutEligibilityView
}

const ALLOWED_DOC_MIMES = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"])
const ALLOWED_SELFIE_MIMES = new Set(["image/png", "image/jpeg", "image/webp"])
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

function statusBadgeVariant(status: KycStatus): "success" | "warning" | "secondary" | "default" {
  if (status === "APPROVED" || status === "VERIFIED") return "success"
  if (status === "PENDING" || status === "UNDER_REVIEW" || status === "NEEDS_RESUBMISSION") {
    return "warning"
  }
  return "secondary"
}

export function SellerKycPanel() {
  const t = useTranslations("kyc")
  const [data, setData] = React.useState<SellerKycPayload | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)

  const [documentType, setDocumentType] = React.useState<KycDocType>("PASSPORT")
  const [legalName, setLegalName] = React.useState("")
  const [dateOfBirth, setDateOfBirth] = React.useState("")
  const [country, setCountry] = React.useState("VN")
  const [documentNumber, setDocumentNumber] = React.useState("")

  const [documentFrontRef, setDocumentFrontRef] = React.useState<string>("")
  const [documentBackRef, setDocumentBackRef] = React.useState<string>("")
  const [selfieRef, setSelfieRef] = React.useState<string>("")

  const [uploadingSlot, setUploadingSlot] = React.useState<UploadSlot | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [formNotice, setFormNotice] = React.useState<string | null>(null)

  const loadStatus = React.useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const response = await apiFetch("/api/v1/onboarding/seller/kyc", { cache: "no-store" })
      const json = await response.json().catch(() => null)
      if (!response.ok || !json?.success || !json?.data) {
        throw new Error(json?.error?.message || t("loadError"))
      }
      const next = json.data as SellerKycPayload
      setData(next)
      if (next.submission) {
        setDocumentType(next.submission.documentType || "PASSPORT")
        setLegalName(next.submission.legalName || "")
        setCountry(next.submission.country || "VN")
      }
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : t("loadError"))
    } finally {
      setLoading(false)
    }
  }, [t])

  React.useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  const handleFileUpload = async (slot: UploadSlot, file: File | null) => {
    if (!file) return
    setFormError(null)
    setFormNotice(null)

    const allowed = slot === "selfie" ? ALLOWED_SELFIE_MIMES : ALLOWED_DOC_MIMES
    if (!allowed.has(file.type) || file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
      setFormError(t("uploadFailed"))
      return
    }

    setUploadingSlot(slot)
    try {
      const reference = await uploadFile(file, "kyc")
      if (slot === "front") setDocumentFrontRef(reference)
      if (slot === "back") setDocumentBackRef(reference)
      if (slot === "selfie") setSelfieRef(reference)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t("uploadFailed"))
    } finally {
      setUploadingSlot(null)
    }
  }

  const currentStatus: KycStatus = data?.status || "NOT_SUBMITTED"
  const canUpdateExisting = currentStatus === "PENDING" || currentStatus === "NEEDS_RESUBMISSION"
  const canCreateOrResubmit = currentStatus === "NOT_SUBMITTED" || currentStatus === "REJECTED"
  const formEditable = canUpdateExisting || canCreateOrResubmit
  const isApproved = currentStatus === "APPROVED" || currentStatus === "VERIFIED"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formEditable) return
    setFormError(null)
    setFormNotice(null)

    const cleanName = legalName.trim()
    const cleanCountry = country.trim().toUpperCase()
    const cleanNumber = documentNumber.trim()
    const cleanDob = dateOfBirth.trim()

    if (canCreateOrResubmit) {
      if (
        cleanName.length < 2 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(cleanDob) ||
        !/^[A-Z]{2}$/.test(cleanCountry) ||
        cleanNumber.length < 4 ||
        !documentFrontRef
      ) {
        setFormError(t("missingRequiredFields"))
        return
      }
    }

    setSubmitting(true)
    try {
      const usePut = Boolean(data?.submission) && canUpdateExisting
      const payload: Record<string, unknown> = {
        documentType,
        ...(cleanName ? { legalName: cleanName } : {}),
        ...(cleanCountry ? { country: cleanCountry } : {}),
        ...(cleanDob ? { dateOfBirth: cleanDob } : {}),
        ...(cleanNumber ? { documentNumber: cleanNumber } : {}),
        ...(documentFrontRef ? { documentFrontUrl: documentFrontRef } : {}),
        ...(documentBackRef ? { documentBackUrl: documentBackRef } : {}),
        ...(selfieRef ? { selfieUrl: selfieRef } : {}),
      }

      if (!usePut && !payload.documentFrontUrl) {
        setFormError(t("missingRequiredFields"))
        setSubmitting(false)
        return
      }

      const response = await apiFetch("/api/v1/onboarding/seller/kyc", {
        method: usePut ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await response.json().catch(() => null)
      if (!response.ok || !json?.success) {
        throw new Error(json?.error?.message || t("loadError"))
      }

      setDocumentNumber("")
      setFormNotice(
        currentStatus === "NEEDS_RESUBMISSION" || currentStatus === "REJECTED"
          ? t("resubmitSuccess")
          : t("submitSuccess")
      )
      await loadStatus()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t("loadError"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      aria-labelledby="seller-kyc-heading"
      className="space-y-6 rounded-xl border border-border-default bg-bg-surface p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 text-primary" />
            <h2 id="seller-kyc-heading" className="text-lg font-semibold text-text-primary">
              {t("title")}
            </h2>
          </div>
          <p className="text-sm text-text-secondary">{t("subtitle")}</p>
        </div>
        <Badge variant={statusBadgeVariant(currentStatus)} size="md">
          {t(`statuses.${currentStatus}`)}
        </Badge>
      </div>

      {loading && <p className="text-sm text-text-secondary">{t("loading")}</p>}

      {loadError && (
        <div
          role="alert"
          className="rounded-lg border border-error bg-error-subtle p-4 text-sm text-error"
        >
          {loadError}
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border-default bg-bg-subtle p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-text-primary">
                  {t("payoutCardTitle")}
                </span>
                <Badge variant="secondary">
                  <Lock aria-hidden="true" className="h-3 w-3" />
                  {t("payoutDisabledBadge")}
                </Badge>
              </div>
              <p className="text-xs leading-5 text-text-secondary">
                {data.payoutEligibility.kycSatisfied &&
                data.payoutEligibility.sellerProfileApproved &&
                data.payoutEligibility.accountActive
                  ? t("payoutEligibleState")
                  : t("payoutPendingState")}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-text-muted">
                <span>
                  {t("statusLabel")}:{" "}
                  <strong className="text-text-primary">{t(`statuses.${currentStatus}`)}</strong>
                </span>
                <span>•</span>
                <span>
                  {t("profileStatusLabel")}:{" "}
                  <strong className="text-text-primary">{data.sellerProfileStatus}</strong>
                </span>
              </div>
            </div>

            <div
              className={
                data.submission?.scanStatus === "VERIFIED_SAFE"
                  ? "rounded-lg border border-success-subtle bg-success-subtle p-4 text-xs leading-5 text-success space-y-1"
                  : data.submission?.scanStatus === "INFECTED"
                    ? "rounded-lg border border-error bg-error-subtle p-4 text-xs leading-5 text-error space-y-1"
                    : "rounded-lg border border-amber-300/60 bg-amber-50/70 p-4 text-xs leading-5 text-amber-950 space-y-1"
              }
            >
              <div className="flex items-center gap-2 font-semibold">
                {data.submission?.scanStatus === "VERIFIED_SAFE" ? (
                  <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0" />
                ) : (
                  <ShieldAlert aria-hidden="true" className="h-4 w-4 shrink-0" />
                )}
                <span>
                  {t("scanStatusLabel")}:{" "}
                  {t(
                    `scanStatuses.${
                      data.submission?.scanStatus === "VERIFIED_SAFE" ||
                      data.submission?.scanStatus === "PENDING_SCAN" ||
                      data.submission?.scanStatus === "SCANNING" ||
                      data.submission?.scanStatus === "SCAN_FAILED" ||
                      data.submission?.scanStatus === "SCAN_UNAVAILABLE" ||
                      data.submission?.scanStatus === "INFECTED"
                        ? data.submission.scanStatus
                        : "QUARANTINED"
                    }`
                  )}
                </span>
              </div>
              <p>
                {data.submission?.scanStatus === "VERIFIED_SAFE"
                  ? t("scanVerifiedNotice")
                  : data.submission?.scanStatus === "INFECTED"
                    ? t("scanInfectedNotice")
                    : data.submission?.scanStatus === "PENDING_SCAN" ||
                        data.submission?.scanStatus === "SCANNING"
                      ? t("scanPendingNotice")
                      : data.submission?.scanStatus === "SCAN_FAILED" ||
                          data.submission?.scanStatus === "SCAN_UNAVAILABLE"
                        ? t("scanUnavailableNotice")
                        : t("scanQuarantinedNotice")}
              </p>
            </div>
          </div>

          {data.submission && (
            <div className="rounded-lg border border-border-default p-4 text-sm space-y-3">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <span className="block text-xs text-text-muted">{t("legalNameLabel")}</span>
                  <span className="font-medium text-text-primary">
                    {data.submission.legalName || "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-text-muted">{t("documentTypeLabel")}</span>
                  <span className="font-medium text-text-primary">
                    {t(`docTypes.${data.submission.documentType}`)}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-text-muted">{t("documentNumberMasked")}</span>
                  <span className="font-mono font-medium text-text-primary">
                    {data.submission.documentNumberMasked || "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-text-muted">{t("dobLabel")}</span>
                  <span className="font-mono font-medium text-text-primary">
                    {data.submission.dateOfBirthMasked || "—"}
                  </span>
                </div>
              </div>
              {data.submission.decisionReason && (
                <div className="rounded-md border border-border-default bg-bg-subtle p-3 text-xs text-text-primary">
                  <span className="font-semibold">{t("reasonLabel")}: </span>
                  <span>{data.submission.decisionReason}</span>
                </div>
              )}
            </div>
          )}

          {isApproved && (
            <div className="flex items-start gap-3 rounded-lg border border-success-subtle bg-success-subtle p-4 text-sm text-success">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{t("approvedLockedNotice")}</p>
            </div>
          )}

          {currentStatus === "REJECTED" && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50/70 p-4 text-sm text-amber-950">
              <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{t("rejectedLockedNotice")}</p>
            </div>
          )}

          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-error bg-error-subtle p-4 text-sm text-error"
            >
              {formError}
            </div>
          )}

          {formNotice && (
            <div
              role="status"
              className="rounded-lg border border-success-subtle bg-success-subtle p-4 text-sm text-success"
            >
              {formNotice}
            </div>
          )}

          {formEditable && (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium text-text-primary">{t("documentTypeLabel")}</span>
                  <select
                    name="documentType"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as KycDocType)}
                    className="h-11 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-primary"
                  >
                    <option value="PASSPORT">{t("docTypes.PASSPORT")}</option>
                    <option value="NATIONAL_ID">{t("docTypes.NATIONAL_ID")}</option>
                    <option value="DRIVERS_LICENSE">{t("docTypes.DRIVERS_LICENSE")}</option>
                    <option value="RESIDENCE_PERMIT">{t("docTypes.RESIDENCE_PERMIT")}</option>
                  </select>
                </label>

                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium text-text-primary">{t("legalNameLabel")}</span>
                  <input
                    name="legalName"
                    type="text"
                    required={canCreateOrResubmit}
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder={t("legalNamePlaceholder")}
                    className="h-11 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-primary"
                  />
                </label>

                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium text-text-primary">{t("dobLabel")}</span>
                  <input
                    name="dateOfBirth"
                    type="date"
                    required={canCreateOrResubmit}
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="h-11 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-primary"
                  />
                </label>

                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium text-text-primary">{t("countryLabel")}</span>
                  <input
                    name="country"
                    type="text"
                    maxLength={2}
                    required={canCreateOrResubmit}
                    value={country}
                    onChange={(e) => setCountry(e.target.value.toUpperCase())}
                    placeholder="VN"
                    className="h-11 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm uppercase text-text-primary"
                  />
                </label>
              </div>

              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-text-primary">{t("documentNumberLabel")}</span>
                <input
                  name="documentNumber"
                  type="text"
                  autoComplete="off"
                  required={canCreateOrResubmit}
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder={t("documentNumberPlaceholder")}
                  className="h-11 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-primary"
                />
                {canUpdateExisting && (
                  <span className="block text-xs text-text-muted">
                    {t("documentNumberUpdateHint")}
                  </span>
                )}
              </label>

              <p className="text-xs text-text-secondary">{t("uploadHint")}</p>

              <div className="grid gap-4 md:grid-cols-3">
                {(
                  [
                    {
                      slot: "front" as const,
                      label: t("docFrontLabel"),
                      refValue:
                        documentFrontRef || data.submission?.documents.front?.filename || "",
                      accept: "image/png,image/jpeg,image/webp,application/pdf",
                    },
                    {
                      slot: "back" as const,
                      label: t("docBackLabel"),
                      refValue: documentBackRef || data.submission?.documents.back?.filename || "",
                      accept: "image/png,image/jpeg,image/webp,application/pdf",
                    },
                    {
                      slot: "selfie" as const,
                      label: t("selfieLabel"),
                      refValue: selfieRef || data.submission?.documents.selfie?.filename || "",
                      accept: "image/png,image/jpeg,image/webp",
                    },
                  ] as const
                ).map((item) => (
                  <div
                    key={item.slot}
                    className="flex flex-col justify-between gap-2 rounded-lg border border-border-default p-3 text-xs"
                  >
                    <span className="font-medium text-text-primary">{item.label}</span>
                    {item.refValue && (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700">
                        <FileCheck2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{t("uploadedBadge")}</span>
                      </span>
                    )}
                    <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border-default bg-bg-subtle px-3 py-2 font-medium text-text-primary hover:bg-bg-surface">
                      <Upload aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {uploadingSlot === item.slot ? t("uploadingFile") : t("uploadFile")}
                      </span>
                      <input
                        type="file"
                        accept={item.accept}
                        disabled={uploadingSlot !== null}
                        onChange={(e) =>
                          void handleFileUpload(item.slot, e.target.files?.[0] || null)
                        }
                        className="sr-only"
                      />
                    </label>
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                disabled={submitting || uploadingSlot !== null}
                className="min-h-11"
              >
                {submitting
                  ? t("submitting")
                  : currentStatus === "NEEDS_RESUBMISSION" || currentStatus === "REJECTED"
                    ? t("submitResubmission")
                    : currentStatus === "PENDING"
                      ? t("submitUpdate")
                      : t("submitNew")}
              </Button>
            </form>
          )}

          {data.submission?.reviewHistory && data.submission.reviewHistory.length > 0 && (
            <div className="space-y-3 border-t border-border-default pt-4">
              <h3 className="text-sm font-semibold text-text-primary">{t("historyTitle")}</h3>
              <ul className="space-y-2 text-xs">
                {data.submission.reviewHistory.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-default bg-bg-subtle px-3 py-2"
                  >
                    <div className="space-y-0.5">
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
            </div>
          )}
        </>
      )}
    </section>
  )
}
