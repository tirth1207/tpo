import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateApplicationSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(['under_review', 'shortlisted', 'rejected', 'selected']),
  notes: z.string().optional(),
})

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
    const status = searchParams.get('status')
    const studentId = searchParams.get('student_id')
    const jobId = searchParams.get('job_id')

    // Build query
    let query = supabase
      .from('applications')
      .select(`
        *,
        students!inner(
          id,
          roll_number,
          branch,
          year,
          cgpa,
          profiles!inner(
            id,
            email,
            first_name,
            last_name
          )
        ),
        jobs!inner(
          id,
          title,
          location,
          companies!inner(
            company_name,
            industry
          )
        )
      `)

    if (status) {
      query = query.eq('status', status)
    }

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    if (jobId) {
      query = query.eq('job_id', jobId)
    }

    const { data: applications, error: applicationsError } = await query
      .order('applied_at', { ascending: false })

    if (applicationsError) {
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 400 })
    }

    return NextResponse.json({ applications })

  } catch (error) {
    console.error('Get applications error:', error)
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
    const { applicationId, status, notes } = updateApplicationSchema.parse(body)

    // Update application
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        status,
        notes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id
      })
      .eq('id', applicationId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update application' }, { status: 400 })
    }

    // Get application details for notification
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        student_id,
        jobs!inner(title, companies!inner(company_name))
      `)
      .eq('id', applicationId)
      .single()

    if (!appError && application) {
      // Create notification for student
      await supabase
        .from('notifications')
        .insert({
          user_id: application.student_id,
          title: 'Application Status Updated',
          message: `Your application for ${application.jobs.companies.company_name} - ${application.jobs.title} has been ${status.replace('_', ' ')}.`,
          type: status === 'selected' ? 'success' : status === 'rejected' ? 'error' : 'info',
        })
    }

    return NextResponse.json({ message: 'Application updated successfully' })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }

    console.error('Update application error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
