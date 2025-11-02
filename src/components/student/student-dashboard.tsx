"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/student/sidebar"
import { ApplicationsTable } from "@/components/student/applications-table"
import { OfferLetters } from "@/components/student/offer-letters"
import { ProfileCompletion } from "@/components/student/profile-completion"
import { Bell, FileText, Briefcase, Award, User } from "lucide-react"

export function StudentDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardContent onSectionChange={setActiveSection} />
      case "profile":
        return <ProfileCompletion />
      case "applications":
        return <ApplicationsTable />
      case "offers":
        return <OfferLetters />
      case "notifications":
        return <NotificationsPanel />
      default:
        return <DashboardContent onSectionChange={setActiveSection} />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 p-4 lg:p-8 lg:ml-0">
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  )
}

function DashboardContent({ onSectionChange }: { onSectionChange: (section: string) => void }) {
  const handleNotifications = () => {
    console.log("[v0] Opening notifications")
    onSectionChange("notifications")
  }

  const handleCompleteProfile = () => {
    console.log("[v0] Opening profile completion")
    onSectionChange("profile")
  }

  const handleViewAllApplications = () => {
    console.log("[v0] Opening applications table")
    onSectionChange("applications")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, John Doe</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleNotifications} className="w-full sm:w-auto">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </Button>
      </div>

      {/* Profile Completion Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Completion
          </CardTitle>
          <CardDescription>Complete your profile to apply for placements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">75%</span>
            </div>
            <Progress value={75} className="h-2" />
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Personal Info ✓</Badge>
              <Badge variant="default">Academic Info ✓</Badge>
              <Badge variant="default">Documents ✓</Badge>
              <Badge variant="outline">Finalize Profile</Badge>
            </div>
            <Button size="sm" className="w-full sm:w-auto" onClick={handleCompleteProfile}>
              Complete Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Scheduled this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Pending response</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
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
            {[
              { company: "TechCorp", role: "Software Engineer", status: "Under Review", date: "2 days ago" },
              { company: "DataSys", role: "Data Analyst", status: "Interview Scheduled", date: "5 days ago" },
              { company: "WebFlow", role: "Frontend Developer", status: "Applied", date: "1 week ago" },
            ].map((app, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{app.company}</p>
                  <p className="text-sm text-muted-foreground">{app.role}</p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant={app.status === "Interview Scheduled" ? "default" : "outline"}>{app.status}</Badge>
                  <p className="text-xs text-muted-foreground">{app.date}</p>
                </div>
              </div>
            ))}
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
