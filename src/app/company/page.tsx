"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  is_approved: boolean
}

interface Company {
  id: string
  company_name: string
  industry: string
  contact_person: string
  phone: string
}

export default function CompanyDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/companies/dashboard")
        if (!response.ok) {
          if (response.status === 401) {
            redirect("/auth/login")
          }
          throw new Error("Failed to fetch dashboard data")
        }
        const data = await response.json()
        setProfile(data.profile)
        setCompany(data.company)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8 text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Company Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {profile?.full_name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Your company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-semibold">{company?.company_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Industry</p>
                <p className="font-semibold">{company?.industry || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p className="font-semibold">{company?.contact_person || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-semibold">{company?.phone || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{profile?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">
                  {profile?.full_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-semibold capitalize">{profile?.role || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold">{profile?.is_approved ? "Approved" : "Pending"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button variant="outline" onClick={() => (window.location.href = "/api/auth/logout")}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
