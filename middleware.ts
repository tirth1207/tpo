// middleware.ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env

  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.next({ request })
  }

  const response = NextResponse.next({ request })

  const supabase = createServerClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: () => {},
    },
  })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const protectedRoutes = ["/student", "/students", "/faculty", "/company", "/admin"]
    const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

    const isAuthPage =
      request.nextUrl.pathname.startsWith("/auth/login") || request.nextUrl.pathname.startsWith("/auth/register")

    // Redirect unauthenticated users from protected routes to login
    if (!user && isProtectedRoute) {
      const redirectUrl = new URL("/auth/login", request.url)
      redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect authenticated users away from auth pages to their dashboard
    if (user && isAuthPage) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (profile) {
        let redirectPath = "/"
        switch (profile.role) {
          case "admin":
            redirectPath = "/admin/dashboard"
            break
          case "student":
            redirectPath = "/student/dashboard"
            break
          case "faculty":
            redirectPath = "/faculty/dashboard"
            break
          case "company":
            redirectPath = "/company/dashboard"
            break
        }
        return NextResponse.redirect(new URL(redirectPath, request.url))
      }
    }

    return response
  } catch (error) {
    console.error("Supabase middleware error:", error)
    return response
  }
}

// Run middleware on all paths except _next/static, _next/image, favicon.ico, and public assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
