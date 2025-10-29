import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client with service role key
// const supabaseAdmin = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// async function revokeAllSessions(userId: string) {
//   const { data, error } = await supabaseAdmin.auth.admin.invalidateUserSessions(userId);
//   if (error) console.error("Failed to revoke sessions:", error);
//   else console.log("All sessions revoked for user:", userId, data);
// }

// // Replace with your admin's user ID
// const adminUserId = "0e9dc7cf-760d-4387-9263-378bef730211";

// revokeAllSessions(adminUserId).then(() => process.exit());
