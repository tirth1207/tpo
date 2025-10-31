"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface OfferLetter {
  id: string
  student_name: string
  company_name: string
  job_title: string
  salary?: number
  joining_date?: string
  offer_status: string
  offer_document_url?: string
  response_deadline?: string
  student_response_at?: string
}

export default function OfferLettersReport() {
  const [offerLetters, setOfferLetters] = useState<OfferLetter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOfferLetters()
  }, [])

  const fetchOfferLetters = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("offer_letters")
      .select(`
        id,
        offer_status,
        salary,
        joining_date,
        offer_document_url,
        response_deadline,
        student_response_at,
        students:student_id(
          profiles: user_id ( full_name )
        ),
        companies:company_id( company_name ),
        jobs:job_id( title )
      `)
      .order("issued_at", { ascending: false })

    if (error) {
      console.error("Error fetching offer letters:", error)
      setLoading(false)
      return
    }

    const formattedData: OfferLetter[] = data.map((o: any) => ({
      id: o.id,
      student_name: o.students?.profiles?.full_name || "Unknown",
      company_name: o.companies?.company_name || "Unknown",
      job_title: o.jobs?.title || "Unknown",
      salary: o.salary,
      joining_date: o.joining_date,
      offer_status: o.offer_status || "pending",
      offer_document_url: o.offer_document_url,
      response_deadline: o.response_deadline,
      student_response_at: o.student_response_at,
    }))

    setOfferLetters(formattedData)
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">Pending</Badge>
      case "accepted":
        return <Badge variant="default">Accepted</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "expired":
        return <Badge variant="outline" className="text-gray-500">Expired</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const downloadCSV = () => {
    const csvRows = [
      ["Student Name", "Company", "Job Title", "Salary", "Joining Date", "Status", "Offer Document", "Response Deadline", "Student Response"],
      ...offerLetters.map(o => [
        o.student_name,
        o.company_name,
        o.job_title,
        o.salary ?? "-",
        o.joining_date ?? "-",
        o.offer_status,
        o.offer_document_url || "-",
        o.response_deadline ?? "-",
        o.student_response_at ? new Date(o.student_response_at).toLocaleDateString() : "-"
      ])
    ]

    const csvString = csvRows.map(row => row.map(r => `"${r}"`).join(",")).join("\n")
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "offer_letters_report.csv"
    link.click()
  } 

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.text("Offer Letters Report", 14, 16)

    const tableColumn = [
      "Student Name",
      "Company",
      "Job Title",
      "Salary",
      "Joining Date",
      "Status",
      "Offer Document",
      "Response Deadline",
      "Student Response"
    ]

    const tableRows = offerLetters.map(o => [
      o.student_name,
      o.company_name,
      o.job_title,
      o.salary ?? "-",
      o.joining_date ?? "-",
      o.offer_status,
      o.offer_document_url ?? "-",
      o.response_deadline ?? "-",
      o.student_response_at ? new Date(o.student_response_at).toLocaleDateString() : "-"
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    })

    doc.save("offer_letters_report.pdf")
  }

  if (loading) return <p>Loading offer letters...</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Offer Letters Report</CardTitle>
        <CardDescription>All issued offer letters and their statuses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button onClick={downloadCSV}>Export CSV</Button>
          <Button onClick={downloadPDF}>Export PDF</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Joining Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Offer Document</TableHead>
              <TableHead>Response Deadline</TableHead>
              <TableHead>Student Response</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offerLetters.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell className="font-semibold">{offer.student_name}</TableCell>
                <TableCell>{offer.company_name}</TableCell>
                <TableCell>{offer.job_title}</TableCell>
                <TableCell>{offer.salary ? `₹${offer.salary.toLocaleString()}` : "-"}</TableCell>
                <TableCell>{offer.joining_date || "-"}</TableCell>
                <TableCell>{getStatusBadge(offer.offer_status)}</TableCell>
                <TableCell>
                  {offer.offer_document_url ? (
                    <Button variant="outline" size="sm" onClick={() => window.open(offer.offer_document_url, "_blank")}>
                      View
                    </Button>
                  ) : "-"}
                </TableCell>
                <TableCell>{offer.response_deadline || "-"}</TableCell>
                <TableCell>{offer.student_response_at ? new Date(offer.student_response_at).toLocaleDateString() : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
