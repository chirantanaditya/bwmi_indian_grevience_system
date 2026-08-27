type CaseNotification = { caseId: string; recipient: string }

async function sendEmail(subject: string, html: string, recipient: string) {
  const apiKey = import.meta.env.RESEND_API_KEY ?? import.meta.env.RESEND_API ?? process.env.RESEND_API_KEY ?? process.env.RESEND_API
  const from = import.meta.env.RESEND_FROM_EMAIL ?? process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) return { delivered: false, reason: "Email delivery is not configured." }
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [recipient], subject, html }) })
  if (!response.ok) throw new Error("Resend could not deliver the case notification.")
  return { delivered: true }
}

export function sendCaseReceivedEmail({ caseId, recipient }: CaseNotification) {
  return sendEmail(`We received your issue — ${caseId}`, `<p>We received your issue.</p><p>Your reference is <strong>${caseId}</strong>.</p><p>We will email you when there is an update.</p>`, recipient)
}

export function sendCaseStatusEmail({ caseId, recipient, status }: CaseNotification & { status: string }) {
  return sendEmail(`Your case is now ${status.replaceAll("_", " ")} — ${caseId}`, `<p>Your case <strong>${caseId}</strong> is now marked as <strong>${status.replaceAll("_", " ")}</strong>.</p><p>Sign in to view the latest timeline.</p>`, recipient)
}