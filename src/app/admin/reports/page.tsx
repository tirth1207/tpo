"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/supabaseClient"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// Tabs removed as only one section is displayed
import { Badge } from "@/components/ui/badge"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import HistorySection from "@/components/admin/HistorySection"

interface InterviewRow {
  id: string
  interview_round: number
  interview_type: string
  scheduled_date: string
  result: string | null
  student_name: string
  roll_number: string
  job_title: string
  is_approved: string | null
}

export default function InterviewReports() {
  const [interviews, setInterviews] = useState<InterviewRow[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    setLoading(true)
    try {
      const { data: interviewsData, error: interviewsError } = await supabase
        .from("interviews")
        .select("id, interview_round, interview_type, scheduled_date, result, is_approved, application_id")
        .order("scheduled_date", { ascending: true })

      if (interviewsError) throw interviewsError
      if (!interviewsData?.length) {
        setInterviews([])
        setLoading(false)
        return
      }

      const applicationIds = interviewsData.map((i) => i.application_id).filter(Boolean)
      const { data: applicationsData = [] } = applicationIds.length
        ? await supabase.from("applications").select("id, student_id, job_id").in("id", applicationIds)
        : { data: [] }

      const studentIds = (applicationsData ?? []).map((a) => a.student_id).filter(Boolean)
      const { data: studentsData = [] } = studentIds.length
        ? await supabase.from("students").select("id, roll_number, user_id").in("id", studentIds)
        : { data: [] }

      const userIds = (studentsData ?? []).map((s) => s.user_id).filter(Boolean)
      const { data: profilesData = [] } = userIds.length
        ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
        : { data: [] }

      const jobIds = (applicationsData ?? []).map((a) => a.job_id).filter(Boolean)
      const { data: jobsData = [] } = jobIds.length
        ? await supabase.from("jobs").select("id, title").in("id", jobIds)
        : { data: [] }

      const applications = applicationsData ?? []
      const students = studentsData ?? []
      const profiles = profilesData ?? []
      const jobs = jobsData ?? []

      const merged: InterviewRow[] = interviewsData.map((interview) => {
        const app = applications.find((a) => a.id === interview.application_id)
        const student = students.find((s) => s.id === app?.student_id)
        const profile = profiles.find((p) => p.id === student?.user_id)
        const job = jobs.find((j) => j.id === app?.job_id)

        return {
          id: interview.id,
          interview_round: interview.interview_round,
          interview_type: interview.interview_type,
          scheduled_date: interview.scheduled_date,
          result: interview.result,
          is_approved: interview.is_approved,
          student_name: profile?.full_name || "Unknown",
          roll_number: student?.roll_number || "N/A",
          job_title: job?.title || "Unknown",
        }
      })

      setInterviews(merged)
    } catch (error) {
      console.error("Error fetching interviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (interview: InterviewRow) => {
    if (interview.is_approved === "approved") return <Badge variant="default">Approved</Badge>
    if (interview.is_approved === "rejected") return <Badge variant="destructive">Rejected</Badge>
    return <Badge variant="secondary">Pending</Badge>
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const selectAll = (all: boolean) => {
    setSelectedIds(all ? interviews.map((i) => i.id) : [])
  }

  const exportSelectedPDF = () => {
    if (!selectedIds.length) return alert("No interviews selected")
    const doc = new jsPDF()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.text("Selected Interview Reports", 14, 20)

    let yOffset = 30
    selectedIds.forEach((id) => {
      const interview = interviews.find((i) => i.id === id)
      if (!interview) return
      const tableData = [
        ["Student Name", interview.student_name],
        ["Roll Number", interview.roll_number],
        ["Job Title", interview.job_title],
        ["Interview Round", interview.interview_round.toString()],
        ["Interview Type", interview.interview_type],
        ["Scheduled Date", new Date(interview.scheduled_date).toLocaleString()],
        ["Result", interview.result ?? "Pending"],
        ["Approval Status", interview.is_approved ?? "Pending"],
      ]
      autoTable(doc, {
        startY: yOffset,
        head: [["Field", "Details"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 11, cellPadding: 3 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      })
      yOffset = (((doc as any).lastAutoTable?.finalY) ?? yOffset) + 15
    })
    doc.save("Selected_Interviews.pdf")
  }

  const now = new Date()
  const upcomingInterviews = interviews.filter(
    (i) => new Date(i.scheduled_date) > now && i.result === "pending"
  )
  const ongoingInterviews = interviews.filter(
    (i) => i.result === "pending" && new Date(i.scheduled_date) <= now
  )
  const completedInterviews = interviews.filter((i) => i.result !== "pending")

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interview Reports</h1>
      <HistorySection target_table="interviews" title="Interview History" />
          <p className="text-muted-foreground mt-1">Overview of all interview drives</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => selectAll(selectedIds.length !== interviews.length)}>
            {selectedIds.length === interviews.length ? "Deselect All" : "Select All"}
          </Button>
          <Button onClick={exportSelectedPDF} className="flex items-center gap-1">
            <Download className="h-4 w-4" /> Export Selected
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Loading interviews...</p>
      ) : (
        <>
          {[
            { title: "Upcoming Interviews", data: upcomingInterviews },
            { title: "Ongoing Interviews", data: ongoingInterviews },
            { title: "Completed Interviews", data: completedInterviews },
          ].map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>
                  {section.data.length}{" "}
                  {section.data.length === 1 ? "interview" : "interviews"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {section.data.length === 0 ? (
                  <p className="text-muted-foreground">No interviews in this section</p>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead></TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Job</TableHead>
                          <TableHead>Round</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {section.data.map((interview) => (
                          <TableRow key={interview.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.includes(interview.id)}
                                onCheckedChange={() => toggleSelect(interview.id)}
                              />
                            </TableCell>
                            <TableCell>{interview.student_name}</TableCell>
                            <TableCell>{interview.job_title}</TableCell>
                            <TableCell>{interview.interview_round}</TableCell>
                            <TableCell>{interview.interview_type}</TableCell>
                            <TableCell>
                              {new Date(interview.scheduled_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{interview.result ?? "Pending"}</TableCell>
                            <TableCell>{getStatusBadge(interview)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  )
}
