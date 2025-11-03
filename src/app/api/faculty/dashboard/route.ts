// app/api/faculty/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 1️⃣ Get logged-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Get faculty info
    const { data: faculty, error: facultyError } = await supabase
      .from("faculty")
      .select("id, department")
      .eq("user_id", user.id)
      .single();

    if (facultyError || !faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    const facultyId = faculty.id;

    // 3️⃣ Fetch students under this faculty
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id, first_name, last_name, is_approved, approved_at, skills, resume_url, bio")
      .eq("faculty_id", facultyId);

    if (studentsError) {
      return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
    }

    // 4️⃣ Quick stats
    const totalStudents = students?.length || 0;
    const pendingApprovals = students?.filter((s) => !s.is_approved).length || 0;
    const approvedToday = students?.filter(
      (s) => s.approved_at && new Date(s.approved_at).toDateString() === new Date().toDateString()
    ).length || 0;

    // 5️⃣ Recent student applications
    const { data: applications, error: applicationsError } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        applied_at,
        student_id,
        jobs (
          id,
          title,
          company_id
        )
      `)
      .in("student_id", students?.map((s) => s.id) || [])
      .order("applied_at", { ascending: false })
      .limit(5);

    if (applicationsError) {
      console.error(applicationsError);
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
    }


    // 6️⃣ Department performance metrics
    const completeProfiles = students?.filter(
      (s) => s.skills?.length && s.resume_url && s.bio
    ).length;

    const activeApplications = applications?.length || 0;

    // 7️⃣ Students placed & average package
    const { data: offers } = await supabase
      .from("offer_letters")
      .select("salary, student_id")
      .in(
        "student_id",
        students?.map((s) => s.id) || []
      )
      .eq("offer_status", "accepted");

    const studentsPlaced = offers?.length || 0;
    const averagePackage =
      offers?.reduce((sum, o) => sum + Number(o.salary || 0), 0) / (studentsPlaced || 1);

    return NextResponse.json({
      quickStats: {
        totalStudents,
        pendingApprovals,
        approvedToday,
      },
      recentApplications: applications || [],
      departmentPerformance: {
        completeProfiles,
        activeApplications,
        studentsPlaced,
        averagePackage,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
