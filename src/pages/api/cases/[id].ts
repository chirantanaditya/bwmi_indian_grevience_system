import type { APIRoute } from "astro"
import { auth, db } from "../../../lib/auth"
import { ensureCaseTables } from "../cases"
import { sendCaseStatusEmail } from "../../../lib/case-notification"

export const prerender = false

export const GET: APIRoute = async ({ request, params }) => {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: "Sign in to view this case." }, { status: 401 })
  await ensureCaseTables()
  const caseResult = await db.query("SELECT * FROM citizen_cases WHERE id=$1 AND user_id=$2", [params.id, session.user.id])
  if (!caseResult.rowCount) return Response.json({ error: "Case not found." }, { status: 404 })
  const timeline = await db.query("SELECT event_type, message, actor, created_at FROM case_timeline WHERE case_id=$1 ORDER BY created_at", [params.id])
  return Response.json({ case: caseResult.rows[0], timeline: timeline.rows })
}

export const PATCH: APIRoute = async ({ request, params }) => {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: "Sign in to update this case." }, { status: 401 })
  const body = await request.json().catch(() => null)
  const status = typeof body?.status === "string" ? body.status : ""
  if (!/^(received|in_progress|resolved)$/.test(status)) return Response.json({ error: "Choose a valid case status." }, { status: 400 })
  await ensureCaseTables()
  const updated = await db.query("UPDATE citizen_cases SET status=$1 WHERE id=$2 AND user_id=$3 RETURNING id", [status, params.id, session.user.id])
  if (!updated.rowCount) return Response.json({ error: "Case not found." }, { status: 404 })
  const message = `Status changed to ${status.replaceAll("_", " ")}`
  await db.query("INSERT INTO case_timeline (case_id,event_type,message,actor) VALUES ($1,'status_changed',$2,'citizen')", [params.id, message])
  let emailDelivered = false
  try { emailDelivered = (await sendCaseStatusEmail({ caseId: params.id!, recipient: session.user.email, status })).delivered } catch { /* status remains updated */ }
  return Response.json({ status, emailDelivered })
}