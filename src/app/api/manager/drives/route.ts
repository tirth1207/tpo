import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { id, is_approved, ids } = body;

    if (typeof is_approved !== 'string') {
      return NextResponse.json({ error: "is_approved is required and must be a string" }, { status: 400 });
    }

    const allowed = new Set(['approved','rejected','pending'])
    if (!allowed.has(is_approved)) {
      return NextResponse.json({ error: 'Invalid is_approved value' }, { status: 400 })
    }

    // Get authenticated user from the request cookies (createClient uses request cookies)
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const actorId = userData!.user!.id;

    // Find user's role from profiles table (so audit actor_role is accurate)
    let actorRole = 'manager';
    try {
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', actorId)
        .single();
      if (!profileErr && profileData && profileData.role) actorRole = profileData.role;
    } catch (err) {
      console.warn('Failed to fetch profile role, defaulting to manager', err);
    }

    // Build target list (support single id or batch via ids array)
    const targets: string[] = (Array.isArray(ids) && ids.length) ? ids : (id ? [id] : []);
    if (!targets.length) return NextResponse.json({ error: 'id or ids required' }, { status: 400 });

    // Map text status to boolean for boolean RPC when needed
    const mappedBool = is_approved === 'approved' ? true : (is_approved === 'rejected' ? false : null);

    const errors: any[] = [];

    for (const tId of targets) {
      try {
        // First attempt boolean RPC (works if column is boolean and function exists)
        const { error: rpcErrBool } = await supabase.rpc('jobs_set_approval_bool', {
          p_job_id: tId,
          p_is_approved: mappedBool,
          p_actor_id: actorId,
          p_actor_role: actorRole,
        });

        if (!rpcErrBool) {
          // succeeded with boolean RPC
          continue;
        }

        const msgBool = String(rpcErrBool?.message || rpcErrBool || '').toLowerCase();

        // If boolean RPC failed because function missing or not applicable, fall back to text RPC
        if (msgBool.includes('function') || msgBool.includes('does not exist') || msgBool.includes('not found') || msgBool.includes('invalid input syntax')) {
          // Try text RPC
          const { error: rpcErrText } = await supabase.rpc('jobs_set_approval', {
            p_job_id: tId,
            p_status: is_approved,
            p_actor_id: actorId,
            p_actor_role: actorRole,
          });
          if (rpcErrText) {
            const msg = String(rpcErrText?.message || rpcErrText || '');
            if (msg.toLowerCase().includes('invalid status')) return NextResponse.json({ error: msg }, { status: 400 });
            throw rpcErrText;
          }
          continue;
        }

        // If boolean RPC failed for other reasons (validation), return 400
        if (msgBool.includes('invalid')) {
          return NextResponse.json({ error: rpcErrBool.message || String(rpcErrBool) }, { status: 400 });
        }

        // Otherwise throw
        throw rpcErrBool;
      } catch (finalErr: any) {
        console.error('Failed to update job', tId, finalErr);
        errors.push({ id: tId, error: String(finalErr?.message || finalErr) });
      }
    }

    if (errors.length) return NextResponse.json({ error: "Some updates failed", details: errors }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}