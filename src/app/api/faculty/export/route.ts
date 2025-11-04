import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient(); // ✅ await the async function
    const { dataTypes, fromDate, toDate } = await request.json();
    const result: Record<string, any> = {};

    const filterByDate = (query: any, column: string) => {
      if (fromDate) query = query.gte(column, fromDate);
      if (toDate) query = query.lte(column, toDate);
      return query;
    };

    if (dataTypes.includes("student_profiles")) {
      let query = supabase.from("students").select("*");
      query = filterByDate(query, "created_at");
      const { data, error } = await query;
      if (error) throw error;
      result.student_profiles = data;
    }

    if (dataTypes.includes("applications")) {
      let query = supabase
        .from("applications")
        .select(`
          id,
          status,
          applied_at,
          students!inner(first_name, last_name, roll_number),
          jobs!inner(title, company_id, companies!inner(company_name))
        `);
      query = filterByDate(query, "applied_at");
      const { data, error } = await query;
      if (error) throw error;
      result.applications = data;
    }

    if (dataTypes.includes("placement_stats")) {
      const { data, error } = await supabase.from("students").select("department, semester, cgpa");
      if (error) throw error;
      result.placement_stats = data;
    }

    if (dataTypes.includes("company_data")) {
      const { data, error } = await supabase.from("companies").select("*");
      if (error) throw error;
      result.company_data = data;
    }

    return NextResponse.json({ result });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to fetch export data" }, { status: 500 });
  }
}
