"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, FileText, Calendar, Building2, AlertCircle, SquareArrowOutUpRightIcon } from "lucide-react"

interface Offer {
  id: string
  salary: string | null
  joining_date: string | null
  offer_document_url: string | null
  offer_status: string
  created_at: string
  response_deadline: string 
  applications: {
    jobs: {
      title: string
      companies: {
        company_name: string
      }
    }
  }
}

export function OfferLetters() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/students/offers')
        if (!response.ok) {
          throw new Error('Failed to fetch offers')
        }
        const data = await response.json()
        setOffers(data.offers || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending Response</Badge>
      case "accepted":
        return <Badge variant="default">Accepted</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatSalary = (salary: string | null) => {
    if (!salary) return "Not specified"
    return `₹${salary} LPA`
  } 

  const handleApprove = async (offerId: string) => {
    try {
      const res = await fetch(`/api/students/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_status: 'accepted' }),
      })
      if (!res.ok) throw new Error('Failed to accept offer')

      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === offerId ? { ...offer, offer_status: 'accepted' } : offer
        )
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleReject = async (offerId: string) => {
    try {
      const res = await fetch(`/api/students/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_status: 'rejected' }),
      })
      if (!res.ok) throw new Error('Failed to reject offer')

      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === offerId ? { ...offer, offer_status: 'rejected' } : offer
        )
      )
    } catch (err) {
      console.error(err)
    }
  }


  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified"
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>

        <div className="grid gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 p-6">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-800">Error loading offers</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Offer Letters</h1>
          <p className="text-muted-foreground mt-1">View and manage your job offers</p>
        </div>
        {offers.length > 0 && (
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        )}
      </div>

      {offers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Offer Letters Yet</h3>
            <p className="text-muted-foreground text-center">
              Your offer letters will appear here once companies extend offers to you.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {offer.applications.jobs.companies.company_name}
                    </CardTitle>
                    <CardDescription>{offer.applications.jobs.title}</CardDescription>
                  </div>
                  {getStatusBadge(offer.offer_status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Package</p>
                    <p className="text-2xl font-bold text-primary">{formatSalary(offer.salary)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Joining Date</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(offer.joining_date)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Issue Date</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(offer.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {offer.offer_document_url && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      asChild // allow <a> to behave as the button
                    >
                      <a
                        href={offer.offer_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full h-full"
                      >
                        <SquareArrowOutUpRightIcon className="h-4 w-4" />
                        Redirect
                      </a>
                    </Button>
                  )}
                  {offer.offer_status === "pending" && (
                    <>
                      <Button variant="default" className="flex-1" onClick={() => handleApprove(offer.id)}>
                        Accept Offer
                      </Button>
                      <Button variant="destructive" className="flex-1" onClick={() => handleReject(offer.id)}>
                        Decline Offer
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
