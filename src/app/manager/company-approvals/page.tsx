"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/supabase/types"

export default function CompanyApprovals() {
  const [companies, setCompanies] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/users?role=company")
        if (!response.ok) throw new Error("Failed to fetch companies")
        const data = await response.json()
        setCompanies(data.filter((u: User) => u.approval_status === "pending"))
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  const handleApprove = async (userId: string) => {
    try {
      const response = await fetch(`/api/manager/approve-company`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: userId, action: "true", status: "approved" })
      })
      if (!response.ok) throw new Error("Failed to approve company")
      setCompanies(companies.filter((c) => c.id !== userId))
    } catch (err) {
      console.error(err)
    }
  }

  const handleReject = async (userId: string) => {
    try {
      const response = await fetch(`/api/manager/approve-company`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: userId, action: "false", status: "rejected" })

      })
      if (!response.ok) throw new Error("Failed to reject company")
      setCompanies(companies.filter((c) => c.id !== userId))
    } catch (err) {
      console.error(err)
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Approvals</CardTitle>
        <CardDescription>Pending company registrations</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : companies.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No pending approvals</div>
        ) : (
          <div className="space-y-4">
            {companies.map((company) => (
              <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{company.full_name}</p>
                  <p className="text-sm text-muted-foreground">{company.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(company.id)}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(company.id)}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
