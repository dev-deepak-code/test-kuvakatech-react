"use client"

import { useEffect, useRef } from "react"

interface DeleteConfirmationModalProps {
  show: boolean
  onCancel: () => void
  onConfirm: () => void
  theme: "light" | "dark"
}

export function DeleteConfirmationModal({ show, onCancel, onConfirm, theme }: DeleteConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!show) return

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as NodeListOf<HTMLElement> | undefined

    const firstFocusable = focusableElements?.[0]
    const lastFocusable = focusableElements?.[focusableElements.length - 1]

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel()
      } else if (event.key === "Tab") {
        if (event.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable?.focus()
            event.preventDefault()
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable?.focus()
            event.preventDefault()
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    setTimeout(() => confirmButtonRef.current?.focus(), 0)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [show, onCancel])

  if (!show) return null

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-deletion-title"
      ref={modalRef}
    >
      <div
        className={`p-6 rounded-lg shadow-xl max-w-sm w-full ${theme === "dark" ? "bg-card-dark border border-border-dark text-text-primary-dark" : "bg-card-light border border-border-light text-text-primary"}`}
      >
        <h3 id="confirm-deletion-title" className="text-lg font-semibold mb-4">
          Confirm Deletion
        </h3>
        <p className={`text-sm mb-6 ${theme === "dark" ? "text-text-secondary-dark" : "text-text-secondary"}`}>
          Are you sure you want to delete this chat? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            ref={cancelButtonRef}
            className={`px-4 py-2 rounded-md text-sm font-medium border ${theme === "dark" ? "border-border-dark bg-card-dark text-text-primary-dark hover:bg-brand-secondary-dark" : "border-border-light bg-card-light text-text-primary hover:bg-brand-secondary"}`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            ref={confirmButtonRef}
            className="px-4 py-2 rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
