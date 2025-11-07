import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create student profile
    let { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (studentError && studentError.code === 'PGRST116') {
      // Student profile doesn't exist, create one
      const { data: newStudent, error: insertError } = await supabase
        .from('students')
        .insert({
          user_id: user.id,
          roll_number: '',
          department: '',
          semester: null,
          role: 'student',
          email: user.email || null
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Failed to create student profile:', insertError)
        return NextResponse.json({ error: 'Failed to create student profile' }, { status: 500 })
      }
      student = newStudent
    } else if (studentError) {
      return NextResponse.json({ error: 'Failed to fetch student profile' }, { status: 400 })
    }

    // Get applications with job details
    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select(`
        *,
        jobs!inner(
          id,
          title,
          description,
          location,
          salary_min,
          salary_max,
          job_type,
          application_deadline,
          companies!inner(
            company_name,
            industry
          )
        )
      `)
      .eq('student_id', student?.id)
      .order('applied_at', { ascending: false })

    if (applicationsError) {
      console.log(applicationsError)
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 400 })
    }

    return NextResponse.json({ applications })

  } catch (error) {
    console.error('Get student applications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('id')

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 })
    }

    // Verify the application belongs to the student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .select('id, status')
      .eq('id', applicationId)
      .eq('student_id', student.id)
      .single()

    if (applicationError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Only allow deletion if status is 'applied'
    if (application.status !== 'applied') {
      return NextResponse.json({ error: 'Cannot delete application that has been reviewed' }, { status: 400 })
    }

    // Delete the application
    const { error: deleteError } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete application' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Application deleted successfully' })

  } catch (error) {
    console.error('Delete application error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}