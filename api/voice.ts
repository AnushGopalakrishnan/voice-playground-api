import type { VercelRequest, VercelResponse } from "@vercel/node"

export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed")
    return
  }

  const { text } = req.body || {}

  if (!text) {
    res.status(400).json({ error: "No text provided" })
    return
  }

  res.status(200).json({
    message: "API working",
    receivedText: text
  })
}
