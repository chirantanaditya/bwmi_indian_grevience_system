import type { APIRoute } from "astro"
import { routeIssue } from "../../lib/route-issue"

export const prerender = false
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null)
  const issue = typeof body?.issue === "string" ? body.issue.trim() : ""
  if (!issue || issue.length > 5000) return Response.json({ error: "Describe your issue in up to 5,000 characters." }, { status: 400 })
  return Response.json(await routeIssue(issue))
}