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

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminProfile || adminProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') // optional: filter by role (e.g., 'faculty')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Get approved/rejected profiles (approval history)
    let query = supabase
      .from('profiles')
      .select('id, email, full_name, role, approval_status, approved_at, approved_by')
      .not('approved_at', 'is', null)

    if (role) query = query.eq('role', role)

    const { data: approvals, error } = await query
      .order('approved_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch approval history' }, { status: 400 })
    }

    // Gather approver ids and fetch simple info
    const approverIds = Array.from(new Set((approvals || []).map((a: any) => a.approved_by).filter(Boolean)))
    let approversMap: Record<string, any> = {}
    if (approverIds.length > 0) {
      const { data: approvers } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', approverIds)

      approversMap = (approvers || []).reduce((acc: Record<string, any>, a: any) => {
        acc[a.id] = a
        return acc
      }, {})
    }

    const enriched = (approvals || []).map((a: any) => ({
      id: a.id,
      email: a.email,
      name: a.full_name,
      role: a.role,
      status: a.approval_status,
      approved_at: a.approved_at,
      approved_by: a.approved_by ? approversMap[a.approved_by] || { id: a.approved_by } : null,
    }))

    return NextResponse.json({ approvals: enriched })
  } catch (err) {
    console.error('Approval history error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
