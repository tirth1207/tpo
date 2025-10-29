import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  companyName: z.string().min(1).optional(),
  industry: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get profile and company data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    if (companyError || !companyData) {
      return NextResponse.json({ error: 'Company data not found' }, { status: 404 })
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
      company: companyData,
    })

  } catch (error) {
    console.error('Get company profile error:', error)
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

    // Update company table
    const companyUpdates: any = {}
    if (validatedData.companyName) companyUpdates.company_name = validatedData.companyName
    if (validatedData.industry) companyUpdates.industry = validatedData.industry
    if (validatedData.contactPerson) companyUpdates.contact_person = validatedData.contactPerson
    if (validatedData.phone) companyUpdates.phone = validatedData.phone
    if (validatedData.website) companyUpdates.website = validatedData.website
    if (validatedData.description) companyUpdates.description = validatedData.description

    if (Object.keys(companyUpdates).length > 0) {
      const { error: companyError } = await supabase
        .from('companies')
        .update(companyUpdates)
        .eq('profile_id', user.id)

      if (companyError) {
        return NextResponse.json({ error: 'Failed to update company data' }, { status: 400 })
      }
    }

    return NextResponse.json({ message: 'Profile updated successfully' })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }

    console.error('Update company profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}





