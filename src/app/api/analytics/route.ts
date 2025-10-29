import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get various analytics
    const [profilesCount, studentsCount, companiesCount, jobsCount, applicationsCount] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase.from("companies").select("*", { count: "exact", head: true }),
      supabase.from("jobs").select("*", { count: "exact", head: true }),
      supabase.from("applications").select("*", { count: "exact", head: true }),
    ])
    console.log("Analytics fetched:", {
      profiles: profilesCount.count,
      students: studentsCount.count,
      application: applicationsCount.count,
      companies: companiesCount.count,
      jobs: jobsCount.count,
    })
    return NextResponse.json({
      total_profiles: profilesCount.count || 0,
      total_students: studentsCount.count || 0,
      total_companies: companiesCount.count || 0,
      total_jobs: jobsCount.count || 0,
      total_applications: applicationsCount.count || 0,
    })
    
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
