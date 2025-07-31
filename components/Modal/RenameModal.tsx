"use client"

import { useEffect, useRef } from "react"

interface RenameModalProps {
  show: boolean
  title: string
  onTitleChange: (title: string) => void
  onCancel: () => void
  onSave: () => void
  theme: "light" | "dark"
}

export function RenameModal({ show, title, onTitleChange, onCancel, onSave, theme }: RenameModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

    setTimeout(() => inputRef.current?.focus(), 0)

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
      aria-labelledby="rename-chat-title"
      ref={modalRef}
    >
      <div
        className={`p-6 rounded-lg shadow-xl max-w-sm w-full ${theme === "dark" ? "bg-card-dark border border-border-dark text-text-primary-dark" : "bg-card-light border border-border-light text-text-primary"}`}
      >
        <h3 id="rename-chat-title" className="text-lg font-semibold mb-4">
          Rename Chat
        </h3>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter new chat title"
          ref={inputRef}
          className={`w-full px-3 py-2 border rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-brand-primary ${theme === "dark" ? "bg-brand-secondary-dark border-border-dark text-text-primary-dark" : "bg-card-light border-border-light text-text-primary"}`}
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className={`px-4 py-2 rounded-md text-sm font-medium border ${theme === "dark" ? "border-border-dark bg-card-dark text-text-primary-dark hover:bg-brand-secondary-dark" : "border-border-light bg-card-light text-text-primary hover:bg-brand-secondary"}`}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-md text-sm font-medium bg-brand-primary text-primary-foreground hover:bg-brand-primary-dark"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
