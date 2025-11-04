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
      .select(`id, department, profiles:user_id (id, full_name)`)
      .eq("user_id", user.id)
      .single();

    if (facultyError || !faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    const facultyId = faculty.id;

    // 3️⃣ Get all ranges assigned to this faculty
    const { data: ranges, error: rangesError } = await supabase
      .from("faculty_student_ranges")
      .select("start_roll_number, end_roll_number")
      .eq("faculty_id", facultyId);

    if (rangesError) {
      return NextResponse.json({ error: "Failed to fetch faculty ranges" }, { status: 500 });
    }

    // 4️⃣ Fetch students whose roll_number falls in any of the ranges
    let students: any[] = [];
    for (const range of ranges || []) {
      const { data: studentsInRange, error: studentError } = await supabase
        .from("students")
        .select(`
          id,
          first_name,
          last_name,
          roll_number,
          is_approved,
          approved_at,
          skills,
          resume_url,
          bio,
          email,
          cgpa,
          semester
        `)
        .gte("roll_number", range.start_roll_number)
        .lte("roll_number", range.end_roll_number)
        .order("roll_number", { ascending: true });

      if (studentError) {
        console.error(studentError);
      } else {
        students.push(...(studentsInRange || []));
      }
    }

    // 5️⃣ Quick stats
    const totalStudents = students.length;
    const pendingApprovals = students.filter((s) => !s.is_approved).length;
    const approvedToday = students.filter(
      (s) => s.approved_at && new Date(s.approved_at).toDateString() === new Date().toDateString()
    ).length;

    // 6️⃣ Recent student applications
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
          companies:company_id (
            company_name,
            industry,
            website)
        )
      `)
      .in("student_id", students.map((s) => s.id))
      .order("applied_at", { ascending: false })
      .limit(5);

    if (applicationsError) {
      console.error(applicationsError);
    }

    // 7️⃣ Department performance metrics
    const completeProfiles = students.filter(
      (s) => s.skills?.length && s.resume_url && s.bio
    ).length;

    const activeApplications = applications?.length || 0;

    // 8️⃣ Students placed & average package
    const { data: offers } = await supabase
      .from("offer_letters")
      .select("salary, student_id")
      .in("student_id", students.map((s) => s.id))
      .eq("offer_status", "accepted");

    const studentsPlaced = offers?.length || 0;
    const averagePackage = offers?.reduce((sum, o) => sum + Number(o.salary || 0), 0) || 0 / (studentsPlaced || 1); 

    return NextResponse.json({
      faculty,
      students,
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
