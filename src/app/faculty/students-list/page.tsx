"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface Student {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  roll_number?: string
  cgpa?: string
  profile_status?: string
  approval_status?: string
  last_updated?: string
}

export default function StudentProfilesTable() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/faculty/student")
      const data = await res.json()
      if (data.students) {
        const mappedStudents = data.students.map((s: any) => {
          const profileStatus = s.is_approved ? "Complete" : "Incomplete"
          const status = s.status || (s.is_approved ? "Approved" : "Pending")

          return {
            id: s.id,
            name: `${s.first_name || ""} ${s.last_name || ""}`.trim(),
            email: s.email,
            rollNo: s.roll_number,
            cgpa: s.cgpa?.toString() || "-",
            profileStatus,
            status,
            lastUpdated: s.updated_at ? new Date(s.updated_at).toLocaleDateString() : "-"
          }
        })
        setStudents(mappedStudents)
      }
    } catch (err) {
      console.error("Failed to fetch students:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])


  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || student?.approval_status?.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map((student) => student.id))
    } else {
      setSelectedStudents([])
    }
  }

  const handleSelectStudent = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, id])
    } else {
      setSelectedStudents(selectedStudents.filter((studentId) => studentId !== id))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case "Pending":
        return <Badge className="border-orange-200 text-orange-800" variant="outline">Pending</Badge>
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "Needs Correction":
        return <Badge variant="destructive">Needs Correction</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }


  const getProfileStatusIcon = (status: string) => {
    switch (status) {
      case "Complete":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Pending Review":
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case "Incomplete":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const [updatingIds, setUpdatingIds] = useState<{ [id: string]: "approve" | "reject" | null }>({})

  const handleApproveReject = async (id: string, action: "approve" | "reject") => {
    try {
      // Mark this student as updating
      setUpdatingIds((prev) => ({ ...prev, [id]: action }))

      const res = await fetch(`/api/faculty/approvals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "approve" ? "Approved" : "Rejected" })
      })

      if (!res.ok) throw new Error("Failed to update status")

      // Re-fetch students after update
      await fetchStudents()
    } catch (err) {
      console.error(err)
      alert("Something went wrong while updating status")
    } finally {
      // Clear updating state
      setUpdatingIds((prev) => ({ ...prev, [id]: null }))
    }
  }



  if (loading) return <p>Loading students...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Profiles</h1>
          <p className="text-muted-foreground mt-1">Manage student profiles in your department</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Students</CardTitle>
          <CardDescription>View and manage all student profiles in your department</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="needs correction">Needs Correction</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedStudents.length > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">{selectedStudents.length} selected</span>
              <Button size="sm" variant="default">
                <CheckCircle className="h-4 w-4 mr-2" />
                Bulk Approve
              </Button>
              <Button size="sm" variant="outline">
                <XCircle className="h-4 w-4 mr-2" />
                Request Corrections
              </Button>
            </div>
          )}

          {/* Students Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedStudents.length === filteredStudents.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Profile Status</TableHead>
                  <TableHead>Approval Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) =>
                          handleSelectStudent(student.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{student.rollNo}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.cgpa}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getProfileStatusIcon(student.profileStatus || "")}
                        <span className="text-sm">{student.profileStatus}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status || "")}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{student.lastUpdated}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/faculty/approvals/${student.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>

                        {student.status === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApproveReject(student.id, "approve")}
                              disabled={!!updatingIds[student.id]}
                            >
                              {updatingIds[student.id] === "approve" ? "Approving..." : "Approve"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveReject(student.id, "reject")}
                              disabled={!!updatingIds[student.id]}
                            >
                              {updatingIds[student.id] === "reject" ? "Rejecting..." : "Reject"}
                            </Button>
                          </>
                        )}
                      </div>
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
