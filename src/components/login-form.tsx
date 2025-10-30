"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.requiresEmailVerification) {
          setError(`${data.error}: ${data.details}`)
        } else if (data.requiresApproval) {
          setError(`${data.error}: ${data.details}`)
        } else {
          setError(data.error || 'Login failed')
        }
        return
      }

      // Successful login - redirect based on role
      const { role } = data.user
      let redirectPath = '/'
      switch (role) {
        case 'admin':
          redirectPath = '/admin'
          break
        case 'student':
          redirectPath = '/student'
          break
        case 'faculty':
          redirectPath = '/faculty'
          break
        case 'company':
          redirectPath = '/company'
          break
      }

      router.push(redirectPath)

    } catch (err: any) {
      setError(err.message || "Unexpected error")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleLogin} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="text-muted-foreground text-sm">Enter your email and password below</p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </Field>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Sign In"}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>
      </FieldGroup>
    </form>
  )
}
