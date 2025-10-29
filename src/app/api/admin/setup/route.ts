import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const setupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

// This route should only be accessible when no admin exists
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = setupSchema.parse(body)

    const adminSupabase = createAdminClient()

    // Check if admin already exists
    const { data: existingAdmin } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)

    if (existingAdmin && existingAdmin.length > 0) {
      return NextResponse.json(
        { error: 'Admin user already exists' },
        { status: 400 }
      )
    }

    // Create admin user in Supabase Auth
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true, // Auto-confirm admin email
    })

    if (authError) {
      console.error('Admin creation error:', authError.message)
      return NextResponse.json(
        { error: 'Failed to create admin user', details: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Admin user creation failed' },
        { status: 400 }
      )
    }

    // Create admin profile
    const { error: profileError } = await adminSupabase.from('profiles').insert({
      id: authData.user.id,
      email: validatedData.email,
      role: 'admin',
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      is_approved: true, // Admin is auto-approved
    })

    if (profileError) {
      // Cleanup auth user if profile creation fails
      await adminSupabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create admin profile', details: profileError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Admin user created successfully',
      admin: {
        id: authData.user.id,
        email: validatedData.email,
        role: 'admin',
      },
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Admin setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
