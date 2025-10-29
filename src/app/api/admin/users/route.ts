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

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status') // 'approved', 'pending', 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('profiles')
      .select(`
        *,
        students(id, roll_number, branch, year),
        faculty(id, employee_id, department),
        companies(id, company_name, industry)
      `)

    if (role) {
      query = query.eq('role', role)
    }

    if (status === 'approved') {
      query = query.eq('is_approved', true)
    } else if (status === 'pending') {
      query = query.eq('is_approved', false)
    }

    const { data: users, error: usersError, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (usersError) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 400 })
    }

    return NextResponse.json({ 
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Get users error:', error)
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

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, action, feedback } = body

    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action are required' }, { status: 400 })
    }

    if (!['approve', 'reject', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (action === 'delete') {
      // Delete user (this will cascade to related tables)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (deleteError) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 400 })
      }

      return NextResponse.json({ message: 'User deleted successfully' })
    }

    // Handle approve/reject
    const isApproved = action === 'approve'
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_approved: isApproved,
        approved_by: user.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update user status' }, { status: 400 })
    }

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: isApproved ? 'Registration Approved' : 'Registration Rejected',
        message: isApproved 
          ? 'Your registration has been approved. You can now access the portal.'
          : feedback || 'Your registration request has been rejected.',
        type: isApproved ? 'success' : 'error',
      })

    return NextResponse.json({ 
      message: `User ${action}d successfully` 
    })

  } catch (error) {
    console.error('Update user status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
