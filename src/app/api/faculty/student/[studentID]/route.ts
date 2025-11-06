import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ studentID: string }> }
) {
  const { studentID } = await context.params // ✅ await the promise

  try {
    const supabase = await createClient()

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentID)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const { data: applications } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        applied_at,
        jobs (
          id,
          title,
          companies(
            company_name,
            website
          )
        )
      `)
      .eq("student_id", studentID)

    return NextResponse.json({
      student,
      applications: applications ?? []
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}


export async function POST(
  req: NextRequest,
  context: { params: Promise<{ studentID: string }> }
) {
  const { studentID } = await context.params // ✅ await here too

  try {
    const body = await req.json()
    const { status } = body

    if (!status || !["Approved", "Rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const isApproved = status === "Approved"

    const supabase = await createClient()
    const { data: updatedStudent, error } = await supabase
      .from("students")
      .update({
        is_approved: isApproved,
        status: status,
        approved_at: new Date()
      })
      .eq("id", studentID)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: `Student ${status.toLowerCase()} successfully ✅`,
      student: updatedStudent
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Approval failed" }, { status: 500 })
  }
}

