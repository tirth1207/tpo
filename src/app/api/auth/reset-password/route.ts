import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const updatePasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  token: z.string().min(1, 'Reset token is required'),
})

// Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = resetPasswordSchema.parse(body)

    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${request.headers.get('origin')}/auth/reset-password`,
    })

    if (error) {
      console.error('Password reset error:', error.message)
      return NextResponse.json(
        { error: 'Failed to send reset email', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Password reset email sent successfully',
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update password with token
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, token } = updatePasswordSchema.parse(body)

    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      console.error('Password update error:', error.message)
      return NextResponse.json(
        { error: 'Failed to update password', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Password updated successfully',
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Password update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
