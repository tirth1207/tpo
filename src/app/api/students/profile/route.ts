import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  branch: z.string().optional(),
  year: z.number().min(1).max(5).optional(),
  cgpa: z.number().min(0).max(10).optional(),
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  trainingExperience: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get profile and student data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    if (studentError || !studentData) {
      return NextResponse.json({ error: 'Student data not found' }, { status: 404 })
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        isApproved: profile.is_approved,
        createdAt: profile.created_at,
      },
      student: studentData,
    })

  } catch (error) {
    console.error('Get student profile error:', error)
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

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Update profile table
    const profileUpdates: any = {}
    if (validatedData.firstName) profileUpdates.first_name = validatedData.firstName
    if (validatedData.lastName) profileUpdates.last_name = validatedData.lastName

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id)

      if (profileError) {
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 400 })
      }
    }

    // Update student table
    const studentUpdates: any = {}
    if (validatedData.phone) studentUpdates.phone = validatedData.phone
    if (validatedData.address) studentUpdates.address = validatedData.address
    if (validatedData.branch) studentUpdates.branch = validatedData.branch
    if (validatedData.year) studentUpdates.year = validatedData.year
    if (validatedData.cgpa !== undefined) studentUpdates.cgpa = validatedData.cgpa
    if (validatedData.skills) studentUpdates.skills = validatedData.skills
    if (validatedData.certifications) studentUpdates.certifications = validatedData.certifications
    if (validatedData.trainingExperience) studentUpdates.training_experience = validatedData.trainingExperience

    if (Object.keys(studentUpdates).length > 0) {
      const { error: studentError } = await supabase
        .from('students')
        .update(studentUpdates)
        .eq('profile_id', user.id)

      if (studentError) {
        return NextResponse.json({ error: 'Failed to update student data' }, { status: 400 })
      }
    }

    return NextResponse.json({ message: 'Profile updated successfully' })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }

    console.error('Update student profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}