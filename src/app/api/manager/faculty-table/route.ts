import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch faculties
    const { data: faculties, error: facultiesError } = await supabase
      .from("faculty")
      .select(`id, department, profiles:user_id(id, full_name)`)
      .order("department", { ascending: true });

    if (facultiesError) throw facultiesError;

    // Fetch ranges
    const { data: ranges, error: rangesError } = await supabase
      .from("faculty_student_ranges")
      .select(`id, faculty_id, start_roll_number, end_roll_number, faculty:faculty_id(id, department, profiles:user_id(id, full_name))`)
      .order("start_roll_number", { ascending: true });

    if (rangesError) throw rangesError;

    return NextResponse.json({ faculties: faculties || [], ranges: ranges || [] });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { faculty_id, start_roll_number, end_roll_number, updated_by } = body;
    console.log(body);
    if (!faculty_id || !start_roll_number || !end_roll_number || !updated_by) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Set audit session so DB trigger can record the actor for this write
    try {
      await supabase.rpc('set_audit_session', { p_actor_id: updated_by, p_actor_role: 'manager', p_skip: false })
    } catch (rpcErr) {
      console.warn('set_audit_session failed (non-blocking):', rpcErr)
    }

    const { error } = await supabase.from("faculty_student_ranges").insert([
      { faculty_id, start_roll_number, end_roll_number, updated_by },
    ]);

    if (error) throw error;

    return NextResponse.json({ message: "Range added successfully" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
      const id = req.nextUrl.searchParams.get("id");
    const updated_by = req.nextUrl.searchParams.get("updated_by")

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    // If caller provided updated_by, set audit session so trigger records actor
    if (updated_by) {
      try {
        await supabase.rpc('set_audit_session', { p_actor_id: updated_by, p_actor_role: 'manager', p_skip: false })
      } catch (rpcErr) {
        console.warn('set_audit_session failed (non-blocking):', rpcErr)
      }
    }

    const { error } = await supabase.from("faculty_student_ranges").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ message: "Range deleted successfully" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
