import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createNotificationSchema = z.object({
  userId: z.string().uuid().optional(),
  role: z.enum(['student', 'faculty', 'company', 'admin', 'all']).optional(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
})

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
    const userId = searchParams.get('user_id')
    const type = searchParams.get('type')
    const isRead = searchParams.get('is_read')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('notifications')
      .select(`
        *,
        profiles!notifications_user_id_fkey(
          id,
          email,
          first_name,
          last_name,
          role
        )
      `)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (isRead !== null && isRead !== undefined) {
      query = query.eq('is_read', isRead === 'true')
    }

    const { data: notifications, error: notificationsError, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (notificationsError) {
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 400 })
    }

    return NextResponse.json({ 
      notifications: notifications || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const { userId, role, title, message, type } = createNotificationSchema.parse(body)

    let targetUserIds: string[] = []

    if (userId) {
      // Send to specific user
      targetUserIds = [userId]
    } else if (role && role !== 'all') {
      // Send to all users of specific role
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', role)

      if (usersError) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 400 })
      }

      targetUserIds = users.map(user => user.id)
    } else if (role === 'all') {
      // Send to all users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id')

      if (usersError) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 400 })
      }

      targetUserIds = users.map(user => user.id)
    } else {
      return NextResponse.json({ error: 'Either userId or role must be specified' }, { status: 400 })
    }

    // Create notifications for all target users
    const notifications = targetUserIds.map(targetUserId => ({
      user_id: targetUserId,
      title,
      message,
      type,
      is_read: false
    }))

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications)

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create notifications' }, { status: 400 })
    }

    return NextResponse.json({ 
      message: `Notifications sent to ${targetUserIds.length} user(s)`,
      count: targetUserIds.length
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }

    console.error('Create notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
