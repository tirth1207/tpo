import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const jobId = params.id

    // Get job details with company information
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        companies!inner(
          id,
          company_name,
          industry,
          contact_person,
          phone,
          website,
          description,
          profiles!inner(
            is_approved
          )
        )
      `)
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Only show job if company is approved or user is admin/faculty
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !['admin', 'faculty'].includes(profile.role)) {
        if (!job.companies.profiles.is_approved) {
          return NextResponse.json({ error: 'Company not approved' }, { status: 403 })
        }
      }
    } else {
      if (!job.companies.profiles.is_approved) {
        return NextResponse.json({ error: 'Company not approved' }, { status: 403 })
      }
    }

    // Get application count
    const { count: applicationCount } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('job_id', jobId)

    return NextResponse.json({
      job: {
        ...job,
        applicationCount: applicationCount || 0
      }
    })

  } catch (error) {
    console.error('Get job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const jobId = params.id
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is the company owner or admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get job to verify ownership
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        companies!inner(
          profile_id
        )
      `)
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check permissions
    if (profile.role !== 'admin' && job.companies.profile_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const updateData = body

    // Update job
    const { error: updateError } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', jobId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update job' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Job updated successfully' })

  } catch (error) {
    console.error('Update job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const jobId = params.id
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is the company owner or admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get job to verify ownership
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        companies!inner(
          profile_id
        )
      `)
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check permissions
    if (profile.role !== 'admin' && job.companies.profile_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete job (this will cascade to applications)
    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete job' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Job deleted successfully' })

  } catch (error) {
    console.error('Delete job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}