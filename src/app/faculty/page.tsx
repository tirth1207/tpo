"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, FileText, TrendingUp, Clock, CheckCircle } from "lucide-react"

export default function FacultyDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter() // ✅ Next.js router

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/faculty/dashboard")
        if (!res.ok) throw new Error("Failed to fetch dashboard data")
        const jsonData = await res.json()
        setData(jsonData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const handleReviewStudent = (studentId: string) => {
    router.push(`/faculty/approvals/${studentId}`)
  }

  const handleViewAllApprovals = () => {
    router.push("/faculty/approvals")
  }

  const capitalizeWords = (str: string) =>
    str?.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>
  if (!data) return <div className="text-center py-10">No data available</div>

  const { faculty, students, quickStats, recentApplications, departmentPerformance } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Faculty Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {capitalizeWords(faculty.profiles.full_name)} - {capitalizeWords(faculty.department)} Department
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {capitalizeWords(faculty.department)}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">In your department</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Profile updates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.approvedToday}</div>
            <p className="text-xs text-muted-foreground">+ from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departmentPerformance.studentsPlaced && students.length
                ? Math.round((departmentPerformance.studentsPlaced / students.length) * 100) + "%"
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">This academic year</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Card */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Pending Profile Approvals
          </CardTitle>
          <CardDescription>Student profile updates waiting for your approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.filter((s: any) => !s.is_approved).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{capitalizeWords(`${s.first_name} ${s.last_name}`)}</p>
                  <p className="text-sm text-muted-foreground">{s.roll_number} • Profile Update</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Pending</span>
                  <Button size="sm" variant="outline" onClick={() => handleReviewStudent(s.id)}>
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={handleViewAllApprovals}>
            View All Pending Approvals
          </Button>
        </CardContent>
      </Card>

      {/* Recent Applications & Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Student Applications
            </CardTitle>
            <CardDescription>Latest job applications from your department students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.map((app: any, idx: number) => {
                const student = students.find((s: any) => s.id === app.student_id)
                const studentName = student ? `${capitalizeWords(student.first_name)} ${capitalizeWords(student.last_name)}` : "Student"
                const company_name = capitalizeWords(app.jobs?.companies?.company_name)

                return (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        <a href={app.jobs?.companies?.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {company_name || "Company"}
                        </a> - {app.jobs?.title || "Role"}
                      </p>
                    </div>
                    <Badge variant={app.status === "Offer Extended" ? "default" : "outline"}>{app.status}</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Key metrics for your department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Students with Complete Profiles</span>
                <span className="text-sm font-bold">{departmentPerformance.completeProfiles}/{students.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Job Applications</span>
                <span className="text-sm font-bold">{departmentPerformance.activeApplications}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Students Placed</span>
                <span className="text-sm font-bold">{departmentPerformance.studentsPlaced}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Package</span>
                <span className="text-sm font-bold">
                  ₹{departmentPerformance.averagePackage?.toFixed(2)} LPA
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
