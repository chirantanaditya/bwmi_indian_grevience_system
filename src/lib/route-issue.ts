import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import OpenAI from "openai"

export type RoutingDecision = {
  filingType: "Grievance" | "RTI" | "Correspondence"
  department: string
  office: string
  confidence: number
  reason: string
  nextStep: string
  usedAi: boolean
}

const registryPath = fileURLToPath(new URL("../../data/rti_public_authorities.csv", import.meta.url))
const registry = readFileSync(registryPath, "utf8")
  .split(/\r?\n/)
  .slice(1)
  .map((line) => line.split(",")[2]?.replace(/^"|"$/g, "").trim())
  .filter(Boolean)

const preferredAuthorities = [
  "Employees Provident Fund Organisation",
  "Department of Railways",
  "Central Board of Direct Taxes (Income Tax)",
  "Department of Consumer Affairs",
  "Department of Administrative Reforms & PG",
].filter((name) => registry.includes(name) || name === "Employees Provident Fund Organisation")

function fallback(issue: string): RoutingDecision {
  const text = issue.toLowerCase()
  if (/(epfo|provident|\bpf\b|uan|pension)/.test(text)) return { filingType: "Grievance", department: "Employees Provident Fund Organisation", office: "EPFO grievance office", confidence: 0.88, reason: "Your issue mentions provident fund or pension services, which are handled by EPFO.", nextStep: "File a grievance with EPFO and keep your UAN or claim reference ready.", usedAi: false }
  if (/(train|railway|irctc)/.test(text)) return { filingType: "Grievance", department: "Department of Railways", office: "Railway grievance office", confidence: 0.82, reason: "Your issue concerns a rail service or booking.", nextStep: "File a railway grievance with your PNR or booking reference.", usedAi: false }
  if (/(pan|income tax|itr|refund)/.test(text)) return { filingType: "Grievance", department: "Central Board of Direct Taxes (Income Tax)", office: "Income Tax grievance office", confidence: 0.8, reason: "Your issue concerns an Income Tax service.", nextStep: "Keep your PAN and acknowledgement number ready.", usedAi: false }
  return { filingType: /information|record|document|copy|file status/i.test(issue) ? "RTI" : "Grievance", department: "Department of Administrative Reforms & PG", office: "Public Grievance Division", confidence: 0.55, reason: "This needs a public-service review, but more service-specific details may improve the route.", nextStep: "Submit the issue with the relevant reference number and location.", usedAi: false }
}

export async function routeIssue(issue: string): Promise<RoutingDecision> {
  const basic = fallback(issue)
  const apiKey = import.meta.env.OPENAI_API_KEY ?? process.env.OPENAI_API_KEY
  if (!apiKey) return basic
  try {
    const client = new OpenAI({ apiKey })
    const response = await client.responses.create({
      model: "gpt-5-nano",
      store: false,
      input: `You route Indian public-service issues. Return JSON only with filingType, department, office, confidence, reason, nextStep. Choose department only from: ${preferredAuthorities.join(" | ")}. Issue: ${issue}`,
    })
    const parsed = JSON.parse(response.output_text) as Partial<RoutingDecision>
    if (!parsed.department || !preferredAuthorities.includes(parsed.department) || !parsed.filingType || !parsed.reason || !parsed.nextStep) return basic
    return { filingType: parsed.filingType === "RTI" || parsed.filingType === "Correspondence" ? parsed.filingType : "Grievance", department: parsed.department, office: parsed.office || basic.office, confidence: Math.max(0.1, Math.min(0.99, Number(parsed.confidence) || basic.confidence)), reason: parsed.reason, nextStep: parsed.nextStep, usedAi: true }
  } catch {
    return basic
  }
}