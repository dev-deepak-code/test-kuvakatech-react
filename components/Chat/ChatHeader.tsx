interface ChatHeaderProps {
  user: { phoneNumber: string }
  theme: "light" | "dark"
}

export function ChatHeader({ user, theme }: ChatHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 border-b ${theme === "dark" ? "border-border-dark" : "border-border-light"}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand-primary-dark text-white">
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div>
          <h2 className={`font-semibold text-lg ${theme === "dark" ? "text-text-primary-dark" : "text-text-primary"}`}>
            AI Chat Assistant
          </h2>
          <p className={`text-sm ${theme === "dark" ? "text-text-secondary-dark" : "text-text-secondary"}`}>
            {user.phoneNumber}
          </p>
        </div>
      </div>
    </div>
  )
}
