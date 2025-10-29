"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function SignupSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle>Account Created Successfully!</CardTitle>
          <CardDescription>Your account has been created</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            Please check your email to verify your account. After verification, you can log in.
          </p>
          <Button onClick={() => router.push("/auth/login")} className="w-full bg-primary text-primary-foreground">
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
