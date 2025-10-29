import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const approveCompanySchema = z.object({
  companyId: z.string().uuid(),
  action: z.enum(['true', 'false']),
  status: z.enum(['approved', 'rejected']),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // 🔹 Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 🔹 Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can approve companies' }, { status: 403 })
    }

    // 🔹 Validate body
    const body = await request.json()
    const { companyId, action, notes, status } = approveCompanySchema.parse(body)
    console.log("Parsed request body:", { companyId, action, notes, status })

    // 🔹 Fetch company profile
    const { data: companyProfile, error: companyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', companyId)
      .single()

    console.log("Company profile fetched:", companyProfile)
    if (companyError || !companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 })
    }

    if (companyProfile.approval_status === 'approved' && status === 'approved') {
      return NextResponse.json({ error: 'Company already approved' }, { status: 400 })
    }

    // 🔹 Update approval status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_active: action === 'true',
        approval_status: status, // now correctly defined
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', companyId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update company approval' }, { status: 400 })
    }

    // 🔹 Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: companyId,
        title: status === 'approved' ? 'Account Approved' : 'Account Rejected',
        message:
          status === 'approved'
            ? 'Your company account has been approved. You can now post jobs and manage applications.'
            : `Your company account has been rejected. ${notes || 'Please contact admin for more details.'}`,
        type: status === 'approved' ? 'success' : 'error',
      })

    return NextResponse.json({
      message: `Company ${status} successfully`,
      company: {
        id: companyProfile.id,
        email: companyProfile.email,
        name: companyProfile.full_name,
        status,
      },
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Approve company error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
