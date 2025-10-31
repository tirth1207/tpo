"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/supabaseClient"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, Video, MapPin, Edit, Trash2 } from "lucide-react"

interface Interview {
  is_approved: string
  id: string
  student_name: string
  drive_name: string
  scheduled_date: string
  interview_type: string
  interview_mode: string
  interviewer_name: string
  result: string
  feedback: string
  status: "Scheduled" | "Completed"
  interview_link?: string
}

export default function InterviewManagement() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInterviews = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("interviews")
      .select(`*,
        applications (
          students!applications_student_id_fkey (
            profiles:profiles!students_user_id_fkey(full_name, email)
          ),
          jobs!applications_job_id_fkey (
            title
          )
        ),
        profiles!interviews_conducted_by_fkey (
          full_name
        )
      `)
      .order("scheduled_date", { ascending: false })

    if (error) {
      console.error("Error fetching interviews:", error)
      setLoading(false)
      return
    }

    const formattedData: Interview[] = data.map((i: any) => ({
      id: i.id,
      student_name: i.applications?.students?.profiles?.full_name || "Unknown",
      drive_name: i.applications?.jobs?.title || "Unknown",
      scheduled_date: i.scheduled_date,
      interview_type: i.interview_type || "N/A",
      interview_mode: i.interview_mode || "Online",
      interviewer_name: i.profiles?.full_name || "N/A",
      result: i.result || "pending",
      feedback: i.feedback || "",
      status: i.result && i.result !== "pending" ? "Completed" as "Completed" : "Scheduled" as "Scheduled",
      interview_link: i.interview_link,
      is_approved: i.is_approved || "pending",
    }))

    setInterviews(formattedData)
    setLoading(false)
  }

  useEffect(() => {
    fetchInterviews()
  }, [])

  const getApprovalBadge = (is_approved: string) => {
    switch (is_approved.toLowerCase()) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">Pending</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "approved":
      default:
        return <Badge variant="default">Approved</Badge>
    }
  }

  const getStatusBadge = (status: string, result?: string) => {
    if (status === "Completed") {
      return (
        <div className="flex flex-col gap-1">
          <Badge variant="outline">{status}</Badge>
          {result && (
            <Badge variant={result === "Selected" ? "default" : "destructive"} className="text-xs">
              {result}
            </Badge>
          )}
        </div>
      )
    }
    return <Badge variant={status === "Scheduled" ? "default" : "secondary"}>{status}</Badge>
  }

  if (loading) return <p>Loading interviews...</p>

  return (
    <div className="space-y-6">
      {/* Upcoming Interviews */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Interviews</CardTitle>
          <CardDescription>Interviews scheduled for the next few days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interviews
              .filter((i) => i.status === "Scheduled")
              .map((interview) => {
                const dateObj = new Date(interview.scheduled_date)
                const dateStr = dateObj.toLocaleDateString()
                const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

                return (
                  <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{interview.student_name}</h3>
                        <Badge variant="outline">{interview.interview_type}</Badge>
                        <Badge variant={interview.interview_mode === "Online" ? "default" : "secondary"}>
                          {interview.interview_mode === "Online" ? <Video className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                          {interview.interview_mode}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{interview.drive_name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {dateStr}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {timeStr}
                        </span>
                        <span>Interviewer: {interview.interviewer_name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(interview.status, interview.result)}
                      {getApprovalBadge(interview.is_approved)}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Interview History */}
      <Card>
        <CardHeader>
          <CardTitle>Interview History</CardTitle>
          <CardDescription>Completed interviews and results</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Drive</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Interviewer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Feedback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews
                .filter((i) => i.status === "Completed")
                .map((interview) => {
                  const dateObj = new Date(interview.scheduled_date)
                  const dateStr = dateObj.toLocaleDateString()
                  const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

                  return (
                    <TableRow key={interview.id}>
                      <TableCell className="font-semibold">{interview.student_name}</TableCell>
                      <TableCell className="text-sm">{interview.drive_name}</TableCell>
                      <TableCell className="text-sm">{dateStr} at {timeStr}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{interview.interview_type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{interview.interviewer_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(interview.status, interview.result)}
                          {getApprovalBadge(interview.is_approved)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate">{interview.feedback}</TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
