"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { useDashboard } from "@/context/DashboardContext"
import { type DashboardOrder, type DeliveryFile } from "@/data/dashboard/orders"
import { downloadUpload } from "@/lib/marketplace"
import { OrderActions } from "./OrderActions"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  ShieldCheck,
  Clock,
  CheckCircle2,
  FileText,
  Download,
  Send,
  RotateCcw,
  MessageSquare,
  Paperclip,
  Check,
  Layers,
  FileArchive,
  FileCode,
  File,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AvatarImage } from "@/components/ui/AvatarImage"

interface OrderDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  order: DashboardOrder | null
}

export function OrderDetailDrawer({ isOpen, onClose, order }: OrderDetailDrawerProps) {
  const { role, approveMilestone, requestRevision, deliverWork, showToast } = useDashboard()

  // Modal dialog states
  const [approveDialogOpen, setApproveDialogOpen] = React.useState(false)
  const [revisionDialogOpen, setRevisionDialogOpen] = React.useState(false)
  const [deliverDialogOpen, setDeliverDialogOpen] = React.useState(false)

  // Form inputs
  const [revisionNotes, setRevisionNotes] = React.useState("")
  const [deliveryNotes, setDeliveryNotes] = React.useState("")
  const uploadedFileName = "No attachment selected"

  // Lock body scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Escape key listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        isOpen &&
        !approveDialogOpen &&
        !revisionDialogOpen &&
        !deliverDialogOpen
      ) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, approveDialogOpen, revisionDialogOpen, deliverDialogOpen])

  if (!order) return null

  const isClient = role === "CLIENT"
  const counterpart = isClient ? order.freelancer : order.client

  // Identify milestone eligible for action
  const activeMilestone =
    order.milestones.find((m) => m.status === "in_review") ||
    order.milestones.find((m) => m.status === "in_progress") ||
    order.milestones[0]

  const handleApproveConfirm = async () => {
    try {
      if (activeMilestone) await approveMilestone(order.id, activeMilestone.id)
      setApproveDialogOpen(false)
    } catch (error) {
      showToast({
        title: error instanceof Error ? error.message : "Order update failed",
        type: "error",
      })
    }
  }
  const handleRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await requestRevision(order.id, revisionNotes)
      setRevisionNotes("")
      setRevisionDialogOpen(false)
    } catch (error) {
      showToast({
        title: error instanceof Error ? error.message : "Revision failed",
        type: "error",
      })
    }
  }
  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (activeMilestone) await deliverWork(order.id, activeMilestone.id, deliveryNotes, [])
      setDeliveryNotes("")
      setDeliverDialogOpen(false)
    } catch (error) {
      showToast({
        title: error instanceof Error ? error.message : "Delivery failed",
        type: "error",
      })
    }
  }

  const getFileIcon = (type: DeliveryFile["type"]) => {
    switch (type) {
      case "zip":
        return <FileArchive className="w-4 h-4 text-amber-600" />
      case "code":
        return <FileCode className="w-4 h-4 text-blue-600" />
      case "pdf":
        return <FileText className="w-4 h-4 text-rose-600" />
      case "figma":
        return <Layers className="w-4 h-4 text-teal-600" />
      default:
        return <File className="w-4 h-4 text-blue-600" />
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Slide-over Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col z-10 overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label={`Order Details: ${order.id}`}
              data-testid="order-detail-drawer"
            >
              {/* 1. Drawer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(15,15,30,0.08)] bg-[#FAFAFC] shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-extrabold text-[#0A0A23]">
                    {order.id}
                  </span>
                  <StatusBadge status={order.serverStatus || order.status} />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                    {order.tier} Tier
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#6B6B7B] hover:text-[#0A0A23] hover:bg-black/[0.04] transition-colors"
                  aria-label="Close drawer"
                  data-testid="order-detail-drawer-close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2. Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <OrderActions key={order.id} orderId={order.id} />
                {/* Title & Escrow Guarantee strip */}
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0A0A23] leading-snug">
                    {order.title}
                  </h2>
                  <div className="flex items-center justify-between text-xs text-[#6B6B7B] mt-2 pt-2 border-t border-[rgba(15,15,30,0.06)]">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Order package</span>
                    </span>
                    <span className="font-mono font-bold text-sm text-[#0A0A23]">
                      Total: ${Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Counterpart Card */}
                <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-[rgba(15,15,30,0.08)] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarImage
                      src={counterpart.avatar}
                      name={counterpart.name}
                      size={40}
                      rounded="full"
                      alt={counterpart.name}
                    />
                    <div className="truncate">
                      <span className="text-xs font-bold text-[#0A0A23] block truncate">
                        {counterpart.name}
                      </span>
                      <span className="text-[11px] text-[#6B6B7B] block truncate">
                        {"title" in counterpart
                          ? counterpart.title
                          : "company" in counterpart
                            ? counterpart.company
                            : ""}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/messages"
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white border border-[rgba(15,15,30,0.12)] text-xs font-semibold text-[#0A0A23] hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 shadow-2xs transition-colors shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Message</span>
                  </Link>
                </div>

                {/* Milestone Stepper Timeline */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A23] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Milestone Timeline</span>
                    </h3>
                    <span className="text-[11px] text-[#6B6B7B]">
                      {order.milestones.filter((m) => m.status === "completed").length} of{" "}
                      {order.milestones.length} approved
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {order.milestones.map((milestone, idx) => {
                      const isCompleted = milestone.status === "completed"
                      const isInReview = milestone.status === "in_review"
                      const isInProgress = milestone.status === "in_progress"

                      return (
                        <div
                          key={milestone.id}
                          className={cn(
                            "p-3.5 rounded-xl border transition-all text-xs",
                            isCompleted && "bg-emerald-50/40 border-emerald-200/80",
                            isInReview && "bg-blue-50/60 border-blue-200 shadow-xs",
                            isInProgress && "bg-blue-50/40 border-blue-200",
                            milestone.status === "pending" &&
                              "bg-[#FAFAFC] border-[rgba(15,15,30,0.06)] opacity-70"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 font-semibold">
                              <span
                                className={cn(
                                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0",
                                  isCompleted && "bg-emerald-600 text-white",
                                  isInReview && "bg-blue-600 text-white animate-pulse",
                                  isInProgress && "bg-blue-600 text-white",
                                  milestone.status === "pending" && "bg-gray-200 text-gray-700"
                                )}
                              >
                                {isCompleted ? "✓" : idx + 1}
                              </span>
                              <span className="text-[#0A0A23] truncate">{milestone.title}</span>
                            </div>

                            <span className="font-mono font-bold text-xs text-[#0A0A23] shrink-0">
                              ${Number(milestone.amount).toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[#6B6B7B] pl-7">
                            <span>Due: {milestone.dueDate}</span>
                            <span className="font-medium capitalize text-[10px]">
                              {isCompleted && "✓ Delivery accepted"}
                              {isInReview && "⏳ Client Review Pending"}
                              {isInProgress && "⚡ In Progress"}
                              {milestone.status === "pending" && "Awaiting work"}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Scope & Requirements */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A23] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Project Scope & Requirements</span>
                  </h3>
                  <div className="p-3.5 rounded-xl bg-[#FAFAFC] border border-[rgba(15,15,30,0.06)] text-xs text-[#4B4B5C] leading-relaxed">
                    {order.requirements}
                  </div>
                </div>

                {/* Deliverables List */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A23] flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                    <span>Submitted Deliverable Files ({order.deliveries.length})</span>
                  </h3>

                  {order.deliveries.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-[rgba(15,15,30,0.12)] text-center text-xs text-[#8B8B9B]">
                      No deliverable files submitted yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {order.deliveries.map((del) => (
                        <div
                          key={del.id}
                          className="p-3.5 rounded-xl border border-[rgba(15,15,30,0.08)] bg-white shadow-2xs space-y-2.5"
                        >
                          <div className="flex items-center justify-between text-[11px] text-[#6B6B7B]">
                            <span className="font-semibold text-blue-700">
                              Submission on {del.submittedAt}
                            </span>
                            <span className="font-mono text-[10px]">{del.id}</span>
                          </div>

                          <p className="text-xs text-[#4B4B5C]">{del.note}</p>

                          <div className="space-y-1.5 pt-1">
                            {del.files.map((file, fIdx) => (
                              <div
                                key={fIdx}
                                className="flex items-center justify-between p-2 rounded-lg bg-[#FAFAFC] border border-[rgba(15,15,30,0.06)] text-xs"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {getFileIcon(file.type)}
                                  <span className="font-medium text-[#0A0A23] truncate">
                                    {file.name}
                                  </span>
                                  <span className="text-[10px] text-[#8B8B9B] font-mono">
                                    ({file.size})
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    file.url
                                      ? void downloadUpload(file.url).catch((error: Error) =>
                                          showToast({ title: error.message, type: "error" })
                                        )
                                      : showToast({
                                          title: "No downloadable file reference",
                                          type: "info",
                                        })
                                  }
                                  className="p-1 rounded-md text-[#6B6B7B] hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                  title="Download file"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Revision History (if any) */}
                {order.revisions && order.revisions.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                      <span>Revision Notes ({order.revisions.length})</span>
                    </h3>
                    <div className="space-y-2">
                      {order.revisions.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs text-[#4B4B5C]"
                        >
                          <span className="text-[10px] font-mono text-amber-800 block mb-1">
                            Requested {rev.requestedAt}
                          </span>
                          <p>{rev.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Sticky Bottom Action Bar */}
              <div className="p-4 border-t border-[rgba(15,15,30,0.08)] bg-white shrink-0">
                {isClient ? (
                  /* Client Action Buttons */
                  <div className="flex items-center gap-3">
                    {order.status === "delivered" || activeMilestone?.status === "in_review" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setRevisionDialogOpen(true)}
                          className="h-11 px-4 rounded-xl border border-[rgba(15,15,30,0.12)] text-xs font-semibold text-[#4B4B5C] hover:bg-[#FAFAFC] transition-colors inline-flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Request Revision</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setApproveDialogOpen(true)}
                          className="flex-1 h-11 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold rounded-xl shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept delivery ${activeMilestone?.amount ?? 0}</span>
                        </button>
                      </>
                    ) : order.status === "completed" ? (
                      <div className="w-full text-center text-xs font-semibold text-emerald-700 bg-emerald-50 py-2.5 rounded-xl border border-emerald-200">
                        ✓ Order completed. Settlement is unavailable.
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-between text-xs text-[#6B6B7B]">
                        <span className="flex items-center gap-1 text-blue-600 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Work in progress by specialist</span>
                        </span>
                        <Link
                          href="/dashboard/messages"
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          Check chat thread →
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Freelancer Action Buttons */
                  <div className="flex items-center gap-3">
                    {order.status === "completed" ? (
                      <div className="w-full text-center text-xs font-semibold text-emerald-700 bg-emerald-50 py-2.5 rounded-xl border border-emerald-200">
                        ✓ Order completed! Earnings added to your wallet.
                      </div>
                    ) : order.status === "delivered" || activeMilestone?.status === "in_review" ? (
                      <div className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 text-xs font-medium">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                          <span>Deliverable submitted. Awaiting client approval.</span>
                        </span>
                        <span className="font-mono font-bold">${activeMilestone?.amount ?? 0}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeliverDialogOpen(true)}
                        className="w-full h-11 bg-gradient-to-r from-blue-600 to-sky-600 text-white text-xs font-semibold rounded-xl shadow-md hover:from-blue-700 hover:to-sky-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Deliver Milestone Work (${activeMilestone?.amount ?? 0})</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Confirm Payment Release Dialog */}
      <AnimatePresence>
        {approveDialogOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setApproveDialogOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0A0A23] text-center">
                Approve & Accept delivery?
              </h3>
              <p className="text-xs text-[#6B6B7B] text-center leading-relaxed">
                Accept the submitted delivery for this order. This saves the COMPLETED status; it
                does not release funds or initiate a payout.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApproveDialogOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-[rgba(15,15,30,0.12)] text-xs font-semibold text-[#4B4B5C] hover:bg-[#FAFAFC]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleApproveConfirm()}
                  className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  Confirm acceptance
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Request Revision Dialog */}
      <AnimatePresence>
        {revisionDialogOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRevisionDialogOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            >
              <h3 className="text-base font-bold text-[#0A0A23]">Request Revision</h3>
              <p className="text-xs text-[#6B6B7B]">
                Explain what adjustments or additions are required before milestone approval.
              </p>
              <form onSubmit={(event) => void handleRevisionSubmit(event)} className="space-y-4">
                <textarea
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="e.g. Please update the button hover states and test on Safari mobile..."
                  rows={4}
                  required
                  className="w-full p-3 rounded-xl border border-[rgba(15,15,30,0.12)] text-xs text-[#0A0A23] placeholder-[#8B8B9B] focus:border-blue-600 focus:outline-none"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRevisionDialogOpen(false)}
                    className="flex-1 h-10 rounded-xl border border-[rgba(15,15,30,0.12)] text-xs font-semibold text-[#4B4B5C] hover:bg-[#FAFAFC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    Send Feedback
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Deliver Work Dialog (Freelancer) */}
      <AnimatePresence>
        {deliverDialogOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeliverDialogOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            >
              <h3 className="text-base font-bold text-[#0A0A23]">Deliver Milestone Work</h3>
              <p className="text-xs text-[#6B6B7B]">
                Submit your deliverable files and add delivery notes for{" "}
                <em>&ldquo;{activeMilestone?.title}&rdquo;</em>.
              </p>
              <form onSubmit={(event) => void handleDeliverySubmit(event)} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#0A0A23] block mb-1">
                    Release Notes / Work Summary
                  </label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Describe what has been delivered, git tags, or credentials..."
                    rows={3}
                    required
                    className="w-full p-3 rounded-xl border border-[rgba(15,15,30,0.12)] text-xs text-[#0A0A23] placeholder-[#8B8B9B] focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0A0A23] block mb-1">
                    Attached Deliverable Package
                  </label>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] text-xs">
                    <FileArchive className="w-4 h-4 text-blue-600" />
                    <span className="font-mono text-xs text-[#0A0A23] truncate flex-1">
                      {uploadedFileName}
                    </span>
                    <span className="text-[10px] text-[#8B8B9B]">Not uploaded</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeliverDialogOpen(false)}
                    className="flex-1 h-10 rounded-xl border border-[rgba(15,15,30,0.12)] text-xs font-semibold text-[#4B4B5C] hover:bg-[#FAFAFC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    Submit Deliverable
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
