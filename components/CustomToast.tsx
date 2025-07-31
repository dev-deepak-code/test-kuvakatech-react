interface CustomToastProps {
  show: boolean
  message: string
  type: "success" | "error"
}

export function CustomToast({ show, message, type }: CustomToastProps) {
  if (!show) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-3 rounded-md shadow-lg text-white ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {message}
    </div>
  )
}
