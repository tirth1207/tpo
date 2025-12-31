"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useAuth } from "@/lib/supabase/useSupabaseAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { SquareArrowOutUpRight, ArrowLeft } from "lucide-react"
 

interface ApplicationDetail {
  id: string
  status: string
  applied_at: string
  cover_letter: string | null
  resume_url: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  interview_date: string | null
  notes: string | null
  reviewer?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
  students: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    resume_url: string | null
    roll_number?: string | null
    department?: string | null
    semester?: number | null
    cgpa?: number | null
    phone?: string | null
  } | null
  jobs: {
    id: string
    title: string | null
    job_type?: string | null
    location?: string | null
    description?: string | null
    salary_min?: number | null
    salary_max?: number | null
    application_deadline?: string | null
    skills_required?: string[] | null
    requirements?: string[] | null
    is_active?: boolean | null
    is_approved?: string | null
    companies?: {
      company_name?: string | null
    } | null
  } | null
}

function StatusBadge({ status }: { status: string | null }) {
  const normalized = (status || "").toLowerCase()
  if (normalized === "approved") return <Badge variant="default">Approved</Badge>
  if (normalized === "rejected") return <Badge variant="destructive">Rejected</Badge>
  return <Badge variant="secondary">Pending</Badge>
}

export default function ReviewApplicationPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const id = useMemo(() => (Array.isArray(params?.id) ? params.id[0] : params?.id), [params])

  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<ApplicationDetail | null>(null)

  const fetchApplication = async (appId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
            id, status, applied_at, reviewed_at, reviewed_by, notes, interview_date,
            reviewer:reviewed_by(id, full_name, email),
            students:student_id(id, first_name, last_name, email, resume_url, roll_number, department, semester, cgpa, phone),
            jobs:job_id(id, title, job_type, location, description, salary_min, salary_max, application_deadline, skills_required, requirements, is_active, is_approved, companies:company_id(company_name))
          `
        )
        .eq("id", appId)
        .single()

      if (error) {
        console.error("Error loading application:", error)
        setApplication(null)
      } else {
        setApplication(data as unknown as ApplicationDetail)
      }
      console.log(data)
    } finally {
      setLoading(false)
    }
  }
  



  useEffect(() => {
    // if (authLoading) return
    // if (!user) {
    //   // Handle unauthenticated state, perhaps redirect or show error
    //   return
    // }
    // if (id) {


      fetchApplication(id)
  }, [id])

  const studentName = useMemo(() => {
    if (!application?.students) return "Unknown"
    const f = application.students.first_name || ""
    const l = application.students.last_name || ""
    return `${f} ${l}`.trim() || "Unknown"
  }, [application])

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Application Review</h1>
          <p className="text-muted-foreground mt-1">View full details of the application</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/applications")}> 
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading application...</p>
      ) : !application ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Application not found.</p>
            <Button className="mt-4" variant="outline" onClick={() => router.push("/admin/applications")}>Back to Applications</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">{studentName}</CardTitle>
                  <div className="mt-1 text-sm text-muted-foreground">{application.students?.email || "No email provided"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={application.status} />
                  <Badge variant={application.reviewed_at ? "default" : "secondary"}>
                    {application.reviewed_at ? "Reviewed" : "Not Reviewed"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border">
                  <div className="p-4 border-b">
                    <div className="font-medium">Student Details</div>
                  </div>
                  <div className="p-4">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Name</TableCell>
                          <TableCell>{studentName}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Email</TableCell>
                          <TableCell>{application.students?.email || "—"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Resume</TableCell>
                          <TableCell>
                            {application.students?.resume_url ? (
                              <a
                                href={application.students.resume_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary"
                              >
                                View Resume <SquareArrowOutUpRight className="h-4 w-4" />
                              </a>
                            ) : (
                              "Not provided"
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Roll Number</TableCell>
                          <TableCell>{application.students?.roll_number || "—"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Department</TableCell>
                          <TableCell>{application.students?.department || "—"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Semester</TableCell>
                          <TableCell>{application.students?.semester || "—"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">CGPA</TableCell>
                          <TableCell>{application.students?.cgpa || "—"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Phone</TableCell>
                          <TableCell>{application.students?.phone || "—"}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="rounded-lg border">
                  <div className="p-4 border-b">
                    <div className="font-medium">Job Details</div>
                  </div>
                  <div className="p-4">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Title</TableCell>
                          <TableCell>{application.jobs?.title || "—"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Company</TableCell>
                          <TableCell>{application.jobs?.companies?.company_name || "—"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Type</TableCell>
                          <TableCell>{application.jobs?.job_type || "—"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Location</TableCell>
                          <TableCell>{application.jobs?.location || "—"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Salary Range</TableCell>
                          <TableCell>
                            {application.jobs?.salary_min != null || application.jobs?.salary_max != null
                              ? `₹${application.jobs?.salary_min ?? "—"} - ₹${application.jobs?.salary_max ?? "—"}`
                              : "—"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Application Deadline</TableCell>
                          <TableCell>{application.jobs?.application_deadline ? new Date(application.jobs.application_deadline).toLocaleDateString() : "—"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Job Status</TableCell>
                          <TableCell>{application.jobs?.is_active ? "Active" : "Inactive"} / {application.jobs?.is_approved || "pending"}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    {application.jobs?.description && (
                      <div className="mt-4 text-sm text-foreground/90">{application.jobs.description}</div>
                    )}
                    {(application.jobs?.skills_required?.length || 0) > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium mb-1">Skills Required</div>
                        <div className="flex flex-wrap gap-2">
                          {(application.jobs?.skills_required || []).map((s) => (
                            <Badge key={s} variant="outline">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {(application.jobs?.requirements?.length || 0) > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium mb-1">Requirements</div>
                        <div className="flex flex-wrap gap-2">
                          {(application.jobs?.requirements || []).map((r) => (
                            <Badge key={r} variant="outline">{r}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border">
                <div className="p-4 border-b">
                  <div className="font-medium">Application Details</div>
                </div>
                <div className="p-4">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Status</TableCell>
                        <TableCell><StatusBadge status={application.status} /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Applied On</TableCell>
                        <TableCell>{application.applied_at ? new Date(application.applied_at).toLocaleString() : "—"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Interview Date</TableCell>
                        <TableCell>{application.interview_date ? new Date(application.interview_date).toLocaleDateString() : "—"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Reviewed On</TableCell>
                        <TableCell>{application.reviewed_at ? new Date(application.reviewed_at).toLocaleString() : "—"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Reviewed By</TableCell>
                        <TableCell>{application.reviewer?.full_name || application.reviewed_by || "—"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Application Resume</TableCell>
                        <TableCell>
                          {application.resume_url ? (
                            <a href={application.resume_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary">
                              View Attachment <SquareArrowOutUpRight className="h-4 w-4" />
                            </a>
                          ) : (
                            "Not provided"
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  {application.notes && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-1">Reviewer Notes</div>
                      <div className="text-sm text-foreground/90 whitespace-pre-wrap">{application.notes}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border">
                <div className="p-4 border-b">
                  <div className="font-medium">Cover Letter</div>
                </div>
                <div className="p-4 text-sm text-foreground/90 whitespace-pre-wrap">
                  {application.cover_letter || "No cover letter provided."}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {application.resume_url && (
                  <Button asChild variant="outline">
                    <a href={application.resume_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                      Applicant Resume <SquareArrowOutUpRight className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button variant="outline" onClick={() => router.push("/admin/applications")}>Back to Applications</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}


