"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/supabase/useSupabaseAuth";
import { useRouter } from "next/navigation";

import { StatsCards } from "@/components/company-dashboard/StatsCards";
import { RecentDrives } from "@/components/company-dashboard/RecentDrives";
import { RecentApplications } from "@/components/company-dashboard/RecentApplications";
import { fetchDashboardData } from "@/app/api/companies/fetchDashboardData";

export default function CompanyDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  console.log("User in CompanyDashboard:", user);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [recentDrives, setRecentDrives] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    }
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    const { stats, recentDrives, recentApplications } = await fetchDashboardData(user.id);
    setStats(stats);
    setRecentDrives(recentDrives);
    setRecentApplications(recentApplications);
    setLoading(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Dashboard...</div>;

  return (
    <main className="flex-1 p-6 bg-background">
      <h1 className="text-3xl font-bold mb-2">Company Dashboard</h1>
      <p className="text-gray-600 mb-6">Manage your recruitment drives and applications</p>

      <StatsCards stats={stats} />
      <RecentDrives recentDrives={recentDrives} />
      <RecentApplications recentApplications={recentApplications} />
    </main>
  );
}
