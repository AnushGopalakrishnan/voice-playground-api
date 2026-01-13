import type { VercelRequest, VercelResponse } from "@vercel/node"
import OpenAI from "openai"

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  if (req.method !== "POST") {
    res.status(405).send("Method not allowed")
    return
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing")
    }

    const { text } = req.body || {}

    if (!text) {
      res.status(400).json({ error: "No text provided" })
      return
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: text,
    })

    const buffer = Buffer.from(await speech.arrayBuffer())

    res.setHeader("Content-Type", "audio/mpeg")
    res.status(200).send(buffer)
  } catch (err: any) {
    console.error("VOICE FUNCTION ERROR:", err)
    res.status(500).send(
      typeof err?.message === "string"
        ? err.message
        : "Unknown server error"
    )
  }
}
