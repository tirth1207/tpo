import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { job_id } = body;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!student) {
      return NextResponse.json(
        { error: "No student profile found" },
        { status: 400 }
      );
    }

    const { error: applyError } = await supabase
      .from("applications")
      .insert({
        job_id,
        student_id: student.id,
      });

    if (applyError) {
      return NextResponse.json({ error: applyError.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Application successful ✅",
    });
  } catch (error) {
    console.error("Apply Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
