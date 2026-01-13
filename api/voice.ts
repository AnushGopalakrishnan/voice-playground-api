import type { VercelRequest, VercelResponse } from "@vercel/node"

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
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is missing")
    }

    const { text } = req.body || {}

    if (!text) {
      res.status(400).json({ error: "No text provided" })
      return
    }

    // ✅ Default ElevenLabs voice (Rachel)
    const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"

    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2",
        }),
      }
    )

    if (!elevenRes.ok) {
      const errText = await elevenRes.text()
      throw new Error(errText)
    }

    const audioBuffer = Buffer.from(await elevenRes.arrayBuffer())

    res.setHeader("Content-Type", "audio/mpeg")
    res.status(200).send(audioBuffer)
  } catch (err: any) {
    console.error("ELEVENLABS ERROR:", err)
    res.status(500).send(
      typeof err?.message === "string"
        ? err.message
        : "Voice generation failed"
    )
  }
}
