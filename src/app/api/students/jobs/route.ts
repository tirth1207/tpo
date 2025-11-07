import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Get logged-in student
    let { data: student, error: studentError } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (studentError && studentError.code === "PGRST116") {
      // ✅ Create student profile if not exists
      const { data: newStudent } = await supabase
        .from("students")
        .insert({
          user_id: user.id,
          roll_number: "",
          department: "",
          semester: null,
          role: "student",
          email: user.email,
        })
        .select("id")
        .single();

      student = newStudent;
    } else if (studentError) {
      return NextResponse.json(
        { error: "Failed to fetch student profile" },
        { status: 400 }
      );
    }

    // ✅ Fetch student's applications
    const { data: applications } = await supabase
      .from("applications")
      .select("job_id, status")
      .eq("student_id", student?.id);

    const appliedJobIds = applications?.map((app) => app.job_id) || [];

    // ✅ Fetch Approved Jobs Only
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select(`
        id,
        title,
        description,
        requirements,
        skills_required,
        salary_min,
        salary_max,
        job_type,
        location,
        application_deadline,
        is_active,
        is_approved,
        created_at,
        companies!jobs_company_id_fkey (
          id,
          company_name
        ),
        profiles!jobs_posted_by_fkey (
          id,
          email,
          full_name
        )
      `)
      .eq("is_approved", "approved")
      .order("created_at", { ascending: false });

    if (jobsError) {
      console.error(jobsError);
      return NextResponse.json({ error: "failed to fetch jobs" });
    }

    return NextResponse.json({
      jobs,
      appliedJobIds, // 🔥 Send list of applied jobs
    });
  } catch (error) {
    console.error("Job Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
