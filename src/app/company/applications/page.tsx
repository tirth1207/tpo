"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu" // adjust import if needed
import { MoreHorizontal, StickyNote } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase/supabaseClient"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface Application {
  id: string
  status: string
  applied_at: string
  student_name: string
  student_email: string
  student_cgpa?: number | null
  student_department?: string | null
  job_title?: string | null
  student_is_approved?: boolean | null
  resume_url?: string | null
}

export default function ApplicationsReview() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("applications")
      .select(`*,
        id,
        status,
        applied_at,
        jobs:job_id(title),
        students:student_id(*,
          roll_number,
          cgpa,
          department,
          profiles:profiles!students_user_id_fkey(full_name, email)
        )
      `)
      .order("applied_at", { ascending: false })
    console.log("Fetched applications:", data, error)
    if (error) {
      console.error("Error fetching applications:", error)
      return
    }

    const formatted = (data || []).map((app: any) => ({
      id: app.id,
      status: app.status,
      applied_at: app.applied_at,
      job_title: app.jobs?.title || "N/A",
      resume_url: app.students?.resume_url,
      student_name: app.students?.profiles?.full_name || app.students?.roll_number || "Unknown",
      student_email: app.students?.profiles?.email || "N/A",
      student_cgpa: app.students?.cgpa,
      student_department: app.students?.department,
      student_is_approved: app.students?.is_approved ?? true, // <- Add this
      job_is_approved: app.jobs?.is_approved ?? "approved",  // optional if you want job approval badges
    }))



    setApplications(formatted)
  }

  // Update single or multiple application statuses
  const updateStatus = async (ids: string[], newStatus: string) => {
    const { error } = await supabase.from("applications").update({ status: newStatus }).in("id", ids)
    if (error) {
      console.error("Error updating status:", error)
      return
    }
    await fetchApplications()
    setSelectedApplications([])
  }
  const deleteApplication = async (id: string) => {
    const { error } = await supabase.from("applications").delete().eq("id", id)
    if (error) {
      console.error("Error deleting application:", error)
      return
    }
    await fetchApplications()
    setSelectedApplications(selectedApplications.filter((appId) => appId !== id))
  }
  // Download CSV
  const downloadCSV = () => {
    const csvRows = [
      ["Student Name", "Email", "Department", "CGPA", "Job Title", "Status", "Applied At", "Resume URL"],
      ...filteredApplications.map((app) => [
        app.student_name,
        app.student_email,
        app.student_department || "-",
        app.student_cgpa ?? "-",
        app.job_title || "-",
        app.status,
        new Date(app.applied_at).toLocaleDateString(),
        app.resume_url || "-", // Added resume URL
      ]),
    ]

    const csvString = csvRows.map((row) => row.map((r) => `"${r}"`).join(",")).join("\n")
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "applications.csv"
    link.click()
  }


  // Download PDF
  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.text("Applications Review", 14, 15)
    autoTable(doc, {
      startY: 20,
      head: [["Student", "Email", "Department", "CGPA", "Job", "Status", "Applied At", "Resume"]],
      body: filteredApplications.map((app) => [
        app.student_name,
        app.student_email,
        app.student_department || "-",
        app.student_cgpa ?? "-",
        app.job_title || "-",
        app.status,
        new Date(app.applied_at).toLocaleDateString(),
        app.resume_url ? app.resume_url : "N/A", // Added resume URL
      ]),
    })
    doc.save("applications.pdf")
  }


  const handleSelectAll = (checked: boolean) => {
    setSelectedApplications(checked ? applications.map((a) => a.id) : [])
  }

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) setSelectedApplications([...selectedApplications, id])
    else setSelectedApplications(selectedApplications.filter((i) => i !== id))
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      case "shortlisted":
        return (
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      case "interview scheduled":
        return (
          <Badge variant="outline">
            <Eye className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      case "offer extended":
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }
  const getJobApprovalBadge = (jobApproved: string | null) => {
    switch (jobApproved) {
      case "pending":
        return <Badge variant="warning">Pending Approval</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected by Admin</Badge>;
      case "approved":
      default:
        return null;
    }
  };
  
  const filteredApplications = applications.filter((a) => {
    // Only show applications where student's profile is approved
    if (!a.student_is_approved) return false;

    if (filterStatus !== "all" && a.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
    if (searchQuery && !a.student_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  console.log("Rendering ApplicationsReview with applications:", applications)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Applications Review</h2>
        <p className="text-gray-600">Review and manage student applications</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by student name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interview scheduled">Interview Scheduled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {selectedApplications.length > 0 && (
            <div className="flex gap-3 mt-4 pt-4 border-t">
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => updateStatus(selectedApplications, "Shortlisted")}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Shortlist ({selectedApplications.length})
              </Button>
              <Button variant="outline" onClick={() => updateStatus(selectedApplications, "Interview Scheduled")}>
                <Eye className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
              <Button variant="outline" onClick={() => updateStatus(selectedApplications, "Rejected")}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button variant="outline" onClick={downloadCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={downloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          <CardDescription>All student job applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedApplications.length === applications.length && applications.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>CGPA</TableHead>
                <TableHead>Applied At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app: any) => (
                  <TableRow
                    key={app.id}
                    className={
                      app.job_is_approved === "pending"
                        ? "border border-yellow-400"
                        : app.job_is_approved === "rejected"
                        ? "border border-red-500"
                        : ""
                    }
                  >
                    {/* Checkbox */}
                    <TableCell>
                      <Checkbox
                        checked={selectedApplications.includes(app.id)}
                        onCheckedChange={(checked) => handleSelect(app.id, checked as boolean)}
                      />
                    </TableCell>

                    {/* Student Info */}
                    <TableCell>
                      <div>
                        <div className="font-semibold">{app.student_name}</div>
                        <div className="text-sm text-gray-600">{app.student_email}</div>
                        <div className="text-sm text-gray-500">
                          Roll No: {app.students?.roll_number || "-"}
                        </div>
                        {app.student_is_approved === false && (
                          <div className="text-yellow-600 text-xs mt-1">
                            Profile not verified
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Job Info with approval badge */}
                    <TableCell>
                      {app.job_title}{" "}
                      {app.job_is_approved === "pending" && (
                        <Badge variant="warning" className="ml-1 text-xs">
                          Pending Approval
                        </Badge>
                      )}
                      {app.job_is_approved === "rejected" && (
                        <Badge variant="destructive" className="ml-1 text-xs">
                          Rejected by Admin
                        </Badge>
                      )}
                    </TableCell>

                    {/* Department */}
                    <TableCell>{app.student_department || "-"}</TableCell>

                    {/* CGPA */}
                    <TableCell>{app.student_cgpa ?? "-"}</TableCell>

                    {/* Applied At */}
                    <TableCell className="text-sm text-gray-600">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </TableCell>

                    {/* Status */}
                    <TableCell>{getStatusBadge(app.status)}</TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                          {/* View Resume */}
                          <DropdownMenuItem
                            onClick={() => window.open(app.students?.resume_url || app.resume_url)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Resume
                          </DropdownMenuItem>

                          {/* Change Status */}
                          <DropdownMenuItem onClick={() => updateStatus([app.id], "Interview Scheduled")}>
                            <Clock className="mr-2 h-4 w-4" />
                            Schedule Interview
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => updateStatus([app.id], "Shortlisted")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Shortlist
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => updateStatus([app.id], "Offer Extended")}>
                            <StickyNote className="mr-2 h-4 w-4 text-green-600" />
                            Offer Extended
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => updateStatus([app.id], "Rejected")}>
                            <XCircle className="mr-2 h-4 w-4 text-yellow-500" />
                            Reject
                          </DropdownMenuItem>

                          {/* Delete Application */}
                          <DropdownMenuItem onClick={() => deleteApplication(app.id)}>
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                            Delete Application
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-6">
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
