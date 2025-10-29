import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is faculty or admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !['faculty', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const branch = searchParams.get('branch')
    const year = searchParams.get('year')
    const status = searchParams.get('status') // 'approved', 'pending', 'all'

    // Build query
    let query = supabase
      .from('students')
      .select(`
        *,
        profiles!inner(
          id,
          email,
          first_name,
          last_name,
          is_approved,
          created_at
        )
      `)

    if (branch) {
      query = query.eq('branch', branch)
    }

    if (year) {
      query = query.eq('year', parseInt(year))
    }

    if (status === 'approved') {
      query = query.eq('profiles.is_approved', true)
    } else if (status === 'pending') {
      query = query.eq('profiles.is_approved', false)
    }

    const { data: students, error: studentsError } = await query
      .order('created_at', { ascending: false })

    if (studentsError) {
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 400 })
    }

    return NextResponse.json({ students })

  } catch (error) {
    console.error('Get students error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is faculty or admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !['faculty', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { studentId, action, feedback } = body

    if (!studentId || !action) {
      return NextResponse.json({ error: 'Student ID and action are required' }, { status: 400 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update student approval status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_approved: action === 'approve',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', studentId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update student status' }, { status: 400 })
    }

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: studentId,
        title: action === 'approve' ? 'Registration Approved' : 'Registration Rejected',
        message: action === 'approve' 
          ? 'Your registration has been approved. You can now access the portal.'
          : feedback || 'Your registration request has been rejected.',
        type: action === 'approve' ? 'success' : 'error',
      })

    return NextResponse.json({ 
      message: `Student ${action}d successfully` 
    })

  } catch (error) {
    console.error('Update student status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
