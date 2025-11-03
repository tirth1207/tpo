"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Eye, Building2, User } from "lucide-react"

const studentApplications = [
  {
    id: 1,
    student: "Rahul Kumar",
    rollNo: "CS2021001",
    company: "TechCorp Inc.",
    role: "Software Engineer",
    package: "₹12 LPA",
    appliedDate: "2024-01-10",
    status: "Under Review",
    interviewDate: null,
  },
  {
    id: 2,
    student: "Priya Sharma",
    rollNo: "CS2021002",
    company: "DataSys Solutions",
    role: "Data Analyst",
    package: "₹8 LPA",
    appliedDate: "2024-01-08",
    status: "Interview Scheduled",
    interviewDate: "2024-01-15",
  },
  {
    id: 3,
    student: "Amit Singh",
    rollNo: "CS2021003",
    company: "WebFlow Technologies",
    role: "Frontend Developer",
    package: "₹10 LPA",
    appliedDate: "2024-01-05",
    status: "Selected",
    interviewDate: "2024-01-12",
  },
  {
    id: 4,
    student: "Sneha Patel",
    rollNo: "CS2021004",
    company: "CloudTech Systems",
    role: "DevOps Engineer",
    package: "₹15 LPA",
    appliedDate: "2024-01-12",
    status: "Applied",
    interviewDate: null,
  },
  {
    id: 5,
    student: "Vikram Reddy",
    rollNo: "CS2021005",
    company: "AI Innovations",
    role: "ML Engineer",
    package: "₹18 LPA",
    appliedDate: "2024-01-11",
    status: "Interview Scheduled",
    interviewDate: "2024-01-16",
  },
]

export default function StudentApplications() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")

  const filteredApplications = studentApplications.filter((app) => {
    const matchesSearch =
      app.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesCompany = companyFilter === "all" || app.company === companyFilter
    return matchesSearch && matchesStatus && matchesCompany
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Selected":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            Selected
          </Badge>
        )
      case "Interview Scheduled":
        return <Badge variant="default">Interview Scheduled</Badge>
      case "Under Review":
        return <Badge variant="outline">Under Review</Badge>
      case "Applied":
        return <Badge variant="secondary">Applied</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const companies = [...new Set(studentApplications.map((app) => app.company))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Applications</h1>
          <p className="text-muted-foreground mt-1">Track job applications from your department students</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Applications</p>
                <p className="text-2xl font-bold">{studentApplications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Companies</p>
                <p className="text-2xl font-bold">{companies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium">Interviews</p>
              <p className="text-2xl font-bold">
                {studentApplications.filter((app) => app.status === "Interview Scheduled").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium">Selected</p>
              <p className="text-2xl font-bold text-green-600">
                {studentApplications.filter((app) => app.status === "Selected").length}
              </p>
            </div>
          </CardContent>
        </Card>
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
                  <TableHead>Package</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Interview Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{app.student}</p>
                        <p className="text-sm text-muted-foreground">{app.rollNo}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{app.company}</TableCell>
                    <TableCell>{app.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{app.package}</Badge>
                    </TableCell>
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
