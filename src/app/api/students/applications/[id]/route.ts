import { supabase } from "@/lib/supabase/supabaseClient"
import { NextRequest, NextResponse } from "next/server"

// GET /api/students/applications/[id]
export async function GET(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    // unwrap params if it's a promise
    const params = await context.params
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 })
    }

    // Fetch the application by ID along with reviewer profile
    const { data: application, error: appError } = await supabase
        .from("applications")
        .select(`
            *,
            profiles (
            id,
            full_name,
            email
            ),
            jobs (
            id,
            title,
            job_type,
            location,
            salary_min,
            salary_max,
            application_deadline,
            companies (
                company_name,
                industry
            )
            )
        `)
        .eq("id", id)
        .single()

        if (appError) throw appError


        return NextResponse.json({ application })

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    )
  }
}
