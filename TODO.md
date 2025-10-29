# TODO: Fix Auth Login

## Steps to Complete
- [x] Update `src/components/login-form.tsx` to use the API route `/api/auth/login` instead of direct Supabase auth calls
- [x] Remove admin-only restriction and allow all roles to login
- [x] Implement role-based redirects after successful login (admin -> /admin, student -> /student/dashboard, etc.)
- [x] Handle API error responses (email verification, approval pending, etc.)
- [x] Change form title from "Admin Login" to "Login"
- [x] Test the login functionality - App compiled successfully and is running on localhost:3000
