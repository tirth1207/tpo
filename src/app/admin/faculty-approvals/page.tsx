"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/supabase/types"

export default function FacultyApprovals() {
  const [faculties, setFaculties] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchfaculties = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/users?role=faculty")
        if (!response.ok) throw new Error("Failed to fetch faculties")
        const data = await response.json()
        setFaculties(data.filter((u: User) => u.approval_status === "pending"))
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchfaculties()
  }, [])

  const handleApprove = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/approve-faculty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId: userId, action: "true", status: "approved" })
      })
      if (!response.ok) throw new Error("Failed to approve faculty")
      setFaculties(faculties.filter((c) => c.id !== userId))
    } catch (err) {
      console.error(err)
    }
  }

  const handleReject = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/approve-faculty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId: userId, action: "false", status: "rejected" })

      })
      if (!response.ok) throw new Error("Failed to reject faculty")
      setFaculties(faculties.filter((c) => c.id !== userId))
    } catch (err) {
      console.error(err)
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Faculty Approvals</CardTitle>
        <CardDescription>Pending faculty registrations</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : faculties.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No pending approvals</div>
        ) : (
          <div className="space-y-4">
            {faculties.map((faculty) => (
              <div key={faculty.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{faculty.full_name}</p>
                  <p className="text-sm text-muted-foreground">{faculty.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(faculty.id)}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(faculty.id)}>
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
