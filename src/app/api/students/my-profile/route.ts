import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateProfileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  dob: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  roll_number: z.string().optional(),
  department: z.string().optional(),
  branch: z.string().optional(),
  semester: z.union([z.string(), z.number()]).optional().transform(val => typeof val === 'string' ? parseInt(val) : val),
  cgpa: z.union([z.string(), z.number()]).optional().transform(val => typeof val === 'string' ? parseFloat(val) : val),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  resume_url: z.string().optional(),
  email: z.string().optional(),
  pcp: z.number().optional()
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch or create student row
    let { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code === 'PGRST116') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single()

      const { data: newStudent, error: insertError } = await supabase
        .from('students')
        .insert({
          user_id: user.id,
          roll_number: '',
          department: '',
          semester: null,
          role: 'student',
          email: profile?.email || user.email || null
        })
        .select()
        .single()

      if (insertError) throw insertError
      student = newStudent
    }

    let faculty = null
    let facData = null

    if (student?.roll_number) {
      // Convert to bigint for numeric comparison
      const studentRoll = BigInt(student.roll_number)

      // Fetch faculty range that includes student roll number
      const { data: ranges } = await supabase
        .from('faculty_student_ranges')
        .select('*')

      const matchedRange = ranges?.find(r => {
        return studentRoll >= BigInt(r.start_roll_number) && studentRoll <= BigInt(r.end_roll_number)
      })

      facData = matchedRange || null

      if (matchedRange?.faculty_id) {
        const { data: facultyData } = await supabase
          .from('faculty')
          .select(`*,
            profiles:user_id (
            id,
            full_name,
            email
            )
            `)
          .eq('id', matchedRange.faculty_id)
          .single()
        faculty = facultyData
      }
    }

    return NextResponse.json({ student, faculty, facData })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Update existing student record
    const { data: updatedStudent, error } = await supabase
      .from('students')
      .update({
        ...validatedData,
        department: validatedData.department || validatedData.branch,
        pcp: validatedData.pcp,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ student: updatedStudent })

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.issues }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
