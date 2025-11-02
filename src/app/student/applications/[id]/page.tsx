"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, AlertCircle } from "lucide-react"

interface ApplicationDetail {
  id: string
  status: string
  applied_at: string
  notes: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  profiles?: { id: string; full_name: string; email: string }
  jobs: {
    id: string
    title: string
    job_type: string
    location: string
    salary_min: number | null
    salary_max: number | null
    application_deadline: string | null
    companies: {
      company_name: string
      industry: string | null
    }
  }
}

export default function ApplicationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const applicationId = params.id

  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/students/applications/${applicationId}`)
        if (!res.ok) throw new Error("Failed to fetch application")
        const data = await res.json()
        console.log(data)
        setApplication(data.application)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
  }, [applicationId])

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return <Badge variant="secondary">Applied</Badge>
      case "under_review":
        return <Badge variant="outline">Under Review</Badge>
      case "shortlisted":
        return <Badge variant="secondary">Shortlisted</Badge>
      case "interview_scheduled":
        return <Badge variant="default">Interview Scheduled</Badge>
      case "selected":
        return <Badge variant="default">Selected</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "offer_accepted":
        return <Badge variant="default">Offer Accepted</Badge>
      case "offer_rejected":
        return <Badge variant="destructive">Offer Rejected</Badge>
      default:
        return <Badge variant="outline">{status.replace("_", " ")}</Badge>
    }
  }

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Not specified"
    if (min && max) return `₹${min} - ₹${max} LPA`
    if (min) return `₹${min} LPA+`
    if (max) return `Up to ₹${max} LPA`
    return "Not specified"
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified"
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
    )
  }

  if (error || !application) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center gap-3 p-6">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="font-medium text-red-800">Error loading application</p>
            <p className="text-sm text-red-600">{error || "Application not found"}</p>
          </div>
        </CardContent>
        <CardContent>
          <Button onClick={() => router.back()}>Go Back</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Button size="sm" onClick={() => router.back()}>
        ← Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{application.jobs.title}</CardTitle>
          <CardDescription>{application.jobs.companies.company_name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Status:</strong> {getStatusBadge(application.status)}
          </p>
          <p>
            <strong>Applied At:</strong> {formatDate(application.applied_at)}
          </p>
          <p>
            <strong>Salary:</strong>{" "}
            {formatSalary(application.jobs.salary_min, application.jobs.salary_max)}
          </p>
          <p>
            <strong>Application Deadline:</strong>{" "}
            {formatDate(application.jobs.application_deadline)}
          </p>
          <p>
            <strong>Notes:</strong> {application.notes || "No notes"}
          </p>
          <p>
            <strong>Reviewed At:</strong> {formatDate(application.reviewed_at)}
          </p>
          <p>
            <strong>Reviewed By:</strong> {application.profiles?.email || application.profiles?.full_name || "Not reviewed yet"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
