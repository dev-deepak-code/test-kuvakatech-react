"use client"

import type React from "react"
import { Copy, Check } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  images?: string[]
  timestamp: string
}

interface ChatMessagesProps {
  displayedMessages: Message[]
  isLoading: boolean
  isThinking: boolean
  theme: "light" | "dark"
  user: { phoneNumber: string }
  handleCopy: (text: string, messageId: string) => void
  copiedMessageId: string | null
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  chatContainerRef: React.RefObject<HTMLDivElement | null>
  handleScroll: () => void
  showMessagesSkeleton: boolean
}

export function ChatMessages({
  displayedMessages,
  isLoading,
  isThinking,
  theme,
  user,
  handleCopy,
  copiedMessageId,
  messagesEndRef,
  chatContainerRef,
  handleScroll,
  showMessagesSkeleton,
}: ChatMessagesProps) {
  return (
    <div
      ref={chatContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full"
    >
      {showMessagesSkeleton ? (
        <div className="space-y-4">
          <div className="flex gap-3 justify-start">
            <div
              className={`h-8 w-8 rounded-full ${theme === "dark" ? "bg-brand-secondary-dark" : "bg-brand-secondary"} animate-pulse`}
            ></div>
            <div className="flex-1 space-y-2">
              <div
                className={`h-4 rounded w-3/4 ${theme === "dark" ? "bg-brand-secondary-dark" : "bg-brand-secondary"} animate-pulse`}
              ></div>
              <div
                className={`h-4 rounded w-1/2 ${theme === "dark" ? "bg-brand-secondary-dark" : "bg-brand-secondary"} animate-pulse`}
              ></div>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <div className="flex-1 space-y-2 text-right">
              <div
                className={`h-4 rounded w-3/4 ml-auto ${theme === "dark" ? "bg-brand-secondary-dark" : "bg-brand-secondary"} animate-pulse`}
              ></div>
              <div
                className={`h-4 rounded w-1/2 ml-auto ${theme === "dark" ? "bg-brand-secondary-dark" : "bg-brand-secondary"} animate-pulse`}
              ></div>
            </div>
            <div
              className={`h-8 w-8 rounded-full ${theme === "dark" ? "bg-brand-secondary-dark" : "bg-brand-secondary"} animate-pulse`}
            ></div>
          </div>
          <div className="flex gap-3 justify-start">
            <div
              className={`h-8 w-8 rounded-full ${theme === "dark" ? "bg-brand-secondary-dark" : "bg-brand-secondary"} animate-pulse`}
            ></div>
            <div className="flex-1 space-y-2">
              <div
                className={`h-4 rounded w-full ${theme === "dark" ? "bg-brand-secondary-dark" : "bg-brand-secondary"} animate-pulse`}
              ></div>
              <div
                className={`h-4 rounded w-2/3 ${theme === "dark" ? "bg-brand-secondary-dark" : "bg-brand-secondary"} animate-pulse`}
              ></div>
            </div>
          </div>
        </div>
      ) : displayedMessages.length === 0 && !isLoading && !isThinking ? (
        <div className={`text-center py-8 ${theme === "dark" ? "text-text-secondary-dark" : "text-text-secondary"}`}>
          <svg
            className={`h-16 w-16 mx-auto mb-4 opacity-50 ${theme === "dark" ? "text-text-secondary-dark" : "text-brand-primary"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
          <p
            className={`text-2xl font-semibold mb-2 ${theme === "dark" ? "text-text-primary-dark" : "text-text-primary"}`}
          >
            Hello {user.phoneNumber}!
          </p>
          <p className="mb-6 text-lg">Start a conversation with the AI assistant!</p>
        </div>
      ) : (
        displayedMessages.map((message) => (
          <div
            key={message.id}
            id={message.id}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-brand-primary-dark text-white">
                <div className="flex h-full w-full items-center justify-center">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}

            <div
              className={`group relative max-w-[70%] rounded-2xl p-3 text-base ${
                message.role === "user"
                  ? "bg-brand-primary text-primary-foreground rounded-br-none"
                  : `${theme === "dark" ? "bg-brand-secondary-dark text-text-primary-dark border-border-dark" : "bg-brand-secondary text-text-primary border-border-light"} rounded-bl-none border`
              }`}
            >
              {message.images && message.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {message.images.map((imgSrc, index) => (
                    <img
                      key={index}
                      src={imgSrc || "/placeholder.svg"}
                      alt={`Uploaded image ${index + 1}`}
                      className="w-full h-full object-cover max-h-32 rounded-md"
                    />
                  ))}
                </div>
              )}
              {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
              <div
                className={`text-xs mt-1 ${message.role === "user" ? "text-white/70" : theme === "dark" ? "text-text-secondary-dark" : "text-text-secondary"}`}
              >
                {message.timestamp}
              </div>
              {message.role === "assistant" && message.content && (
                <button
                  onClick={() => handleCopy(message.content, message.id)}
                  className={`absolute top-1 right-1 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                    theme === "dark"
                      ? "bg-gray-700 text-text-secondary-dark hover:bg-gray-600"
                      : "bg-brand-secondary text-text-secondary hover:bg-brand-secondary-dark"
                  }`}
                  aria-label="Copy message"
                >
                  {copiedMessageId === message.id ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>

            {message.role === "user" && (
              <div className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-brand-primary-dark text-white">
                <div className="flex h-full w-full items-center justify-center">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {isThinking && (
        <div className="flex gap-3 justify-start">
          <div className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-brand-primary-dark text-white">
            <div className="h-full w-full flex items-center justify-center">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div
            className={`${theme === "dark" ? "bg-brand-secondary-dark border-border-dark text-text-primary-dark" : "bg-brand-secondary border-border-light text-text-secondary"} rounded-2xl p-3 text-base`}
          >
            Gemini is typing...
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
