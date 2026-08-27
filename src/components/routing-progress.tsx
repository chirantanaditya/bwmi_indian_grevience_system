"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

type Route = { issue: string; department: string; office: string; filingType: string; confidence: number; reason: string; nextStep: string; caseId: string }

export default function RoutingProgress() {
  const root = useRef<HTMLElement>(null)
  const [route, setRoute] = useState<Route | null>(null)
  const [phase, setPhase] = useState("")

  useEffect(() => {
    const start = (event: Event) => {
      const detail = (event as CustomEvent<Route>).detail
      setRoute(detail)
      setPhase("Finding the relevant office…")
      requestAnimationFrame(() => {
        const panel = root.current
        if (!panel) return
        const entries = panel.querySelectorAll("[data-routing-step]")
        const confirmation = panel.querySelector("[data-routing-confirmation]")
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        gsap.killTweensOf([panel, entries, confirmation])
        gsap.set([entries, confirmation], { autoAlpha: 0, y: 12 })
        if (reduced) { gsap.set([entries, confirmation], { autoAlpha: 1, y: 0 }); setPhase("Case registered"); return }
        gsap.timeline({ defaults: { ease: "power2.out" } })
          .fromTo(panel, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.28 })
          .to(entries[0], { autoAlpha: 1, y: 0, duration: 0.28 })
          .call(() => setPhase(`Matched with ${detail.department}…`))
          .to(entries[1], { autoAlpha: 1, y: 0, duration: 0.28, delay: 0.42 })
          .call(() => setPhase("Creating your case record…"))
          .to(confirmation, { autoAlpha: 1, y: 0, duration: 0.34, delay: 0.42 })
          .call(() => setPhase("Case registered"))
      })
    }
    window.addEventListener("igs:routing", start)
    return () => window.removeEventListener("igs:routing", start)
  }, [])

  if (!route) return null
  return <section ref={root} className="routing-progress" aria-live="polite" aria-label="Case routing progress">
    <p className="routing-request">{route.issue}</p><p className="sr-only" role="status">{phase}</p>
    <ol className="routing-timeline"><li data-routing-step><span aria-hidden="true" /><div><strong>Finding the relevant office</strong><small>{route.department} · {route.office}</small></div></li><li data-routing-step><span aria-hidden="true" /><div><strong>Preparing the right filing</strong><small>{route.filingType} · {Math.round(route.confidence * 100)}% confidence</small></div></li></ol>
    <div data-routing-confirmation className="routing-confirmation"><p>Your case has been registered</p><strong>{route.caseId}</strong><small>{route.reason}</small><small>{route.nextStep}</small><a href={`/cases/${route.caseId}`}>Check details <span aria-hidden="true">→</span></a></div>
  </section>
}