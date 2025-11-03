"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import StudentProfilesTable from "@/app/faculty/students-list/page"
import StudentApplications from "@/app/faculty/applications/page"
import ApprovalRequests from "@/app/faculty/approvals/page"
import ExportData from "@/app/faculty/export/page"
import { Users, UserCheck, FileText, TrendingUp, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function FacultyDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/faculty/dashboard")
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/auth/login")
          }
          throw new Error("Failed to fetch dashboard data")
        }
        const jsonData = await res.json()
        console.log(jsonData)
        setData(jsonData)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const renderContent = () => {
    if (loading) return <div className="text-center py-10">Loading...</div>

    switch (activeSection) {
      case "dashboard":
        return <DashboardContent data={data} onSectionChange={setActiveSection} />
      case "students":
        return <StudentProfilesTable />
      case "approvals":
        return <ApprovalRequests />
      case "applications":
        return <StudentApplications />
      case "export":
        return <ExportData />
      default:
        return <DashboardContent data={data} onSectionChange={setActiveSection} />
    }
  }

  return renderContent()
}

function DashboardContent({
  data,
  onSectionChange,
}: {
  data: any
  onSectionChange: (section: string) => void
}) {
  const handleReviewStudent = (studentName: string) => {
    console.log(`[v0] Reviewing student: ${studentName}`)
    onSectionChange("approvals")
  }

  const handleViewAllApprovals = () => {
    console.log("[v0] Viewing all pending approvals")
    onSectionChange("approvals")
  }

  if (!data) return <div className="text-center py-10">No data available</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Faculty Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, Dr. Jane Smith - {data.department} Department
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {data.department}
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
            <div className="text-2xl font-bold">{data.quickStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">In your department</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.quickStats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Profile updates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.quickStats.approvedToday}</div>
            <p className="text-xs text-muted-foreground">+3 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.departmentPerformance.studentsPlaced
                ? Math.round((data.departmentPerformance.studentsPlaced / data.quickStats.totalStudents) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">This academic year</p>
          </CardContent>
        </Card>
      </div>

      {/* You can continue rendering Pending Approvals and Recent Applications here using data */}
    </div>
  )
}
