import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const approvalSchema = z.object({
  profileId: z.string().uuid(),
  approve: z.boolean(),
  feedback: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

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

    const body = await request.json()
    const { profileId, approve, feedback } = approvalSchema.parse(body)

    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, is_approved')
      .eq('id', profileId)
      .single()

    if (profileError || !targetProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (approve) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_approved: true, approved_by: user.id, approved_at: new Date().toISOString() })
        .eq('id', profileId)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to approve profile' }, { status: 400 })
      }

      await supabase
        .from('notifications')
        .insert({
          user_id: profileId,
          title: 'Registration Approved',
          message: 'Your registration has been approved. You can now access the portal.',
          type: 'success',
        })

      return NextResponse.json({ message: 'Profile approved successfully' })
    } else {
      // rejection path: optionally store feedback in a generic way via notification
      await supabase
        .from('notifications')
        .insert({
          user_id: profileId,
          title: 'Registration Rejected',
          message: feedback || 'Your registration request has been rejected.',
          type: 'error',
        })

      return NextResponse.json({ message: 'Profile rejected and user notified' })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('Approvals error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


