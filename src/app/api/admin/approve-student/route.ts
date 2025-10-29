import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const approveStudentSchema = z.object({
  studentId: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or faculty
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'faculty'].includes(profile.role)) {
      return NextResponse.json({ error: 'Only admins and faculty can approve students' }, { status: 403 })
    }

    const body = await request.json()
    const { studentId, action, notes } = approveStudentSchema.parse(body)

    // Get student profile
    const { data: studentProfile, error: studentError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, is_approved')
      .eq('id', studentId)
      .single()

    if (studentError || !studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    if (studentProfile.is_approved) {
      return NextResponse.json({ error: 'Student already approved' }, { status: 400 })
    }

    // Update approval status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_approved: action === 'approve',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', studentId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update student approval' }, { status: 400 })
    }

    // Create notification for student
    await supabase
      .from('notifications')
      .insert({
        user_id: studentId,
        title: action === 'approve' ? 'Profile Approved' : 'Profile Rejected',
        message: action === 'approve' 
          ? 'Your student profile has been approved. You can now apply for jobs.'
          : `Your student profile has been rejected. ${notes || 'Please update your profile and resubmit.'}`,
        type: action === 'approve' ? 'success' : 'error',
      })

    return NextResponse.json({ 
      message: `Student ${action}d successfully`,
      student: {
        id: studentProfile.id,
        email: studentProfile.email,
        name: `${studentProfile.first_name} ${studentProfile.last_name}`,
        action,
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Approve student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
