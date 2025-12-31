"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { AdminSidebar } from "./admin-sidebar"
import  AdminAnalytics  from "./analytics/page"
import  AdminSettings  from "./settings/page"
import { SidebarTrigger } from "@/components/ui/sidebar"
import CompanyApprovals from "./company-approvals/page"
import FacultyApprovals from "./faculty-approvals/page"

interface Analytics {
  total_profiles: number
  total_students: number
  total_companies: number
  total_jobs: number
  total_applications: number
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/analytics")
        if (!response.ok) throw new Error("Failed to fetch analytics")
        const data = await response.json()
        setAnalytics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  return (
    <div className="flex h-screen bg-background">
      {/* <AdminSidebar /> */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <div className="flex flex-row gap-5">
               
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold">Manager Dashboard</h1>
                    <p className="text-muted-foreground">Manage users, approvals, and system settings</p>
                </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading analytics...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.total_profiles}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.total_students}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Companies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.total_companies}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Jobs Posted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.total_jobs}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.total_applications}</div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          <Tabs defaultValue="approvals" className="w-full">
            <TabsList>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="approvals" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CompanyApprovals />
                <FacultyApprovals />
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <AdminAnalytics />
            </TabsContent>

            <TabsContent value="settings">
              <AdminSettings />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
