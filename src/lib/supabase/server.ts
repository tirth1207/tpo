import { createServerClient as createServerClientSSR } from "@supabase/ssr"
import { cookies } from "next/headers"

// Create a Supabase client for use in Server Components and Route Handlers
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClientSSR(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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
      setAll() {
        // No-op: Cookies cannot be set in server components
      },
    },
  })
}

// Create an admin Supabase client for use in Server Components and Route Handlers
// This uses the service role key for admin operations
export async function createAdminClient() {
  const cookieStore = await cookies()

  return createServerClientSSR(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
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
  })
}
