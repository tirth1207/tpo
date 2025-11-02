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

    // Get offer letters with job and company details
    const { data: offers, error: offersError } = await supabase
      .from('offer_letters')
      .select(`
        *,
        applications!inner(
          jobs!inner(
            title,
            companies!inner(
              company_name
            )
          )
        )
      `)
      .eq('student_id', student!.id)
      .order('created_at', { ascending: false })

    if (offersError) {
      return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 400 })
    }

    return NextResponse.json({ offers })

  } catch (error) {
    console.error('Get student offers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
