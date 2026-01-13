export const config = { runtime: "nodejs" }

import WebSocket from "ws"

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).end()
    return
  }

  const dgKey = process.env.DEEPGRAM_API_KEY
  if (!dgKey) {
    res.status(500).end()
    return
  }

  const ws = new WebSocket(
    "wss://api.deepgram.com/v1/listen?model=nova-2&punctuate=true&interim_results=true",
    {
      headers: {
        Authorization: `Token ${dgKey}`,
      },
    }
  )

  ws.on("open", () => {
    res.socket.on("data", (chunk) => ws.send(chunk))
  })

  ws.on("message", (msg) => {
    res.write(msg)
  })

  ws.on("close", () => res.end())
}
