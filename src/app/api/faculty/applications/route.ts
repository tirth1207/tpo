// import { supabase } from "@/lib/supabase/supabaseClient"
import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    // 1️⃣ Get logged-in user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2️⃣ Get faculty linked to user
    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (facultyError || !faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
    }

    // 3️⃣ Get all student ranges for this faculty
    const { data: ranges, error: rangeError } = await supabase
      .from('faculty_student_ranges')
      .select('start_roll_number, end_roll_number')
      .eq('faculty_id', faculty.id)

    if (rangeError) throw rangeError
    if (!ranges || ranges.length === 0) {
      return NextResponse.json({ students: [], applications: [] })
    }

    // 4️⃣ Fetch students in any of the ranges
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

    if (students.length === 0) {
      return NextResponse.json({ students: [], applications: [] })
    }

    // 5️⃣ Fetch applications for these students
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        interview_date,
        student_id,
        students!inner(first_name, last_name, roll_number),
        jobs!inner(title, company_id, companies!inner(company_name))
      `)
      .in('student_id', students.map((s) => s.id))
      .order('applied_at', { ascending: false })

    if (appError) throw appError

    return NextResponse.json({ students, applications })
  } catch (err) {
    console.error("API fetch error:", err)
    return NextResponse.json({ error: "Failed to fetch students or applications" }, { status: 500 })
  }
}
