export const config = { runtime: "nodejs" }

import type { VercelRequest, VercelResponse } from "@vercel/node"

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (!process.env.DEEPGRAM_API_KEY) {
    return res.status(500).end()
  }

  const resp = await fetch("https://api.deepgram.com/v1/projects", {
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
    },
  })

  const data = await resp.json()
  const projectId = data.projects[0].project_id

  const tokenResp = await fetch(
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

  const tokenData = await tokenResp.json()

  res.status(200).json({ key: tokenData.key })
}
