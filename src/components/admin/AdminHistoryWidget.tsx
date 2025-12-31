"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface HistoryItem {
  id: string
  name: string
  email: string
  role: string
  status: string | null
  approved_at: string | null
  approved_by: { id: string; full_name?: string; email?: string } | null
}

export default function AdminHistoryWidget() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false

    const fetchHistory = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/admin/approvals/history?limit=20")
        if (!res.ok) throw new Error("Failed to fetch approval history")
        const data = await res.json()
        if (!cancelled) setHistory(data.approvals || [])
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Error fetching history")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchHistory()

    return () => {
      cancelled = true
    }
  }, [open])

  return (
    <div className="ml-auto flex items-center gap-2">
      <Button size="sm" variant={open ? "outline" : "ghost"} onClick={() => setOpen((s) => !s)}>
        {open ? "Hide Approval History" : "Approval History"}
      </Button>

      {open && (
        <div className="absolute right-6 top-14 w-[520px] max-h-[60vh] overflow-auto bg-popover border rounded-lg shadow p-3 z-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Recent Approvals</h4>
            <small className="text-xs text-muted-foreground">Latest 20</small>
          </div>
          {loading ? (
            <div className="py-6 text-center">Loading...</div>
          ) : error ? (
            <div className="py-4 text-center text-red-600">{error}</div>
          ) : history.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">No approvals yet</div>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                  <div>
                    <div className="font-medium">{h.name || h.email}</div>
                    <div className="text-xs text-muted-foreground">{h.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{h.approved_at ? new Date(h.approved_at).toLocaleString() : '-'}</div>
                    <div className="text-xs text-muted-foreground">By: {h.approved_by?.full_name || h.approved_by?.email || '-'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
