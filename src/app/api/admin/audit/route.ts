import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth & admin check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const target_table = searchParams.get('target_table') || undefined
    const target_id = searchParams.get('target_id') || undefined
    const target_role = searchParams.get('target_role') || undefined
    let page = parseInt(searchParams.get('page') || '1')
    let limit = parseInt(searchParams.get('limit') || '50')
    if (!isFinite(page) || page < 1) page = 1
    if (!isFinite(limit) || limit < 1) limit = 50
    // Protect against huge limits
    limit = Math.min(200, limit)
    const offset = (page - 1) * limit

    console.info('Audit request params:', { target_table, target_id, target_role, page, limit, offset })

    // Try fetching with a relationship projection for actor -> profiles (works when FK exists)
    let data: any[] | null = null
    try {
      let query = supabase.from('audit_events').select('*, actor:actor_id(id, full_name, email)').order('created_at', { ascending: false })

      if (target_table) query = query.eq('target_table', target_table)
      if (target_id) query = query.eq('target_id', target_id)
      if (target_role) query = query.eq('target_role', target_role)

      const { data: joinedData, error: joinedError } = await query.range(offset, offset + limit - 1)
      if (joinedError) throw joinedError
      data = joinedData || []
      console.info('Audit fetched events (joined):', Array.isArray(data) ? data.length : 0)

      // Enrich approval references inside details (approved_by UUIDs -> profile objects)
      const approvedIds = new Set<string>()
      data.forEach((e: any) => {
        try {
          const d = e.details || {}
          if (d?.new?.approved_by) approvedIds.add(String(d.new.approved_by))
          if (d?.old?.approved_by) approvedIds.add(String(d.old.approved_by))
        } catch (err) {
          /* ignore malformed details */
        }
      })

      if (approvedIds.size) {
        const ids = Array.from(approvedIds)
        const { data: approvers = [], error: approversError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', ids)

        if (approversError) {
          console.error('Failed to fetch approver profiles (joined):', approversError)
        } else {
          const approverMap = new Map<string, any>();
          ;(approvers || []).forEach((a: any) => approverMap.set(a.id, a))
          data = data.map((e: any) => {
            const d = e.details || {}
            if (d?.new?.approved_by) d.new.approved_by_profile = approverMap.get(d.new.approved_by) || null
            if (d?.old?.approved_by) d.old.approved_by_profile = approverMap.get(d.old.approved_by) || null
            e.details = d
            return e
          })
        }
      }

      return NextResponse.json({ events: data })
    } catch (joinedErr: any) {
      // Handle PostgREST relationship missing (PGRST200) by falling back to manual mapping
      console.warn('Audit joined query failed, falling back to manual actor lookup:', joinedErr?.message || joinedErr)

      // Fetch audit events without relationship projection
      let q = supabase.from('audit_events').select('*').order('created_at', { ascending: false })
      if (target_table) q = q.eq('target_table', target_table)
      if (target_id) q = q.eq('target_id', target_id)
      if (target_role) q = q.eq('target_role', target_role)

      const { data: eventsOnly, error: eventsError } = await q.range(offset, offset + limit - 1)
      if (eventsError) {
        console.error('Audit fetch error (no-join):', eventsError)
        return NextResponse.json({ error: eventsError.message || 'Failed to fetch audit events' }, { status: 500 })
      }

      const events = eventsOnly || []
      // Collect actor ids and fetch their profiles
      const actorIds = Array.from(new Set(events.map((e: any) => e.actor_id).filter(Boolean)))
      let actors: any[] = []
      if (actorIds.length) {
        const { data: actorsData, error: actorsError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', actorIds)

        if (actorsError) {
          console.error('Failed to fetch actor profiles for audit events:', actorsError)
        } else {
          actors = actorsData || []
        }
      }

      const actorsMap: Record<string, any> = {}
      actors.forEach((a: any) => (actorsMap[a.id] = a))

      let enriched = events.map((e: any) => ({ ...e, actor: e.actor_id ? actorsMap[e.actor_id] || null : null }))

      // Enrich approval references in fallback as well
      const approvedIds2 = new Set<string>()
      enriched.forEach((e: any) => {
        try {
          const d = e.details || {}
          if (d?.new?.approved_by) approvedIds2.add(String(d.new.approved_by))
          if (d?.old?.approved_by) approvedIds2.add(String(d.old.approved_by))
        } catch (err) {
          /* ignore malformed details */
        }
      })

      if (approvedIds2.size) {
        const ids = Array.from(approvedIds2)
        const { data: approvers2 = [], error: approversError2 } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', ids)

        if (approversError2) {
          console.error('Failed to fetch approver profiles (fallback):', approversError2)
        } else {
          const approverMap2 = new Map<string, any>();
          ;(approvers2 || []).forEach((a: any) => approverMap2.set(a.id, a))
          enriched = enriched.map((e: any) => {
            const d = e.details || {}
            if (d?.new?.approved_by) d.new.approved_by_profile = approverMap2.get(d.new.approved_by) || null
            if (d?.old?.approved_by) d.old.approved_by_profile = approverMap2.get(d.old.approved_by) || null
            e.details = d
            return e
          })
        }
      }

      console.info('Audit fetched events (fallback):', enriched.length)
      return NextResponse.json({ events: enriched })
    }
  } catch (err) {
    console.error('Audit history error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
