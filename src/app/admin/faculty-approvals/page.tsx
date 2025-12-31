"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/supabase/types"
import HistorySection from "@/components/admin/HistorySection"

interface ApprovalHistoryItem {
  id: string
  name: string
  email: string
  role: string
  status: string | null
  approved_at: string | null
  approved_by: { id: string; full_name?: string; email?: string } | null
}

export default function FacultyApprovals() {
  const [faculties, setFaculties] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<ApprovalHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

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

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true)
      const res = await fetch('/api/admin/approvals/history?role=faculty')
      if (!res.ok) throw new Error('Failed to fetch approval history')
      const data = await res.json()
      setHistory(data.approvals || [])
    } catch (err) {
      console.error(err)
    } finally {
      setHistoryLoading(false)
    }
  }


  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Faculty Approvals</CardTitle>
        <div className="flex items-center gap-4">
          <CardDescription>Pending faculty registrations</CardDescription>
          <Button size="sm" variant={showHistory ? 'outline' : 'ghost'} onClick={() => {
            setShowHistory((s) => !s)
            if (!showHistory) fetchHistory()
          }}>
            {showHistory ? 'Hide History' : 'View Approval History'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showHistory ? (
          historyLoading ? (
            <div className="text-center py-4">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No approval history</div>
          ) : (
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{h.name}</p>
                    <p className="text-sm text-muted-foreground">{h.email}</p>
                    <p className="text-xs text-muted-foreground">Status: {h.status || 'approved'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{h.approved_at ? new Date(h.approved_at).toLocaleString() : '-'}</p>
                    <p className="text-xs text-muted-foreground">By: {h.approved_by?.full_name || h.approved_by?.email || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : loading ? (
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
    <HistorySection target_table="profiles" target_role="faculty" title="Faculty: All Operations History" />
    </>
  )
}
