"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Users, Clock, MapPin, AlertTriangle, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/supabaseClient"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog"

interface Company {
  id: string
  company_name: string
}

interface Drive {
  id: string
  title: string
  description: string
  requirements: string[]
  company_id: string
  skills_required: string[]
  salary_min: number
  salary_max: number
  job_type: string
  location: string
  application_deadline: string
  application_count?: number
  is_approved: "pending" | "approved" | "rejected"
}

interface Application {
  id: string
  job_id: string
  student_name: string
  student_email: string
  status: string
  applied_at: string
  interview_date?: string | null
  notes?: string | null
}

export default function DriveManagement() {
  const [drives, setDrives] = useState<Drive[]>([])
  const [applications, setApplications] = useState<{ [key: string]: Application[] }>({})
  const [companies, setCompanies] = useState<Company[]>([])
  const [viewApplicationsDriveId, setViewApplicationsDriveId] = useState<string | null>(null)
  const [scheduleDialogDriveId, setScheduleDialogDriveId] = useState<string | null>(null)

  useEffect(() => {
    fetchDrives()
    fetchCompanies()
  }, [])

  const fetchDrives = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        applications:applications(
          *,
          student:students(
            is_approved,
            profile:profiles!students_user_id_fkey(
              id,
              full_name,
              email
            )
          )
        )
      `)
      .order("application_deadline", { ascending: true });

    if (error) {
      console.error("Error fetching drives:", error);
      return;
    }

    // Filter only applications with verified students
    const drivesWithCount = (data || []).map((drive: any) => {
      const verifiedApps = (drive.applications || []).filter((app: any) => app.student?.is_approved)
      return {
        ...drive,
        application_count: verifiedApps.length
      }
    })

    setDrives(drivesWithCount)

    // Map applications
    const appsMap: { [key: string]: Application[] } = {}
    drivesWithCount.forEach(drive => {
      appsMap[drive.id] = (drive.applications || [])
        .filter((app: any) => app.student?.is_approved)
        .map((app: any) => ({
          id: app.id,
          job_id: app.job_id,
          status: app.status,
          applied_at: app.applied_at,
          interview_date: app.interview_date,
          notes: app.notes,
          student_name: app.student?.profile?.full_name || "Unknown",
          student_email: app.student?.profile?.email || "N/A"
        }))
    })

    setApplications(appsMap)
  }

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from("companies")
      .select("id, company_name")
    if (error) return console.error(error)
    setCompanies(data || [])
  }

  const downloadReport = (jobId: string) => {
    const rows = applications[jobId] || [];
    if (!rows.length) return alert("No applications to download");

    const escapeCsv = (val: string) =>
      `"${val?.toString().replace(/"/g, '""') || ""}"`;

    const csv = [
      ["Student Name", "Email", "Status", "Applied At", "Interview Date", "Notes"],
      ...rows.map(r => [
        escapeCsv(r.student_name),
        escapeCsv(r.student_email),
        escapeCsv(r.status),
        escapeCsv(r.applied_at),
        escapeCsv(r.interview_date || ""),
        escapeCsv(r.notes || "")
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications_${jobId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const getBorderClass = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-400"
      case "rejected":
        return "border-red-500"
      default:
        return "border-gray-200"
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center gap-1 text-yellow-600 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4" /> Not approved by admin
          </div>
        )
      case "rejected":
        return (
          <div className="flex items-center gap-1 text-red-600 text-sm font-semibold">
            <XCircle className="h-4 w-4" /> Rejected by admin
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Drive Management</h2>
          <p className="text-gray-600">Create and manage your recruitment drives</p>
        </div>
        <Button onClick={() => {}} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="h-4 w-4 mr-2" />
          Create New Drive
        </Button>
      </div>

      <div className="grid gap-6">
        {drives.map(drive => (
          <Card key={drive.id} className={`border ${getBorderClass(drive.is_approved)}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{drive.title}</CardTitle>
                  <CardDescription className="text-base">{drive.description}</CardDescription>
                  {getStatusMessage(drive.is_approved)}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" /> {drive.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" /> {drive.application_count || 0} applications
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" /> Deadline: {drive.application_deadline}
                </div>
                <div className="text-sm font-semibold text-green-600">{drive.salary_min}-{drive.salary_max} LPA</div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Requirements:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {drive.requirements.map((req, i) => <li key={i}>{req}</li>)}
                </ul>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t">
                <Button variant="outline" onClick={() => setViewApplicationsDriveId(drive.id)}>View Applications</Button>
                <Button variant="outline" onClick={() => setScheduleDialogDriveId(drive.id)}>Schedule Interviews</Button>
                <Button variant="outline" onClick={() => downloadReport(drive.id)}>Download Reports</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applications Dialog */}
      {viewApplicationsDriveId && (
        <Dialog open={!!viewApplicationsDriveId} onOpenChange={() => setViewApplicationsDriveId(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Applications</DialogTitle>
              <DialogDescription>All applications for this drive</DialogDescription>
            </DialogHeader>
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-left border">
                <thead>
                  <tr>
                    <th className="px-2 py-1 border">Student Name</th>
                    <th className="px-2 py-1 border">Email</th>
                    <th className="px-2 py-1 border">Status</th>
                    <th className="px-2 py-1 border">Applied At</th>
                    <th className="px-2 py-1 border">Interview Date</th>
                    <th className="px-2 py-1 border">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {applications[viewApplicationsDriveId]?.map(app => (
                    <tr key={app.id}>
                      <td className="px-2 py-1 border">{app.student_name}</td>
                      <td className="px-2 py-1 border">{app.student_email}</td>
                      <td className="px-2 py-1 border">{app.status}</td>
                      <td className="px-2 py-1 border">{app.applied_at}</td>
                      <td className="px-2 py-1 border">{app.interview_date || "-"}</td>
                      <td className="px-2 py-1 border">{app.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Schedule Interviews Dialog */}
      {scheduleDialogDriveId && (
        <Dialog open={!!scheduleDialogDriveId} onOpenChange={() => setScheduleDialogDriveId(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Scheduled Interviews</DialogTitle>
              <DialogDescription>See which students have interviews scheduled</DialogDescription>
            </DialogHeader>
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-left border">
                <thead>
                  <tr>
                    <th className="px-2 py-1 border">Student Name</th>
                    <th className="px-2 py-1 border">Email</th>
                    <th className="px-2 py-1 border">Interview Date</th>
                    <th className="px-2 py-1 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications[scheduleDialogDriveId]?.map(app => (
                    <tr key={app.id}>
                      <td className="px-2 py-1 border">{app.student_name}</td>
                      <td className="px-2 py-1 border">{app.student_email}</td>
                      <td className="px-2 py-1 border">{app.interview_date || "-"}</td>
                      <td className="px-2 py-1 border">{app.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
