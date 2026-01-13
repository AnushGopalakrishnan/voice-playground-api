import type { VercelRequest, VercelResponse } from "@vercel/node"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // ✅ Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  if (req.method !== "POST") {
    res.status(405).send("Method not allowed")
    return
  }

  const { text, voice = "alloy" } = req.body || {}

  if (!text) {
    res.status(400).json({ error: "No text provided" })
    return
  }

  try {
    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice,
      input: text,
    })

    const buffer = Buffer.from(await speech.arrayBuffer())

    res.setHeader("Content-Type", "audio/mpeg")
    res.status(200).send(buffer)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Voice generation failed" })
  }
}
