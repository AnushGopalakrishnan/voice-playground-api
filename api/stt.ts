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
    if (!process.env.DEEPGRAM_API_KEY) {
      throw new Error("DEEPGRAM_API_KEY missing")
    }

    // Collect raw audio bytes
    const chunks: Buffer[] = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }

    const audioBuffer = Buffer.concat(chunks)

    const deepgramRes = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&punctuate=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": "audio/webm",
        },
        body: audioBuffer,
      }
    )

    if (!deepgramRes.ok) {
      const err = await deepgramRes.text()
      throw new Error(err)
    }

    const data = await deepgramRes.json()
    const transcript =
      data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ""

    res.status(200).json({ text: transcript })
  } catch (err: any) {
    console.error("STT ERROR:", err)
    res.status(500).json({
      error: err.message || "STT failed",
    })
  }
}
