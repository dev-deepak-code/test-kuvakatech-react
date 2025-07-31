export async function POST(req: Request) {
  const { messages } = await req.json()

  const lastMessage = messages[messages.length - 1]?.content || ""

  let response = ""
  if (lastMessage.toLowerCase().includes("hello") || lastMessage.toLowerCase().includes("hi")) {
    response = "Hello! How can I help you today?"
  } else if (lastMessage.toLowerCase().includes("weather")) {
    response =
      "I'm a simple AI assistant. I don't have access to real-time weather data, but I can help with general questions!"
  } else if (lastMessage.toLowerCase().includes("time")) {
    response = `The current time is ${new Date().toLocaleTimeString()}`
  } else if (lastMessage.toLowerCase().includes("date")) {
    response = `Today's date is ${new Date().toLocaleDateString()}`
  } else {
    response = `I understand you said: "${lastMessage}". I'm a simple AI assistant. How can I help you further?`
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      const words = response.split(" ")
      let index = 0

      const interval = setInterval(() => {
        if (index < words.length) {
          const chunk = index === 0 ? words[index] : " " + words[index]
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          index++
        } else {
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()
          clearInterval(interval)
        }
      }, 100)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
