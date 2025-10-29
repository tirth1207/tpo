import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const applyJobSchema = z.object({
  jobId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { jobId } = applyJobSchema.parse(body)

    // Get student ID
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    // Check if job exists and is active
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, application_deadline, status')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.status !== 'active') {
      return NextResponse.json({ error: 'Job is not active' }, { status: 400 })
    }

    // Check if application deadline has passed
    const deadline = new Date(job.application_deadline)
    if (deadline < new Date()) {
      return NextResponse.json({ error: 'Application deadline has passed' }, { status: 400 })
    }

    // Check if student has already applied
    const { data: existingApplication, error: existingError } = await supabase
      .from('applications')
      .select('id')
      .eq('student_id', student.id)
      .eq('job_id', jobId)
      .single()

    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied for this job' }, { status: 400 })
    }

    // Create application
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .insert({
        student_id: student.id,
        job_id: jobId,
        status: 'applied',
      })
      .select()
      .single()

    if (applicationError) {
      return NextResponse.json({ error: 'Failed to create application' }, { status: 400 })
    }

    // Create notification for the student
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Application Submitted',
        message: 'Your application has been submitted successfully. You will be notified of updates.',
        type: 'success',
      })

    return NextResponse.json({ 
      message: 'Application submitted successfully',
      application 
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }

    console.error('Apply for job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}