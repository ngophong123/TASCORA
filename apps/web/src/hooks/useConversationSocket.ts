"use client"
import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { io } from "socket.io-client"
import { getApiUrl } from "@/lib/api-url"
import { refreshSession } from "@/lib/auth-client"
export function useConversationSocket(
  userId: string | undefined,
  conversationId: string,
  invalidate: Dispatch<SetStateAction<number>>
) {
  const [status, setStatus] = useState("Connecting realtime…")
  useEffect(() => {
    if (!userId || !conversationId) return
    let active = true,
      recovering = false
    const socket = io(getApiUrl(), {
      withCredentials: true,
      auth: (callback) => callback({ token: localStorage.getItem("token") || "" }),
    })
    async function recoverAuthentication() {
      if (!active || recovering) return
      recovering = true
      try {
        if ((await refreshSession()) && active) socket.connect()
        else if (active) setStatus("Sign in to reconnect realtime.")
      } catch {
        if (active) setStatus("Realtime unavailable; persisted history will refresh.")
      } finally {
        recovering = false
      }
    }
    socket.on("connect", () => {
      setStatus("Realtime connected")
      socket.emit("join_conversation", conversationId)
      invalidate((n) => n + 1)
    })
    socket.on("new_message", () => {
      invalidate((n) => n + 1)
      window.dispatchEvent(new Event("notifications-updated"))
    })
    socket.on("message_read", () => invalidate((n) => n + 1))
    socket.on("disconnect", (reason) => {
      if (active) setStatus("Reconnecting realtime; persisted history will refresh.")
      if (reason === "io server disconnect") void recoverAuthentication()
    })
    socket.on("connect_error", (error) => {
      if (active) setStatus("Realtime unavailable; persisted history will refresh.")
      if (error.message === "Authentication error") void recoverAuthentication()
    })
    return () => {
      active = false
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [userId, conversationId, invalidate])
  return status
}
