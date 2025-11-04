import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find faculty linked to logged-in user
    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (facultyError || !faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
    }

    // Fetch all student ranges for this faculty
    const { data: ranges, error: rangeError } = await supabase
      .from('faculty_student_ranges')
      .select('start_roll_number, end_roll_number')
      .eq('faculty_id', faculty.id)

    if (rangeError) throw rangeError

    if (!ranges || ranges.length === 0) {
      return NextResponse.json({ students: [] })
    }

    // Fetch students within any of the ranges
    let students: any[] = []

    for (const range of ranges) {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .gte('roll_number', range.start_roll_number.toString())
        .lte('roll_number', range.end_roll_number.toString())

      if (studentError) throw studentError
      if (studentData) students = students.concat(studentData)
    }

    return NextResponse.json({ students })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
