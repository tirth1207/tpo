"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/supabaseClient" // your supabase client wrapper
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Building2, Award, Download, Calendar } from "lucide-react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      </div> */}

      {/* Trends Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Metrics</CardTitle>
          <CardDescription>Analytics per day for your company</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full divide-y divide-muted bg-card rounded-lg overflow-hidden shadow">
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Date</TableHead>
                  <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Metric Type</TableHead>
                  <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Metric Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="px-4 py-5 text-center text-muted-foreground">
                      No analytics data available.
                    </TableCell>
                  </TableRow>
                ) : (
                  analytics.map((a) => (
                    <TableRow key={a.id} className="hover:bg-muted/70">
                      <TableCell className="px-4 py-3">{a.date}</TableCell>
                      <TableCell className="px-4 py-3">{a.metric_type}</TableCell>
                      <TableCell className="px-4 py-3">{a.metric_value}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Summary Cards Below Table - match top stats card style */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-6">
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
