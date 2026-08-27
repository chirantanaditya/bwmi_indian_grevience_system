"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage("")
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch("/api/auth/sign-in/email", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form.entries())) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message || result.error?.message || "We could not sign you in.")
      window.location.assign("/")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not sign you in.")
    } finally { setIsSubmitting(false) }
  }

  return <div className={cn("flex flex-col gap-6", className)} {...props}>
    <Card>
      <CardHeader>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Citizen account</p>
        <CardTitle className="text-2xl">Sign in to continue</CardTitle>
        <CardDescription>Use your account to submit and track issues securely.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}><FieldGroup>
          <Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" name="email" type="email" autoComplete="email" placeholder="e.g. aditi@example.com" required /><FieldDescription>Enter the email you used to create your account.</FieldDescription></Field>
          <Field><div className="flex items-center"><FieldLabel htmlFor="password">Password</FieldLabel><a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">Forgot password?</a></div><Input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" minLength={8} required /></Field>
          {message && <p className="text-sm text-destructive" role="alert">{message}</p>}
          <Field><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in"}</Button><FieldDescription className="text-center">Need an account? <a className="underline underline-offset-4" href="/sign-up">Create one</a></FieldDescription></Field>
        </FieldGroup></form>
      </CardContent>
    </Card>
  </div>
}