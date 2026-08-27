"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (form.get("password") !== form.get("confirmPassword")) {
      setMessage("Passwords do not match. Please enter them again.")
      return
    }
    setIsSubmitting(true)
    setMessage("")
    const payload = Object.fromEntries(form.entries())
    delete payload.confirmPassword
    try {
      const response = await fetch("/api/auth/sign-up/email", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message || result.error?.message || "We could not create your account.")
      window.location.assign("/")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not create your account.")
    } finally { setIsSubmitting(false) }
  }

  return <Card {...props}>
    <CardHeader>
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Citizen account</p>
      <CardTitle>Create your account</CardTitle>
      <CardDescription>Add your details once to securely submit and track issues.</CardDescription>
    </CardHeader>
    <CardContent><form onSubmit={handleSubmit}><FieldGroup>
      <Field><FieldLabel htmlFor="name">Full name</FieldLabel><Input id="name" name="name" autoComplete="name" placeholder="e.g. Aditi Sharma" required /><FieldDescription>Use the name shown on your government-issued ID.</FieldDescription></Field>
      <Field><FieldLabel htmlFor="addressLine1">Address line 1</FieldLabel><Input id="addressLine1" name="addressLine1" autoComplete="address-line1" placeholder="e.g. 14, MG Road" required /></Field>
      <Field><FieldLabel htmlFor="addressLine2">Address line 2 (optional)</FieldLabel><Input id="addressLine2" name="addressLine2" autoComplete="address-line2" placeholder="e.g. Near City Library" /></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="city">City</FieldLabel><Input id="city" name="city" autoComplete="address-level2" placeholder="e.g. Pune" required /></Field><Field><FieldLabel htmlFor="state">State / Union Territory</FieldLabel><Input id="state" name="state" autoComplete="address-level1" placeholder="e.g. Maharashtra" required /></Field></div>
      <Field><FieldLabel htmlFor="postalCode">PIN code</FieldLabel><Input id="postalCode" name="postalCode" inputMode="numeric" autoComplete="postal-code" placeholder="e.g. 411001" required /><FieldDescription>Your address helps us direct the issue to the right authority.</FieldDescription></Field>
      <Field><FieldLabel htmlFor="phone">Phone number (optional)</FieldLabel><Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="e.g. +91 98765 43210" /></Field>
      <Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" name="email" type="email" autoComplete="email" placeholder="e.g. aditi@example.com" required /><FieldDescription>We’ll only use this for account and case updates.</FieldDescription></Field>
      <Field><FieldLabel htmlFor="password">Password</FieldLabel><Input id="password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" minLength={8} required /></Field>
      <Field><FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel><Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter your password" minLength={8} required /></Field>
      {message && <p className="text-sm text-destructive" role="alert">{message}</p>}
      <Field><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account…" : "Create account"}</Button><FieldDescription className="px-6 text-center">Already have an account? <a className="underline underline-offset-4" href="/sign-in">Sign in</a></FieldDescription></Field>
    </FieldGroup></form></CardContent>
  </Card>
}