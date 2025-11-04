import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface Params {
  id: string
}

export async function PUT(req: NextRequest, { params }: { params: Params | Promise<Params> }) {
  try {
    // Unwrap params if it's a promise
    const { id } = await params

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    if (!status || !["Approved", "Rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Set is_approved true only if status is "Approved", false otherwise
    const isApproved = status === "Approved"

    const { data: updatedStudent, error } = await supabase
      .from("students")
      .update({
        is_approved: isApproved,
        status: status,
        approved_by: user.id,
        approved_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json({ error: "Failed to update student status" }, { status: 500 })
    }

    return NextResponse.json({ student: updatedStudent })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
