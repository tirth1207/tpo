"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Eye, CheckCircle, XCircle } from "lucide-react"

interface Approval {
  id: string
  student: {
    name: string
    roll_no: string
  }
  type: string
  description?: string
  submittedDate: string
  status: string
}

export default function ApprovalRequests() {
  const router = useRouter()
  const [requests, setRequests] = useState<Approval[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/faculty/approvals")
        if (!res.ok) throw new Error("Failed to fetch approval requests")
        const data = await res.json()

        const approvals = (data.approvals || []).map((item: any) => ({
          ...item,
          student: {
            name: item.studentName,
            roll_no: item.rollNo
          }
        }))

        setRequests(approvals)
      } catch (err) {
        console.error(err)
        setRequests([])
      } finally {
        setLoading(false)
      }
    }

    fetchApprovals()
  }, [])

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.student?.roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesType = typeFilter === "all" || request.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleApproveReject = async (id: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/api/faculty/approvals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "approve" ? "Approved" : "Rejected" })
      })

      if (!res.ok) throw new Error("Failed to update status")

      // Optimistic update
      setRequests(prev =>
        prev.map(r => (r.id === id ? { ...r, status: action === "approve" ? "Approved" : "Rejected" } : r))
      )
    } catch (err) {
      console.error(err)
      alert("Something went wrong while updating status")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case "Pending":
        return <Badge variant="outline" className="border-orange-200 text-orange-800">Pending</Badge>
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const types = [...new Set(requests.map((r) => r.type))]

  if (loading) return <div className="text-center py-10">Loading approval requests...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Approval Requests</h1>
          <p className="text-muted-foreground mt-1">Review and approve student profile updates</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students, roll numbers, or descriptions..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {types.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Requests</CardTitle>
          <CardDescription>Review student profile updates and document submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No approval requests found</p>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{request.student?.name}</p>
                          <p className="text-sm text-muted-foreground">{request.student?.roll_no}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{request.description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(request.submittedDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/faculty/approvals/${request.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />View
                          </Button>
                          {request.status === "Pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApproveReject(request.id, "approve")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveReject(request.id, "reject")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />Reject
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
