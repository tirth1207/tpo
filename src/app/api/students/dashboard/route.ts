import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ✅ 1️⃣ Get logged-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ✅ 2️⃣ Ensure student exists
    let { data: student, error: studentError } = await supabase
      .from("students")
      .select(`id, pcp,*`)
      .eq("user_id", user.id)
      .single();

    if (studentError) {
      if (studentError.code === "PGRST116") {
        const { data: newStudent, error: insertError } = await supabase
          .from("students")
          .insert({
            user_id: user.id,
            roll_number: "",
            department: "",
            semester: null,
            role: "student",
            email: user.email || null,
          })
          .select("id, pcp")
          .single();

        if (insertError) {
          console.error("Failed creating student:", insertError);
          return NextResponse.json(
            { error: "Failed to create student profile" },
            { status: 500 }
          );
        }

        student = newStudent; // ← assign entire object
      } else {
        return NextResponse.json(
          { error: "Failed to fetch student profile" },
          { status: 400 }
        );
      }
    }


    // ✅ 3️⃣ Dashboard Stats
    const [
      { count: applications = 0 },
      { count: interviews = 0 },
      { count: offers = 0 },
    ] = await Promise.all([
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("student_id", student?.id),

      supabase
        .from("applications")
        .select("interviews!inner(*)", { count: "exact", head: true })
        .eq("student_id", student?.id),

      supabase
        .from("applications")
        .select("offer_letters!inner(*)", { count: "exact", head: true })
        .eq("student_id", student?.id),
    ])

    // ✅ 4️⃣ Last 3 apps with company + job join
    const { data: recentApplications = [], error: recentError } = await supabase
      .from("applications")
      .select(
        `
        id,
        status,
        applied_at,
        jobs:jobs(
          title,
          companies:company_id(
            company_name
          )
        )
      `
      )
      .eq("student_id", student?.id)
      .order("applied_at", { ascending: false })
      .limit(3)

    if (recentError) {
      console.error("Failed fetching recent apps:", recentError)
      return NextResponse.json(
        { error: "Failed to fetch recent applications" },
        { status: 400 }
      )
    }

    // ✅ 5️⃣ Shape response for your React component
    return NextResponse.json({
      stats: {
        applications,
        interviews,
        offers,
      },
      recentApplications,
      student 
  })
  } catch (err) {
    console.error("Server Error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
