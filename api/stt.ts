export const config = { runtime: "nodejs" }

import type { VercelRequest, VercelResponse } from "@vercel/node"

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const chunks: Buffer[] = []
    for await (const chunk of req) chunks.push(chunk)
    const audioBuffer = Buffer.concat(chunks)

    const dgRes = await fetch(
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

    const data = await dgRes.json()
    const text =
      data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? ""

    res.status(200).json({ text })
  } catch {
    res.status(200).json({ text: "" })
  }
}
