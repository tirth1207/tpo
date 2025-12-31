import type { SupabaseClient } from "@supabase/supabase-js"

export async function insertAuditEvent(
  supabase: SupabaseClient,
  {
    actor_id,
    actor_role,
    action,
    target_table,
    target_id,
    target_role,
    details,
  }: {
    actor_id?: string | null
    actor_role?: string | null
    action: string
    target_table: string
    target_id?: string | null
    target_role?: string | null
    details?: any
  },
) {
  const { error } = await supabase.from("audit_events").insert([
    {
      actor_id: actor_id || null,
      actor_role: actor_role || null,
      action,
      target_table,
      target_id: target_id || null,
      target_role: target_role || null,
      details: details || null,
    },
  ])

  if (error) {
    console.error("Failed to insert audit event", error)
  }
}

export async function fetchAuditEvents(
  supabase: SupabaseClient,
  opts: { target_table?: string; target_id?: string; target_role?: string; limit?: number; offset?: number } = {},
) {
  let query = supabase.from("audit_events").select("*, actor:actor_id(id, full_name, email)")

  if (opts.target_table) query = query.eq("target_table", opts.target_table)
  if (opts.target_id) query = query.eq("target_id", opts.target_id)
  if (opts.target_role) query = query.eq("target_role", opts.target_role)

  const lim = opts.limit || 50
  const off = opts.offset || 0

  const { data, error } = await query.order("created_at", { ascending: false }).range(off, off + lim - 1)

  if (error) {
    console.error("Failed to fetch audit events", error)
    return []
  }

  return data || []
}
