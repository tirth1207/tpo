import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const verifySchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(1, 'Verification token is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, token } = verifySchema.parse(body)

    const supabase = createClient()

    // Verify the email with the token
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (error) {
      console.error('Email verification error:', error.message)
      return NextResponse.json(
        { error: 'Email verification failed', details: error.message },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Email verified successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        emailConfirmed: data.user.email_confirmed_at !== null,
      },
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Resend verification email
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = z.object({ email: z.string().email() }).parse(body)

    const supabase = createClient()

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${request.headers.get('origin')}/auth/callback`,
      },
    })

    if (error) {
      console.error('Resend verification error:', error.message)
      return NextResponse.json(
        { error: 'Failed to resend verification email', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Verification email sent successfully',
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}