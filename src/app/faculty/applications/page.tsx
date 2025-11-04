"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Eye, Building2, User } from "lucide-react"

interface Application {
  id: string
  student_name: string
  rollNo: string
  company: string
  role: string
  package: string
  appliedDate: string
  status: string
  interviewDate: string | null
}

export default function StudentApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")

  // Fetch applications from API
  const fetchApplications = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/faculty/applications")
      const data = await res.json()
      if (res.ok) {
        const mapped: Application[] = data.applications.map((app: any) => ({
          id: app.id,
          student_name: `${app.students.first_name || ""} ${app.students.last_name || ""}`,
          rollNo: app.students.roll_number,
          company: app.jobs.companies.company_name,
          role: app.jobs.title,
          package: "N/A", // replace with actual package if exists
          appliedDate: new Date(app.applied_at).toLocaleDateString(),
          interviewDate: app.interview_date ? new Date(app.interview_date).toLocaleDateString() : null,
          status: app.status,
        }))
        setApplications(mapped)
      } else {
        console.error("Error fetching applications:", data.error)
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesCompany = companyFilter === "all" || app.company === companyFilter
    return matchesSearch && matchesStatus && matchesCompany
  })

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "selected":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Selected</Badge>
      case "interview scheduled":
        return <Badge variant="default">Interview Scheduled</Badge>
      case "under review":
        return <Badge variant="outline">Under Review</Badge>
      case "applied":
        return <Badge variant="secondary">Applied</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const companies = [...new Set(applications.map((app) => app.company))]

  if (loading) return <p>Loading applications...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Applications</h1>
          <p className="text-muted-foreground mt-1">Track job applications from your department students</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Tracking</CardTitle>
          <CardDescription>Monitor your students' job application progress</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students, companies, or roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="under review">Under Review</SelectItem>
                <SelectItem value="interview scheduled">Interview Scheduled</SelectItem>
                <SelectItem value="selected">Selected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Applications Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Interview Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.student_name}</TableCell>
                    <TableCell>{app.company}</TableCell>
                    <TableCell>{app.role}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{app.appliedDate}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {app.interviewDate || "Not scheduled"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
