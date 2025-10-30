import { supabase } from "@/lib/supabase/supabaseClient";

export async function fetchDashboardData(userId: string) {
  // Fetch company
  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("user_id", userId)
    .single();
  if (!company) return { stats: {}, recentDrives: [], recentApplications: [] };

  const companyId = company.id;

  // Fetch jobs
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  const jobIds = jobs?.map((j) => j.id) || [];

  // Fetch applications
  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .in("job_id", jobIds);

  const appIds = applications?.map((a) => a.id) || [];

  // Fetch interviews
  const { data: interviews } = await supabase
    .from("interviews")
    .select("*")
    .in("application_id", appIds);

  // Stats
  const stats = {
    drives: jobs?.filter((j) => j.is_active)?.length || 0,
    applications: applications?.length || 0,
    interviews: interviews?.length || 0,
    offers: applications?.filter((a) => a.status === "offer_extended")?.length || 0,
  };

  // Recent drives
  const recentDrives = (jobs || []).slice(0, 3).map((job) => ({
    id: job.id,
    title: job.title,
    applications: applications?.filter((a) => a.job_id === job.id)?.length || 0,
    deadline: job.application_deadline || "—",
    status: job.is_active ? "Active" : "Closed",
  }));

  // Recent applications
  const recentApplications = await Promise.all(
    (applications || []).slice(0, 4).map(async (a) => {
      const { data: student } = await supabase.from("students").select("full_name, cgpa").eq("id", a.student_id).single();
      const { data: job } = await supabase.from("jobs").select("title").eq("id", a.job_id).single();
      return {
        id: a.id,
        student: student?.full_name || "Unknown",
        position: job?.title || "—",
        cgpa: student?.cgpa || "—",
        status: a.status,
      };
    })
  );

  return { stats, recentDrives, recentApplications };
}
