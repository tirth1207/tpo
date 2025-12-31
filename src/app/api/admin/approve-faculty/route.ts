import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const approveFacultySchema = z.object({
  facultyId: z.string().uuid(),
  action: z.enum(['true', 'false']), // true = approve, false = reject
  status: z.enum(['approved', 'rejected']),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can approve faculty' }, { status: 403 })
    }

    // Parse request
    const body = await request.json()
    const { facultyId, action, status, notes } = approveFacultySchema.parse(body)
    //console.log("Parsed request body:", { facultyId, action, status, notes })

    // Fetch faculty profile
    const { data: facultyProfile, error: facultyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', facultyId)
      .single()

    if (facultyError || !facultyProfile) {
      return NextResponse.json({ error: 'Faculty profile not found' }, { status: 404 })
    }

    if (facultyProfile.approval_status === 'approved') {
      return NextResponse.json({ error: 'Faculty already approved' }, { status: 400 })
    }

    // Mark session for audit so the trigger records actor
    await supabase.rpc('set_audit_session', { p_actor_id: user.id, p_actor_role: 'admin', p_skip: false })

    // Update approval
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_active: action === 'true',
        approval_status: status,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', facultyId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update faculty approval' }, { status: 400 })
    }

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: facultyId,
        title: action === 'true' ? 'Account Approved' : 'Account Rejected',
        message: action === 'true'
          ? 'Your faculty account has been approved. You can now access the TPO portal.'
          : `Your faculty account has been rejected. ${notes || 'Please contact admin for more details.'}`,
        type: action === 'true' ? 'success' : 'error',
      })

    return NextResponse.json({
      message: `Faculty ${action === 'true' ? 'approved' : 'rejected'} successfully`,
      faculty: {
        id: facultyProfile.id,
        email: facultyProfile.email,
        name: facultyProfile.full_name,
        action,
      },
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error }, { status: 400 })
    }
    console.error('Approve faculty error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
