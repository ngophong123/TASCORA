"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import {
  Search,
  Send,
  Paperclip,
  CheckCheck,
  ShieldCheck,
  ArrowLeft,
  ShoppingBag,
  Clock,
  Sparkles,
  FileCode,
  FileText,
  Archive,
  Download,
  ChevronRight,
  Info,
  Smile,
  X,
  Star,
  ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  requestData,
  jsonRequest,
  imageUrl,
  profileName,
  uploadFile,
  downloadUpload,
  type Profile,
} from "@/lib/marketplace"
import { useConversationSocket } from "@/hooks/useConversationSocket"
import { ApiState } from "@/components/feedback/ApiState"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { useDashboard } from "@/context/DashboardContext"
import { type Conversation, type ChatMessage } from "@/data/dashboard/messages"

function MessagesContent() {
  const searchParams = useSearchParams()
  const orderParam = searchParams.get("orderId")
  const { showToast, account } = useDashboard()
  const sellerParam = searchParams.get("seller") || searchParams.get("contact")
  const [conversations, setConversations] = React.useState<Conversation[]>([])
  const [selectedConvId, setSelectedConvId] = React.useState("")
  const [realtimeRevision, setRealtimeRevision] = React.useState(0)
  const realtimeStatus = useConversationSocket(account?.id, selectedConvId, setRealtimeRevision)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const [attachment, setAttachment] = React.useState("")
  const [searchFilter, setSearchFilter] = React.useState("")
  const [tabFilter, setTabFilter] = React.useState<"all" | "unread">("all")
  const [inputText, setInputText] = React.useState("")
  const isTyping = false
  const [showOrderContext, setShowOrderContext] = React.useState(true)
  const [mobileActivePane, setMobileActivePane] = React.useState<"list" | "chat">("list")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  interface StoredMessage {
    id: string
    senderId: string
    content: string
    createdAt: string
    isRead: boolean
    attachmentUrl: string | null
  }
  interface StoredConversation {
    id: string
    participant1Id: string
    participant2Id: string
    participant1: { id: string; buyerProfile: Profile | null; sellerProfile: Profile | null }
    participant2: { id: string; buyerProfile: Profile | null; sellerProfile: Profile | null }
    unreadCount1: number
    unreadCount2: number
    messages: StoredMessage[]
    order: {
      id: string
      status: string
      amount: string
      deliveryDate: string | null
      service: { title: string }
      package: { type: "BASIC" | "STANDARD" | "PREMIUM" }
    } | null
  }
  const mapMessage = React.useCallback(
    (message: StoredMessage): ChatMessage => ({
      id: message.id,
      senderId: message.senderId === account?.id ? "me" : message.senderId,
      senderName:
        message.senderId === account?.id
          ? profileName(account?.buyerProfile || account?.sellerProfile)
          : "Member",
      content: message.content,
      time: new Date(message.createdAt).toLocaleTimeString(),
      date: new Date(message.createdAt).toLocaleDateString(),
      read: message.isRead,
      attachments: message.attachmentUrl
        ? [
            {
              id: message.id,
              name: message.attachmentUrl.split("/").pop() || "Attachment",
              size: "",
              type: "pdf",
              url: message.attachmentUrl,
            },
          ]
        : [],
    }),
    [account]
  )
  React.useEffect(() => {
    if (!account) return
    const controller = new AbortController()
    let created = false
    async function load() {
      try {
        let opened = ""
        if (!created && (orderParam || sellerParam)) {
          const conversation = await requestData<{ id: string }>(
            "/api/v1/marketplace/conversations",
            jsonRequest("POST", orderParam ? { orderId: orderParam } : { sellerId: sellerParam })
          )
          opened = conversation.id
          created = true
        }
        const stored = await requestData<StoredConversation[]>("/api/v1/messages/conversations", {
          signal: controller.signal,
        })
        if (controller.signal.aborted) return
        setConversations((prev) =>
          stored.map((c) => {
            const isOne = c.participant1Id === account!.id
            const participant = isOne ? c.participant2 : c.participant1
            const profile = participant.sellerProfile || participant.buyerProfile
            return {
              id: c.id,
              partner: {
                id: participant.id,
                name: profileName(profile),
                title: profile?.professionalTitle || "",
                avatar: imageUrl(profile?.avatar),
                online: false,
                lastSeen: "Presence unavailable",
                rating: profile?.ratingAverage || 0,
                reviewsCount: profile?.ratingCount || 0,
                responseTime: "Unavailable",
              },
              order: {
                id: c.order?.id || "",
                title: c.order?.service.title || "Direct conversation",
                category: "",
                tier: c.order?.package.type || "BASIC",
                amount: c.order?.amount || "",
                escrowAmount: "Unavailable",
                status:
                  c.order?.status === "COMPLETED"
                    ? "completed"
                    : c.order?.status === "DELIVERED"
                      ? "delivered"
                      : "active",
                dueDate: c.order?.deliveryDate || "",
                milestoneSummary: {
                  total: 0,
                  completed: 0,
                  currentTitle: c.order?.status || "",
                  currentAmount: "",
                },
                sharedFiles: [],
              },
              lastMessage: c.messages[0]?.content || "",
              lastMessageTime: c.messages[0]
                ? new Date(c.messages[0].createdAt).toLocaleString()
                : "",
              unreadCount: isOne ? c.unreadCount1 : c.unreadCount2,
              messages: prev.find((p) => p.id === c.id)?.messages || [],
            }
          })
        )
        if (opened) setSelectedConvId(opened)
        else
          setSelectedConvId((prev) =>
            stored.some((c) => c.id === prev) ? prev : stored[0]?.id || ""
          )
        setError("")
      } catch (error) {
        if (!controller.signal.aborted) {
          setConversations([])
          setError(error instanceof Error ? error.message : "Chat unavailable.")
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    const timer = setInterval(() => void load(), 5000)
    return () => {
      controller.abort()
      clearInterval(timer)
    }
  }, [account, orderParam, sellerParam, realtimeRevision])
  React.useEffect(() => {
    if (!selectedConvId || !account) return
    const controller = new AbortController()
    async function loadHistory() {
      try {
        const messages: StoredMessage[] = []
        for (let skip = 0; ; skip += 100) {
          const batch = await requestData<StoredMessage[]>(
            `/api/v1/messages/${selectedConvId}?skip=${skip}&take=100`,
            { signal: controller.signal }
          )
          messages.push(...batch)
          if (batch.length < 100) break
        }
        const unreadIds = messages
          .filter((message) => !message.isRead && message.senderId !== account?.id)
          .map((message) => message.id)
        for (let offset = 0; offset < unreadIds.length; offset += 100)
          await requestData(`/api/v1/marketplace/conversations/${selectedConvId}/read`, {
            ...jsonRequest("POST", { messageIds: unreadIds.slice(offset, offset + 100) }),
            signal: controller.signal,
          })
        if (!controller.signal.aborted)
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedConvId
                ? { ...c, messages: messages.map(mapMessage), unreadCount: 0 }
                : c
            )
          )
      } catch (error) {
        if (!controller.signal.aborted)
          setError(error instanceof Error ? error.message : "Message history unavailable.")
      }
    }
    void loadHistory()
    const timer = setInterval(() => void loadHistory(), 5000)
    return () => {
      controller.abort()
      clearInterval(timer)
    }
  }, [selectedConvId, account, mapMessage, realtimeRevision])
  const activeConv = conversations.find((c) => c.id === selectedConvId)
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeConv?.messages])
  const handleSelectConv = (id: string) => {
    setSelectedConvId(id)
    setMobileActivePane("chat")
  }
  const handleSendMessage = async (event?: React.FormEvent) => {
    event?.preventDefault()
    if (!inputText.trim() || sending || !selectedConvId) return
    setSending(true)
    setError("")
    try {
      const message = await requestData<StoredMessage>(
        "/api/v1/messages",
        jsonRequest("POST", {
          conversationId: selectedConvId,
          content: inputText.trim(),
          ...(attachment ? { attachmentUrl: attachment } : {}),
        })
      )
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvId
            ? {
                ...c,
                messages: [...c.messages.filter((m) => m.id !== message.id), mapMessage(message)],
                lastMessage: message.content,
              }
            : c
        )
      )
      setInputText("")
      setAttachment("")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Message send failed.")
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSendMessage()
    }
  }

  const handleDownloadFile = (fileName: string, size: string) => {
    void size
    const file = activeConv?.messages
      .flatMap((m) => m.attachments || [])
      .find((f) => f.name === fileName)
    if (file?.url)
      void downloadUpload(file.url).catch((error: Error) =>
        showToast({ title: error.message, type: "error" })
      )
  }

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.partner.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.order.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.order.id.toLowerCase().includes(searchFilter.toLowerCase())
    if (tabFilter === "unread") {
      return matchesSearch && c.unreadCount > 0
    }
    return matchesSearch
  })

  const getFileIcon = (type: string) => {
    switch (type) {
      case "code":
        return <FileCode className="h-4 w-4 text-blue-600 shrink-0" />
      case "pdf":
        return <FileText className="h-4 w-4 text-rose-500 shrink-0" />
      case "zip":
        return <Archive className="h-4 w-4 text-amber-500 shrink-0" />
      default:
        return <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
    }
  }

  if (loading || error || !activeConv)
    return (
      <ApiState
        loading={loading}
        error={error}
        retry={() => window.location.reload()}
        empty="No conversations yet. Open a service or an order to contact the other participant."
      />
    )
  return (
    <div className="space-y-6">
      <p role="status" className="text-xs text-slate-500">
        {realtimeStatus}
      </p>
      <label className="block text-xs">
        Chat attachment (private to this conversation)
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          disabled={sending}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              setSending(true)
              void uploadFile(file)
                .then(setAttachment)
                .catch((error: Error) => setError(error.message))
                .finally(() => setSending(false))
            }
          }}
        />
        {attachment && <span>Attachment ready</span>}
      </label>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[#0A0A23]">
              Messages & Workspace
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Private conversation
            </span>
          </div>
          <p className="text-sm text-[#4B4B5C] mt-1">
            Persisted messages and shared attachments with your conversation participant.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOrderContext((prev) => !prev)}
            className="hidden lg:flex items-center gap-1.5 text-xs text-[#4B4B5C] border-[rgba(15,15,30,0.12)] hover:bg-[#F4F4F8]"
          >
            <Info className="h-3.5 w-3.5" />
            <span>{showOrderContext ? "Hide Contract Panel" : "Show Contract Panel"}</span>
          </Button>

          <Link href="/dashboard/orders">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 text-xs text-[#4B4B5C] border-[rgba(15,15,30,0.12)] hover:bg-[#F4F4F8]"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-blue-600" />
              <span>All Orders</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 3-Pane Inbox Card Container */}
      <div className="bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col md:flex-row h-[calc(100dvh-210px)] min-h-[420px] md:min-h-[560px] relative">
        {/* PANE 1: Conversation List */}
        <div
          className={`w-full md:w-[320px] lg:w-[340px] shrink-0 border-r border-[rgba(15,15,30,0.08)] flex flex-col bg-white ${
            mobileActivePane === "chat" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search Contacts & Filter Tabs */}
          <div className="p-4 border-b border-[rgba(15,15,30,0.08)] space-y-3 bg-[#FAFAFC]/60">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B7B]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                aria-label="Search conversations or order ID"
                placeholder="Search dialogue or order ID..."
                className="w-full min-h-11 rounded-xl border border-[rgba(15,15,30,0.12)] bg-white pl-9 pr-3 py-1.5 text-xs text-[#0A0A23] placeholder:text-[#6B6B7B] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#F4F4F8] p-1 rounded-lg">
              <button
                aria-pressed={tabFilter === "all"}
                onClick={() => setTabFilter("all")}
                className={`flex-1 min-h-11 text-xs font-medium py-1 px-2 rounded-md transition-all ${
                  tabFilter === "all"
                    ? "bg-white text-[#0A0A23] shadow-sm"
                    : "text-[#6B6B7B] hover:text-[#0A0A23]"
                }`}
              >
                All Chats ({conversations.length})
              </button>
              <button
                aria-pressed={tabFilter === "unread"}
                onClick={() => setTabFilter("unread")}
                className={`flex-1 min-h-11 text-xs font-medium py-1 px-2 rounded-md transition-all ${
                  tabFilter === "unread"
                    ? "bg-white text-[#0A0A23] shadow-sm"
                    : "text-[#6B6B7B] hover:text-[#0A0A23]"
                }`}
              >
                Unread ({conversations.filter((c) => c.unreadCount > 0).length})
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[rgba(15,15,30,0.04)]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6B6B7B]">
                No active conversations found.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConvId
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConv(conv.id)}
                    data-testid={`conversation-item-${conv.id}`}
                    className={`w-full text-left p-4 transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? "bg-blue-50/70 border-l-[3px] border-blue-600"
                        : "hover:bg-[#FAFAFC] border-l-[3px] border-transparent"
                    }`}
                  >
                    {/* Avatar & Online Dot */}
                    <div className="relative shrink-0">
                      <img
                        src={conv.partner.avatar}
                        alt={conv.partner.name}
                        className="h-10 w-10 rounded-full object-cover border border-[rgba(15,15,30,0.08)] shadow-sm"
                      />
                      {conv.partner.online && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                      )}
                    </div>

                    {/* Summary */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`text-xs font-semibold truncate ${
                            isSelected ? "text-blue-900" : "text-[#0A0A23]"
                          }`}
                        >
                          {conv.partner.name}
                        </span>
                        <span className="text-[10px] text-[#6B6B7B] shrink-0 ml-1">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      {/* Order Tag */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#F4F4F8] text-[#4B4B5C]">
                          {conv.order.id}
                        </span>
                        <span className="text-[10px] font-mono text-[#6B6B7B]">
                          {conv.order.amount}
                        </span>
                      </div>

                      <p className="text-xs text-[#4B4B5C] truncate">{conv.lastMessage}</p>
                    </div>

                    {/* Unread badge */}
                    {conv.unreadCount > 0 && (
                      <span className="h-4 min-w-4 px-1 rounded-full bg-blue-600 text-[10px] text-white font-bold flex items-center justify-center shrink-0 self-center shadow-sm">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* PANE 2: Chat Thread (Center) */}
        <div
          className={`flex-1 flex flex-col min-w-0 bg-[#FAFAFC] ${
            mobileActivePane === "list" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Thread Header */}
          <div className="p-3.5 sm:p-4 border-b border-[rgba(15,15,30,0.08)] bg-white flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3 min-w-0">
              {/* Back button on mobile */}
              <button
                aria-label="Back to conversations"
                onClick={() => setMobileActivePane("list")}
                className="md:hidden flex h-11 w-11 shrink-0 items-center justify-center -ml-1 text-[#6B6B7B] hover:text-[#0A0A23] hover:bg-[#F4F4F8] rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              {/* Avatar & Info */}
              <div className="relative shrink-0">
                <img
                  src={activeConv.partner.avatar}
                  alt={activeConv.partner.name}
                  className="h-10 w-10 rounded-full object-cover border border-[rgba(15,15,30,0.08)]"
                />
                {activeConv.partner.online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-[#0A0A23] truncate">
                    {activeConv.partner.name}
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-0.5 text-[11px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    {activeConv.partner.rating}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#6B6B7B]">
                  <span>{activeConv.partner.title}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium">
                    {activeConv.partner.lastSeen || "Active now"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOrderContext((prev) => !prev)}
                className="h-8 px-2 text-xs text-[#4B4B5C] hover:text-[#0A0A23] hover:bg-[#F4F4F8] lg:hidden flex items-center gap-1"
              >
                <Info className="h-4 w-4 text-blue-600" />
                <span className="hidden sm:inline">Order Info</span>
              </Button>

              <Link href={`/dashboard/orders?orderId=${activeConv.order.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs text-[#4B4B5C] border-[rgba(15,15,30,0.12)] hover:bg-[#F4F4F8] hidden sm:flex items-center gap-1"
                >
                  <span>Order {activeConv.order.id}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#6B6B7B]" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Security Escrow Notice */}
            <div className="mx-auto max-w-md bg-white border border-[rgba(15,15,30,0.08)] rounded-xl p-3 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-700">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Attachments are shared with conversation participants</span>
              </div>
              <p className="text-[11px] text-[#6B6B7B] mt-0.5">
                Payment settlement, escrow release, refunds and payouts are unavailable.
              </p>
            </div>

            {/* Messages Loop */}
            {activeConv.messages.map((msg) => {
              const isMe = msg.senderId === "me"
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    data-testid="chat-message-bubble"
                    className={`rounded-2xl px-4 py-3 max-w-[88%] sm:max-w-[72%] shadow-sm space-y-2 ${
                      isMe
                        ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-tr-sm"
                        : "bg-white text-[#0A0A23] border border-[rgba(15,15,30,0.08)] rounded-tl-sm"
                    }`}
                  >
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>

                    {/* Attachment Chips inside bubble */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="pt-1.5 space-y-1.5">
                        {msg.attachments.map((att) => (
                          <div
                            key={att.id}
                            className={`flex items-center justify-between gap-3 p-2 rounded-xl text-xs transition-colors ${
                              isMe
                                ? "bg-white/15 hover:bg-white/25 text-white"
                                : "bg-[#F4F4F8] hover:bg-[#EAEAEA] text-[#0A0A23]"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {getFileIcon(att.type)}
                              <span className="font-mono text-[11px] truncate font-medium">
                                {att.name}
                              </span>
                              <span
                                className={`text-[10px] font-mono shrink-0 ${
                                  isMe ? "text-blue-200" : "text-[#6B6B7B]"
                                }`}
                              >
                                ({att.size})
                              </span>
                            </div>

                            <button
                              onClick={() => handleDownloadFile(att.name, att.size)}
                              title="Download deliverable"
                              className={`p-1 rounded hover:opacity-80 transition-opacity shrink-0 ${
                                isMe ? "text-white" : "text-blue-600"
                              }`}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Time & Read Status */}
                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] pt-0.5 ${
                        isMe ? "text-blue-200" : "text-[#6B6B7B]"
                      }`}
                    >
                      <span>{msg.time}</span>
                      {isMe && <CheckCheck className="h-3.5 w-3.5 text-blue-200" />}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-2">
                <img
                  src={activeConv.partner.avatar}
                  alt={activeConv.partner.name}
                  className="h-6 w-6 rounded-full object-cover border border-[rgba(15,15,30,0.08)] mt-1"
                />
                <div className="bg-white border border-[rgba(15,15,30,0.08)] rounded-2xl rounded-tl-sm px-3.5 py-2 text-xs text-[#4B4B5C] flex items-center gap-2 shadow-sm">
                  <span>{activeConv.partner.name} is typing</span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Composer Area */}
          <div className="p-3 sm:p-4 bg-white border-t border-[rgba(15,15,30,0.08)]">
            <form onSubmit={(event) => void handleSendMessage(event)} className="space-y-2">
              <div className="relative rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] focus-within:bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Message"
                  data-testid="message-input"
                  rows={2}
                  placeholder={`Write a message to ${activeConv.partner.name}... (Enter to send, Shift+Enter for newline)`}
                  className="w-full bg-transparent p-3 text-xs sm:text-sm text-[#0A0A23] placeholder:text-[#6B6B7B] resize-none outline-none"
                />

                {/* Bottom Composer Toolbar */}
                <div className="flex items-center justify-between px-3 py-2 border-t border-[rgba(15,15,30,0.04)]">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        showToast({
                          title: "Attach File",
                          message:
                            "Use the chat attachment control to share a file with this conversation.",
                          type: "info",
                        })
                      }
                      aria-label="Attach file or code"
                      title="Attach file or code"
                      className="flex h-11 w-11 items-center justify-center text-[#6B6B7B] hover:text-[#0A0A23] hover:bg-[#EFEFF4] rounded-lg transition-colors"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        showToast({
                          title: "Quick Template",
                          message: "Quick response templates are not available yet.",
                          type: "info",
                        })
                      }
                      aria-label="Insert quick response"
                      title="Insert quick response"
                      className="flex h-11 w-11 items-center justify-center text-[#6B6B7B] hover:text-[#0A0A23] hover:bg-[#EFEFF4] rounded-lg transition-colors"
                    >
                      <Sparkles className="h-4 w-4 text-blue-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        showToast({
                          title: "Emoji Reaction",
                          message: "Emoji tools are not available yet.",
                          type: "info",
                        })
                      }
                      aria-label="Add emoji"
                      title="Add emoji"
                      className="flex h-11 w-11 items-center justify-center text-[#6B6B7B] hover:text-[#0A0A23] hover:bg-[#EFEFF4] rounded-lg transition-colors"
                    >
                      <Smile className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#6B6B7B] hidden sm:inline">
                      Press{" "}
                      <kbd className="px-1 py-0.5 bg-[#EFEFF4] rounded text-[9px] font-mono">↵</kbd>{" "}
                      to send
                    </span>

                    <Button
                      type="submit"
                      size="sm"
                      disabled={!inputText.trim()}
                      data-testid="send-message-btn"
                      className="h-8 px-3.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-lg shadow-sm font-medium text-xs flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <span>Send</span>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* PANE 3: Order Context Panel (Right) */}
        {showOrderContext && Boolean(activeConv.order.id) && (
          <div className="w-full lg:w-[320px] xl:w-[340px] shrink-0 border-l border-[rgba(15,15,30,0.08)] bg-white flex flex-col overflow-y-auto max-h-full">
            {/* Context Panel Header */}
            <div className="p-4 border-b border-[rgba(15,15,30,0.08)] flex items-center justify-between bg-[#FAFAFC]/60">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0A0A23]">
                  Contract Context
                </h3>
              </div>
              <button
                aria-label="Close order context"
                onClick={() => setShowOrderContext(false)}
                className="flex h-11 w-11 items-center justify-center text-[#6B6B7B] hover:text-[#0A0A23] rounded-lg hover:bg-[#F4F4F8] transition-colors lg:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-5 flex-1">
              {/* Counterpart Card */}
              <div className="bg-[#FAFAFC] border border-[rgba(15,15,30,0.08)] rounded-xl p-3.5 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={activeConv.partner.avatar}
                    alt={activeConv.partner.name}
                    className="h-11 w-11 rounded-full object-cover border border-[rgba(15,15,30,0.1)] shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-[#0A0A23] truncate">
                      {activeConv.partner.name}
                    </h4>
                    <p className="text-[11px] text-[#6B6B7B] truncate">
                      {activeConv.partner.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        {activeConv.partner.rating}
                      </span>
                      <span className="text-[10px] text-[#6B6B7B]">
                        ({activeConv.partner.reviewsCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[rgba(15,15,30,0.06)] text-[11px]">
                  <div>
                    <span className="text-[#6B6B7B] block text-[10px]">Response Time</span>
                    <span className="font-medium text-[#0A0A23]">
                      {activeConv.partner.responseTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B6B7B] block text-[10px]">Badge Status</span>
                    <span className="font-medium text-blue-700">
                      {activeConv.partner.level === "TOP_RATED" ? "Top Rated" : "Unavailable"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Order Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0A0A23]">Active Order</span>
                  <StatusBadge status={activeConv.order.status} size="sm" />
                </div>

                <div className="p-3 bg-white border border-[rgba(15,15,30,0.08)] rounded-xl space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-blue-700">
                      {activeConv.order.id}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {activeConv.order.tier} Tier
                    </span>
                  </div>

                  <p className="text-xs font-medium text-[#0A0A23] line-clamp-2">
                    {activeConv.order.title}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[rgba(15,15,30,0.04)] text-xs">
                    <span className="text-[#6B6B7B]">Contract Value:</span>
                    <span className="font-mono font-bold text-[#0A0A23]">
                      {activeConv.order.amount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B6B7B]">Delivery Deadline:</span>
                    <span className="font-medium text-amber-700 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activeConv.order.dueDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Milestone Progress */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0A0A23]">Milestone Progress</span>
                  <span className="font-mono font-medium text-blue-700">
                    {activeConv.order.milestoneSummary.completed}/
                    {activeConv.order.milestoneSummary.total} Completed
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-[#EFEFF4] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-sky-600 rounded-full transition-all"
                    style={{
                      width: `${(activeConv.order.milestoneSummary.completed / activeConv.order.milestoneSummary.total) * 100}%`,
                    }}
                  />
                </div>

                <div className="bg-[#FAFAFC] p-2.5 rounded-lg border border-[rgba(15,15,30,0.06)] space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[#0A0A23]">Current Stage</span>
                    <span className="font-mono text-emerald-600 font-semibold">
                      {activeConv.order.milestoneSummary.currentAmount}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4B4B5C]">
                    {activeConv.order.milestoneSummary.currentTitle}
                  </p>
                </div>
              </div>

              {/* Deliverable Files Shared */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0A0A23]">Shared Deliverables</span>
                  <span className="text-[10px] text-[#6B6B7B]">
                    {activeConv.order.sharedFiles.length} files
                  </span>
                </div>

                <div className="space-y-1.5">
                  {activeConv.order.sharedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-[rgba(15,15,30,0.06)] bg-white hover:bg-[#FAFAFC] transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {getFileIcon(file.type)}
                        <span className="truncate font-mono text-[11px] text-[#0A0A23]">
                          {file.name}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDownloadFile(file.name, file.size)}
                        title="Download file"
                        className="flex h-11 w-11 items-center justify-center text-[#6B6B7B] hover:text-blue-600 rounded transition-colors shrink-0"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Context Actions */}
              <div className="pt-2 space-y-2">
                <Link href={`/dashboard/orders?orderId=${activeConv.order.id}`} className="w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-medium text-[#0A0A23] border-[rgba(15,15,30,0.12)] hover:bg-[#F4F4F8] flex items-center justify-center gap-1.5"
                  >
                    <span>View Order In Workspace</span>
                    <ChevronRight className="h-3.5 w-3.5 text-[#6B6B7B]" />
                  </Button>
                </Link>

                <Button
                  size="sm"
                  disabled
                  className="w-full text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  Milestone settlement unavailable
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="h-[600px] w-full flex items-center justify-center text-xs text-[#6B6B7B] bg-white rounded-2xl border border-[rgba(15,15,30,0.08)]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
            <span>Loading workspace communications...</span>
          </div>
        </div>
      }
    >
      <MessagesContent />
    </React.Suspense>
  )
}
