"use client"

import * as React from "react"

/** Contain keyboard focus in an open dialog and return it to the opener. */
export function useDialogFocus(
  open: boolean,
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void
) {
  const closeRef = React.useRef(onClose)
  React.useEffect(() => {
    closeRef.current = onClose
  }, [onClose])
  React.useEffect(() => {
    if (!open || !ref.current) return
    const dialog = ref.current
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const elements = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
        )
      ).filter((el) => el.getClientRects().length > 0)
    ;(elements()[0] || dialog).focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        event.preventDefault()
        closeRef.current()
      }
      if (event.key !== "Tab") return
      const items = elements()
      const first = items[0],
        last = items[items.length - 1]
      if (!first) {
        event.preventDefault()
        dialog.focus()
        return
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault()
        last?.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", keydown)
    return () => {
      document.removeEventListener("keydown", keydown)
      document.body.style.overflow = overflow
      if (previous?.isConnected) previous.focus()
    }
  }, [open, ref])
}
