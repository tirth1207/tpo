import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server' // <- your SSR wrapper
import { z } from 'zod'

const updateProfileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  dob: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  roll_number: z.string().optional(),
  department: z.string().optional(),
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
    const supabase = await createClient() // <-- SSR client reads cookies automatically

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // fetch or create student row
    let { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code === 'PGRST116') {
      // Fetch email from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single()

      // row doesn't exist, insert a blank row
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

    return NextResponse.json({ student })

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

    // Check if student record exists
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!existingStudent) {
      // Create new student record if it doesn't exist
      const { data: newStudent, error: insertError } = await supabase
        .from('students')
        .insert({
          user_id: user.id,
          ...validatedData,
          role: 'student',
          email: validatedData.email || user.email || null
        })
        .select()
        .single()

      if (insertError) throw insertError
      return NextResponse.json({ student: newStudent })
    }

    // Update existing student record
    const { data: updatedStudent, error } = await supabase
      .from('students')
      .update({
        ...validatedData,
        pcp: validatedData.pcp, // <-- save PCP in `pcp` column
        updated_at: new Date().toISOString(),
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
