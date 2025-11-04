"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, FileText, Briefcase, Award, User, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface DashboardStats {
  applications: number
  interviews: number
  offers: number
}

interface RecentApplication {
  id: string
  status: string
  applied_at: string
  jobs: {
    title: string
    companies: {
      company_name: string
    }
  }
}

interface DashboardData {
  stats: DashboardStats;
  recentApplications: RecentApplication[];
  profileCompletion: {
    percentage: number;
    steps: {
      personalInfo: boolean;
      academicInfo: boolean;
      documents: boolean;
      finalizeProfile: boolean;
    };
  };
  student: {
    full_name: string;
    pcp: number;
    is_approved: boolean;
    
  };
}


export default function StudentDashboard() {
  const router = useRouter()

  const handleNotifications = () => {
    console.log("[v0] Opening notifications")
    // For now, just log - can implement notifications later
  }

  const handleCompleteProfile = () => {
    console.log("[v0] Opening profile completion")
    router.push("/student/profile")
  }

  const handleViewAllApplications = () => {
    console.log("[v0] Opening applications table")
    router.push("/student/applications")
  }

  return <DashboardContent />
}

function DashboardContent() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/students/dashboard')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const data = await response.json()
        data.profileCompletion = {
          percentage: data.student.pcp ?? 0,
          steps: getProfileCompletionStages(data.student.pcp ?? 0)
        }
        console.log(data)
        setDashboardData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleNotifications = () => {
    console.log("[v0] Opening notifications")
    // For now, just log - can implement notifications later
  }

  const handleCompleteProfile = () => {
    console.log("[v0] Opening profile completion")
    router.push("/student/profile")
  }

  const handleViewAllApplications = () => {
    console.log("[v0] Opening applications table")
    router.push("/student/applications")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "interview_scheduled":
        return <Badge variant="default">Interview Scheduled</Badge>
      case "shortlisted":
        return <Badge variant="secondary">Shortlisted</Badge>
      case "selected":
        return <Badge variant="default">Selected</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status.replace('_', ' ')}</Badge>
    }
  }
  function getProfileCompletionStages(pcp: number) {
    return {
      personalInfo: pcp >= 25,       // Consider completed if >= 25%
      academicInfo: pcp >= 50,       // Completed if >= 50%
      documents: pcp >= 75,          // Completed if >= 75%
      finalizeProfile: pcp === 100,  // Only fully done at 100%
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>

        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-9 w-32" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-9 w-full mt-4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 p-6">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-800">Error loading dashboard</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Student Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {dashboardData?.student?.full_name || "Student"}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={handleNotifications} className="w-full sm:w-auto">
        <Bell className="h-4 w-4 mr-2" />
        Notifications
      </Button>
    </div>

    {/* ✅ Profile Completion Card ALWAYS renders if dashboardData available */}
    {dashboardData && (
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Completion
          </CardTitle>
          <CardDescription>
            Complete your profile to apply for placements
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Safe fallbacks */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {dashboardData.student?.pcp ?? 0}%
              </span>
            </div>

            <Progress
              value={dashboardData.student?.pcp ?? 0}
              className="h-2"
            />

            {/* Completion steps */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                ["personalInfo", "Personal Info"],
                ["academicInfo", "Academic Info"],
                ["documents", "Documents"],
                ["finalizeProfile", "Finalize Profile"],
              ].map(([key, label]) => (
                <Badge
                  key={key}
                  variant={
                    dashboardData.profileCompletion?.steps?.[key as keyof typeof dashboardData.profileCompletion.steps]
                      ? "default"
                      : "outline"
                  }
                >
                  {label}{" "}
                  {dashboardData.profileCompletion?.steps?.[key as keyof typeof dashboardData.profileCompletion.steps] && "✓"}
                </Badge>
              ))}
            </div>

            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={handleCompleteProfile}
              disabled={dashboardData?.student?.pcp === 100 && !dashboardData?.student?.is_approved} // disable while waiting approval
            >
              {dashboardData?.student?.pcp === 100
                ? dashboardData?.student?.is_approved
                  ? "Profile Completed"
                  : "Wait for Faculty Approval"
                : "Complete Profile"}
            </Button>

          </div>
        </CardContent>
      </Card>
    )}

    {/* ✅ Quick Stats — safe fallback */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {[
        ["Applications", dashboardData?.stats?.applications, Briefcase],
        ["Interviews", dashboardData?.stats?.interviews, User],
        ["Offers", dashboardData?.stats?.offers, Award],
      ].map(([label, value, Icon], i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value ?? 0}</div>
            <p className="text-xs text-muted-foreground">{label}</p>
          </CardContent>
        </Card>
      ))}

    </div>

    {/* ✅ Recent Apps Section retained */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent Applications
        </CardTitle>
        <CardDescription>Your latest job applications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dashboardData?.recentApplications?.length ? (
            dashboardData.recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{app.jobs.companies.company_name}</p>
                  <p className="text-sm text-muted-foreground">{app.jobs.title}</p>
                </div>
                <div className="text-right space-y-1">
                  {getStatusBadge(app.status)}
                  <p className="text-xs text-muted-foreground">{formatDate(app.applied_at)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No applications yet</p>
              <p className="text-sm text-muted-foreground">Start applying to jobs to see your applications here</p>
            </div>
          )}
        </div>

        <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={handleViewAllApplications}>
          View All Applications
        </Button>
      </CardContent>
    </Card>
  </div>
)

}

function NotificationsPanel() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Notifications</h1>

      <div className="space-y-4">
        {[
          {
            title: "New Job Opening",
            message: "TechCorp has posted a new Software Engineer position",
            time: "2 hours ago",
            type: "info",
          },
          {
            title: "Interview Scheduled",
            message: "Your interview with DataSys is scheduled for tomorrow at 2 PM",
            time: "1 day ago",
            type: "success",
          },
          {
            title: "Profile Update Required",
            message: "Please update your resume to complete your profile",
            time: "3 days ago",
            type: "warning",
          },
        ].map((notification, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                  <Badge variant="outline" className="mt-1">
                    {notification.type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
