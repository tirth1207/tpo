"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function StudentApprovalPage() {
  const params = useParams()
  const studentID = params.studentID as string
  const [student, setStudent] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/faculty/student/${studentID}`)
      const data = await res.json()
      setStudent(data.student)
      setApplications(data.applications)
      setLoading(false)
    }
    load()
  }, [studentID])

  const cap = (s: string) =>
    s?.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")

  if (loading) return <div className="text-center p-10">Loading…</div>
  if (!student) return <div className="text-center p-10">Not Found</div>

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">
        {cap(student.first_name)} {cap(student.last_name)}
      </h2>

      <Card>
        <CardHeader><CardTitle>Student Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <p><strong>Roll Number:</strong> {student.roll_number}</p>
          <p><strong>Department:</strong> {cap(student.department)}</p>
          <p><strong>Semester:</strong> {student.semester}</p>
          <p><strong>CGPA:</strong> {student.cgpa}</p>
          <p><strong>PCP:</strong> {student.pcp}%</p>
          <p><strong>DOB:</strong> {student.dob}</p>
          <p><strong>Email:</strong> {student.email}</p>
          <p><strong>Phone:</strong> {student.phone}</p>
          <p><strong>Address:</strong> {student.address}</p>
          <p><strong>Bio:</strong> {student.bio}</p>
          <p>
            <strong>Resume:</strong>{" "}
            <a
              href={student.resume_url}
              target="_blank"
              className="text-blue-600 underline"
            >Open</a>
          </p>

          <div className="col-span-2">
            <strong>Skills: </strong>
            {student.skills?.map((skill: string) => (
              <Badge key={skill} className="mr-2 mt-1">{skill}</Badge>
            ))}
          </div>

          <p>
            <strong>Status:</strong>{" "}
            {student.is_approved ? (
              <Badge>Approved ✅</Badge>
            ) : (
              <Badge variant="destructive">Pending ❌</Badge>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Applications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {applications.length === 0 && <p>No applications submitted</p>}

          {applications.map(app => (
            <div
              key={app.id}
              className="border rounded-lg p-3 flex justify-between"
            >
              <p>
                <strong>{app.jobs?.title}</strong>
                <br />
                {!app.jobs?.companies?.website ? null : (
                  <a
                    href={app.jobs.companies.website}
                    target="_blank"
                    className="text-sm text-blue-500 underline"
                  >
                    {app.jobs.companies.company_name ?? "Company Website"}
                  </a>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(app.applied_at).toLocaleDateString()} • {app.status}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {!student.is_approved && (
        <Button onClick={async () => {
          setApproving(true)
          await fetch(`/api/faculty/student/${studentID}`, { method: "POST" })
          router.push("/faculty/approvals")
        }}>
          {approving ? "Approving…" : "Approve Student ✅"}
        </Button>
      )}
    </div>
  )
}
