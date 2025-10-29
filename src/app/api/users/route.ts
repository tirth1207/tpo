import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    //console.log("Authenticated user:", user)

    if (!user) {
      //  console.log("Unauthorized access attempt to /api/user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all users (admin only) or current user
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    let query = supabase.from("profiles").select("*")
    //console.log("Initial query:", query)

    if (role) {
      query = query.eq("role", role)
    }
    //console.log("Final query before execution:", query)
    

    const { data, error } = await query
    //console.log("Fetched user data:", data)
    //console.log("data:",data)
    //console.log("error:",error)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
