import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  // Check if environment variables are set up
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase environment variables are not configured. Please set up your .env.local file.')
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          // Returns all cookies as { name, value, options }[]
          return cookieStore.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
            options: {
              path: '/', // you can customize as needed
            },
          }))
        },
        setAll(cookiesToSet) {
          // In server components, cookies() is immutable, so we can't set them here
          // If you need to set cookies, do it in route handlers / API routes via ResponseCookies
          console.warn('setAll called in server component. Skipping...')
        },
      },
    }
  )
}

// Admin client for server-side operations that require elevated privileges
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase admin environment variables')
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No-op for admin client
        },
      },
    }
  )
}
