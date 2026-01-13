import type { VercelRequest, VercelResponse } from "@vercel/node"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed")
    return
  }

  const { text, voice = "alloy" } = req.body || {}

  if (!text || text.length > 4000) {
    res.status(400).json({ error: "Invalid text" })
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
    res.setHeader("Cache-Control", "no-store")
    res.status(200).send(buffer)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Voice generation failed" })
  }
}
