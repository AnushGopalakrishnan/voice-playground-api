export const config = {
  runtime: "nodejs",
}

import type { VercelRequest, VercelResponse } from "@vercel/node"

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  if (req.method !== "POST") {
    res.status(405).end()
    return
  }

  try {
    if (!process.env.DEEPGRAM_API_KEY) {
      return res.status(500).json({ text: "" })
    }

    // collect raw bytes
    const chunks: Buffer[] = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }

    const audioBuffer = Buffer.concat(chunks)

    // ⬇️ IMPORTANT: explicitly tell Deepgram it's WEBM
    const deepgramRes = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&punctuate=true&interim_results=false",
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
      // swallow transient Deepgram errors
      return res.status(200).json({ text: "" })
    }

    const data = await deepgramRes.json()

    const text =
      data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? ""

    return res.status(200).json({ text })
  } catch {
    // NEVER propagate 500s to the client during live STT
    return res.status(200).json({ text: "" })
  }
}
