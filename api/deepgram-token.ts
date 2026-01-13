export const config = { runtime: "nodejs" }

import type { VercelRequest, VercelResponse } from "@vercel/node"

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  if (!process.env.DEEPGRAM_API_KEY) {
    res.status(500).json({ error: "Missing Deepgram key" })
    return
  }

  // Get project ID
  const projectsRes = await fetch("https://api.deepgram.com/v1/projects", {
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
    },
  })

  const projectsData = await projectsRes.json()
  const projectId = projectsData.projects[0].project_id

  // Create short-lived key
  const tokenRes = await fetch(
    `https://api.deepgram.com/v1/projects/${projectId}/keys`,
    {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: "framer-live-stt",
        scopes: ["usage:write"],
        time_to_live_in_seconds: 300,
      }),
    }
  )

  const tokenData = await tokenRes.json()

  res.status(200).json({ key: tokenData.key })
}
