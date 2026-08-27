import type { APIRoute } from "astro"
import { auth, db } from "../../lib/auth"
import { sendCaseReceivedEmail } from "../../lib/case-notification"
import type { RoutingDecision } from "../../lib/route-issue"

export const prerender = false

export async function ensureCaseTables() {
  await db.query(`CREATE TABLE IF NOT EXISTS citizen_cases (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, issue TEXT NOT NULL, filing_type TEXT, department TEXT, office TEXT, confidence NUMERIC, reason TEXT, next_step TEXT, status TEXT NOT NULL DEFAULT 'received', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`)
  await db.query(`ALTER TABLE citizen_cases ADD COLUMN IF NOT EXISTS filing_type TEXT, ADD COLUMN IF NOT EXISTS department TEXT, ADD COLUMN IF NOT EXISTS office TEXT, ADD COLUMN IF NOT EXISTS confidence NUMERIC, ADD COLUMN IF NOT EXISTS reason TEXT, ADD COLUMN IF NOT EXISTS next_step TEXT`)
  await db.query(`CREATE TABLE IF NOT EXISTS case_timeline (id BIGSERIAL PRIMARY KEY, case_id TEXT NOT NULL REFERENCES citizen_cases(id) ON DELETE CASCADE, event_type TEXT NOT NULL, message TEXT NOT NULL, actor TEXT NOT NULL DEFAULT 'system', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`)
}

export const GET: APIRoute = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: "Sign in to view your cases." }, { status: 401 })
  await ensureCaseTables()
  const result = await db.query(`SELECT id, issue, filing_type, department, office, confidence, reason, next_step, status, created_at FROM citizen_cases WHERE user_id = $1 ORDER BY created_at DESC`, [session.user.id])
  return Response.json({ cases: result.rows })
}

export const POST: APIRoute = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: "Sign in before submitting an issue." }, { status: 401 })
  const body = await request.json().catch(() => null)
  const issue = typeof body?.issue === "string" ? body.issue.trim() : ""
  const route = body?.route as RoutingDecision | undefined
  if (!issue || issue.length > 5000 || !route?.department || !route?.filingType) return Response.json({ error: "Provide an issue and a suggested route." }, { status: 400 })
  await ensureCaseTables()
  const caseId = `IGS-${crypto.randomUUID()}`
  await db.query(`INSERT INTO citizen_cases (id, user_id, issue, filing_type, department, office, confidence, reason, next_step) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [caseId, session.user.id, issue, route.filingType, route.department, route.office, route.confidence, route.reason, route.nextStep])
  await db.query(`INSERT INTO case_timeline (case_id, event_type, message) VALUES ($1,'submitted','Issue submitted by citizen'),($1,'routed',$2),($1,'registered',$3)`, [caseId, `Recommended route: ${route.department}`, `Case ${caseId} registered`])
  let emailDelivered = false
  try { emailDelivered = (await sendCaseReceivedEmail({ caseId, recipient: session.user.email })).delivered } catch { /* persistence remains successful */ }
  return Response.json({ caseId, emailDelivered }, { status: 201 })
}