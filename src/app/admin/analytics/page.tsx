"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/supabaseClient" // your supabase client wrapper
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Building2, Award, Download, Calendar } from "lucide-react"

interface AnalyticsRow {
  id: string
  metric_type: string
  metric_value: number
  date: string
  company_id: string
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([])
  

  useEffect(() => {
    async function fetchAnalytics() {
      const { data, error } = await supabase
        .from("analytics")
        .select("*")
        .order("date", { ascending: true })

      if (error) {
        console.error("Error fetching analytics:", error)
      } else {
        setAnalytics(data || [])
      }
    }

    fetchAnalytics()
  }, [])

  // Example: compute key metrics from analytics data
  const totalVisits = analytics
    .filter(a => a.metric_type === "visits")
    .reduce((sum, a) => sum + (a.metric_value || 0), 0)

  const totalSignups = analytics
    .filter(a => a.metric_type === "signups")
    .reduce((sum, a) => sum + (a.metric_value || 0), 0)

  const totalRevenue = analytics
    .filter(a => a.metric_type === "revenue")
    .reduce((sum, a) => sum + (a.metric_value || 0), 0)

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">Comprehensive placement analytics and insights</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSignups}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Trends Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Metrics</CardTitle>
          <CardDescription>Analytics per day for your company</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Date</th>
                  <th className="border px-4 py-2">Metric Type</th>
                  <th className="border px-4 py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map(a => (
                  <tr key={a.id}>
                    <td className="border px-4 py-2">{a.date}</td>
                    <td className="border px-4 py-2">{a.metric_type}</td>
                    <td className="border px-4 py-2">{a.metric_value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
