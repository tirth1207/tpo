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

    // Check if user is a company
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'company') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get company ID
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('job_id')
    const status = searchParams.get('status')

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
          phone,
          address,
          skills,
          certifications,
          training_experience,
          resume_url,
          profile_pic_url,
          profiles!inner(
            id,
            email,
            first_name,
            last_name,
            created_at
          )
        ),
        jobs!inner(
          id,
          title,
          description,
          requirements,
          location,
          salary_min,
          salary_max,
          job_type,
          application_deadline
        )
      `)
      .eq('jobs.company_id', company.id)

    if (jobId) {
      query = query.eq('job_id', jobId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: applications, error: applicationsError } = await query
      .order('applied_at', { ascending: false })

    if (applicationsError) {
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 400 })
    }

    return NextResponse.json({ applications })

  } catch (error) {
    console.error('Get company applications error:', error)
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

    // Check if user is a company
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'company') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get company ID
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { applicationId, status, notes } = updateApplicationSchema.parse(body)

    // Verify application belongs to company's job
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        student_id,
        jobs!inner(
          id,
          company_id,
          title
        )
      `)
      .eq('id', applicationId)
      .eq('jobs.company_id', company.id)
      .single()

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

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

    // Create notification for student
    await supabase
      .from('notifications')
      .insert({
        user_id: application.student_id,
        title: 'Application Status Updated',
        message: `Your application for ${application.jobs.title} has been ${status.replace('_', ' ')}.`,
        type: status === 'selected' ? 'success' : status === 'rejected' ? 'error' : 'info',
      })

    return NextResponse.json({ message: 'Application updated successfully' })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }

    console.error('Update application error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}





