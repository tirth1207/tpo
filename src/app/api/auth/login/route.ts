import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll().map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
              options: {
                path: "/",
              },
            }))
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      },
    )

    // Sign in user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (authError) {
      console.log(authError)
      return NextResponse.json({ error: authError.message }, { status: 401 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Login failed" }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get role-specific data
    let roleData = null
    if (profile.role === "student") {
      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .eq("profile_id", authData.user.id)
        .single()
      roleData = studentData
    } else if (profile.role === "faculty") {
      const { data: facultyData } = await supabase
        .from("faculty")
        .select("*")
        .eq("profile_id", authData.user.id)
        .single()
      roleData = facultyData
    } else if (profile.role === "company") {
      const { data: companyData } = await supabase
        .from("companies")
        .select("*")
        .eq("profile_id", authData.user.id)
        .single()
      roleData = companyData
    }

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email: profile.email,
        role: profile.role,
        firstName: profile.first_name,
        lastName: profile.last_name,
        isApproved: profile.is_approved,
        emailConfirmed: !!authData.user.email_confirmed_at,
        roleData,
      },
      session: authData.session,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data", details: error.issues }, { status: 400 })
    }

    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
