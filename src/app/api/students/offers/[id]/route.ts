// src/app/api/students/offers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params // <— await the params Promise
    const { offer_status } = await request.json()

    const supabase = await createClient()

    // Update the offer status
    const { data, error } = await supabase
      .from('offer_letters')
      .update({ offer_status, student_response_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: 'Failed to update offer status' }, { status: 400 })
    }

    return NextResponse.json({ offer: data[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
