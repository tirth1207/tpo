"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface EventItem {
  id: string
  action: string
  target_table: string
  target_id: string | null
  target_role: string | null
  details: any
  created_at: string | null
  actor: { id: string; full_name?: string; email?: string } | null
  actor_role: string | null
}

export default function HistorySection({
  target_table,
  target_id,
  target_role,
  title = "History",
  limit = 50,
}: {
  target_table?: string
  target_id?: string
  target_role?: string
  title?: string
  limit?: number
}) {
  const [open, setOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<EventItem[]>([])

  useEffect(() => {
    if (!open) return

    let cancelled = false

    const fetchEvents = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (target_table) params.set("target_table", target_table)
        if (target_id) params.set("target_id", target_id)
        if (target_role) params.set("target_role", target_role)
        params.set("limit", String(limit))

        const res = await fetch(`/api/admin/audit?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to fetch history")
        const data = await res.json()
        if (!cancelled) setEvents(data.events || [])
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchEvents()

    return () => {
      cancelled = true
    }
  }, [open, target_table, target_id, target_role, limit])

  // Helpers to format and render details
  const formatVal = (v: any) => {
    if (v === null || v === undefined) return <span className="text-muted-foreground">-</span>
    if (Array.isArray(v)) return (
      <div className="flex flex-wrap gap-2 mt-1">
        {v.map((x: any) => (
          <Badge key={String(x)} variant="outline">{String(x)}</Badge>
        ))}
      </div>
    )
    if (typeof v === 'object') return <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{JSON.stringify(v, null, 2)}</pre>
    return <span>{String(v)}</span>
  }

  const isEqual = (a: any, b: any) => {
    if (Array.isArray(a) || Array.isArray(b)) return JSON.stringify(a) === JSON.stringify(b)
    if (typeof a === 'object' || typeof b === 'object') return JSON.stringify(a) === JSON.stringify(b)
    return a === b
  }

  const diffs = (oldObj: any, newObj: any) => {
    const keys = Array.from(new Set([...(oldObj ? Object.keys(oldObj) : []), ...(newObj ? Object.keys(newObj) : [])]))
    return keys.filter(k => !isEqual(oldObj?.[k], newObj?.[k])).map(k => ({ key: k, oldVal: oldObj?.[k], newVal: newObj?.[k] }))
  }

  const renderDetails = (details: any, action: string) => {
    if (!details) return null

    // update with old/new -> show changed fields only
    if (details.old || details.new) {
      const changes = diffs(details.old, details.new)
      if (changes.length === 0) return <div className="text-xs text-muted-foreground">No visible changes</div>

      return (
        <div className="space-y-2">
          {changes.map(c => (
            <div key={c.key} className="flex items-start justify-between">
              <div className="font-medium capitalize">{c.key.replace(/_/g, ' ')}</div>
              <div className="text-right text-sm min-w-[140px]">
                <div className="text-xs text-muted-foreground">{formatVal(c.oldVal)}</div>
                <div className="mt-1">→ {formatVal(c.newVal)}</div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    // created/deleted or other single-object details
    if (action === 'created' || action === 'deleted') {
      const obj = details
      const fields = ['title', 'name', 'company_name', 'location', 'is_approved', 'is_active', 'job_type', 'salary_min', 'salary_max', 'application_deadline']
      return (
        <div className="space-y-1">
          {fields.map(f => (obj?.[f] !== undefined ? (
            <div key={f} className="flex justify-between">
              <div className="font-medium capitalize">{f.replace(/_/g, ' ')}</div>
              <div className="text-sm">{formatVal(obj[f])}</div>
            </div>
          ) : null))}
        </div>
      )
    }

    // fallback: pretty-print JSON
    return <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{JSON.stringify(details, null, 2)}</pre>
  }

  const grouped = events.reduce((acc: Record<string, EventItem[]>, ev) => {
    acc[ev.action] = acc[ev.action] || []
    acc[ev.action].push(ev)
    return acc
  }, {})
  console.log(grouped)

  return (
    <Card className="mt-6">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setOpen((s) => !s)}>
            {open ? "Hide" : "Show"}
          </Button>
        </div>
      </CardHeader>
      {open && (
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading history...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No history yet</div>
          ) : (
            <div className="space-y-4">
              {Object.keys(grouped).map((action) => (
                <div key={action}>
                  <h4 className="font-medium">{action.toUpperCase()}</h4>
                  <div className="space-y-2 mt-2">
                    {grouped[action].map((e) => (
                      <div key={e.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 pr-4">
                          <div className="font-medium">{e.actor?.full_name || e.actor?.email || 'System'}</div>
                          <div className="text-xs text-muted-foreground">{e.actor?.email}</div>
                          <div className="mt-2 text-sm">{renderDetails(e.details, e.action)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs">{e.actor_role}</div>
                          <div className="text-sm">{e.created_at ? new Date(e.created_at).toLocaleString() : '-'}</div>
                          <div className="text-xs text-muted-foreground">Target: {e.target_role || e.target_table}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
