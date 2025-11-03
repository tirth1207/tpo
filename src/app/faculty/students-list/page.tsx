"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react"

const students = [
  {
    id: 1,
    name: "Rahul Kumar",
    rollNo: "CS2021001",
    email: "rahul.kumar@college.edu",
    cgpa: "8.5",
    profileStatus: "Complete",
    approvalStatus: "Approved",
    lastUpdated: "2024-01-10",
  },
  {
    id: 2,
    name: "Priya Sharma",
    rollNo: "CS2021002",
    email: "priya.sharma@college.edu",
    cgpa: "9.1",
    profileStatus: "Pending Review",
    approvalStatus: "Pending",
    lastUpdated: "2024-01-12",
  },
  {
    id: 3,
    name: "Amit Singh",
    rollNo: "CS2021003",
    email: "amit.singh@college.edu",
    cgpa: "7.8",
    profileStatus: "Incomplete",
    approvalStatus: "Needs Correction",
    lastUpdated: "2024-01-08",
  },
  {
    id: 4,
    name: "Sneha Patel",
    rollNo: "CS2021004",
    email: "sneha.patel@college.edu",
    cgpa: "8.9",
    profileStatus: "Complete",
    approvalStatus: "Approved",
    lastUpdated: "2024-01-11",
  },
  {
    id: 5,
    name: "Vikram Reddy",
    rollNo: "CS2021005",
    email: "vikram.reddy@college.edu",
    cgpa: "8.2",
    profileStatus: "Pending Review",
    approvalStatus: "Pending",
    lastUpdated: "2024-01-13",
  },
]

export default function StudentProfilesTable() {
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || student.approvalStatus.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map((student) => student.id))
    } else {
      setSelectedStudents([])
    }
  }

  const handleSelectStudent = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, id])
    } else {
      setSelectedStudents(selectedStudents.filter((studentId) => studentId !== id))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            Approved
          </Badge>
        )
      case "Pending":
        return (
          <Badge variant="outline" className="border-orange-200 text-orange-800">
            Pending
          </Badge>
        )
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
          <CardDescription>View and manage all student profiles in Computer Science Department</CardDescription>
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
                        onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
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
                        {getProfileStatusIcon(student.profileStatus)}
                        <span className="text-sm">{student.profileStatus}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(student.approvalStatus)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{student.lastUpdated}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {student.approvalStatus === "Pending" && (
                          <>
                            <Button size="sm" variant="default">
                              Approve
                            </Button>
                            <Button size="sm" variant="outline">
                              Reject
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
