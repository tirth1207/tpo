import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // ✅ Verify faculty
    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .select('id, department')
      .eq('user_id', user.id)
      .single()
    if (facultyError || !faculty) return NextResponse.json({ error: 'Not faculty' }, { status: 403 })

    // ✅ Fetch ranges assigned to this faculty
    const { data: ranges, error: rangesError } = await supabase
      .from('faculty_student_ranges')
      .select('start_roll_number, end_roll_number')
      .eq('faculty_id', faculty.id)
    if (rangesError) throw rangesError
    if (!ranges || ranges.length === 0) return NextResponse.json({ faculty, students: [] })

    // ✅ Fetch students under ranges
    const students: any[] = []
    for (const range of ranges) {
      const { data: studentsInRange, error: studentsError } = await supabase
        .from('students')
        .select('id, roll_number, first_name, last_name, department, created_at, email')
        .eq('is_approved', false)
        .gte('roll_number', range.start_roll_number)
        .lte('roll_number', range.end_roll_number)
      if (studentsError) throw studentsError
      if (studentsInRange) students.push(...studentsInRange)
    }

    // ✅ Transform for frontend
    const approvals = students.map(s => ({
      id: s.id,
      studentName: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
      rollNo: s.roll_number,
      department: s.department,
      type: 'Profile Approval',
      status: 'Pending',
      submittedDate: s.created_at,
      email: s.email
    }))

    return NextResponse.json({ approvals })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
