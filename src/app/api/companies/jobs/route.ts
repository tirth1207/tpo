import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createJobSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  requirements: z.array(z.string()),
  location: z.string().min(1),
  salaryMin: z.number().min(0),
  salaryMax: z.number().min(0),
  jobType: z.enum(['full-time', 'part-time', 'internship']),
  applicationDeadline: z.string().datetime(),
})

const updateJobSchema = createJobSchema.partial().extend({
  status: z.enum(['active', 'inactive', 'closed']).optional(),
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
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('company_id', company.id)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: jobs, error: jobsError } = await query
      .order('created_at', { ascending: false })

    if (jobsError) {
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 400 })
    }

    return NextResponse.json({ jobs })

  } catch (error) {
    console.error('Get company jobs error:', error)
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
    const validatedData = createJobSchema.parse(body)

    // Create job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        company_id: company.id,
        title: validatedData.title,
        description: validatedData.description,
        requirements: validatedData.requirements,
        location: validatedData.location,
        salary_min: validatedData.salaryMin,
        salary_max: validatedData.salaryMax,
        job_type: validatedData.jobType,
        application_deadline: validatedData.applicationDeadline,
        status: 'active'
      })
      .select()
      .single()

    if (jobError) {
      return NextResponse.json({ error: 'Failed to create job' }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Job created successfully',
      job 
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }

    console.error('Create job error:', error)
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
    const { jobId, ...updateData } = updateJobSchema.parse(body)

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Verify job belongs to company
    const { data: existingJob, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .eq('company_id', company.id)
      .single()

    if (jobError || !existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Update job
    const updateFields: any = {}
    if (updateData.title) updateFields.title = updateData.title
    if (updateData.description) updateFields.description = updateData.description
    if (updateData.requirements) updateFields.requirements = updateData.requirements
    if (updateData.location) updateFields.location = updateData.location
    if (updateData.salaryMin !== undefined) updateFields.salary_min = updateData.salaryMin
    if (updateData.salaryMax !== undefined) updateFields.salary_max = updateData.salaryMax
    if (updateData.jobType) updateFields.job_type = updateData.jobType
    if (updateData.applicationDeadline) updateFields.application_deadline = updateData.applicationDeadline
    if (updateData.status) updateFields.status = updateData.status

    const { error: updateError } = await supabase
      .from('jobs')
      .update(updateFields)
      .eq('id', jobId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update job' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Job updated successfully' })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }

    console.error('Update job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

