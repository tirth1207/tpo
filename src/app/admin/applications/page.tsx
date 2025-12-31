"use client"
import React, { useEffect, useState } from 'react'
import { supabase } from "@/lib/supabase/supabaseClient"
import { Table, TableBody, TableCell, TableHeader } from '@/components/ui/table'
import { TableRow } from '@/components/ui/table'
import { TableHead } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { SquareArrowOutUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
// import { Application } from '@/lib/supabase/types'
import HistorySection from '@/components/admin/HistorySection'

interface Application {
    id: string
    students: {
        id: string
        first_name: string
        last_name: string
        email: string
        resume_url: string
    }
    jobs: {
        id: string
        title: string
        company_id: string
        companies?: {
            company_name: string
        }
    }
    status: string
    applied_at: string
    resume_url: string
    cover_letter: string
    created_at: string
    updated_at: string
    student_name: string
    job_title: string
    company_name: string
}

function Applications() {
    const router = useRouter()
    const [applications, setApplications] = useState<Application[]>([])
    useEffect(()=>{
        fetchApplications()
    }, [])

    const fetchApplications = async () => {
        const { data, error } = await supabase.from('applications').select('*, students:student_id(id, first_name, last_name, email,resume_url), jobs:job_id(id, title, companies:company_id(company_name))')
        console.log(data, error)
        if (error) {
            console.error(error)
        } else {
            setApplications(data.map((application: Application) => ({
                ...application,
                student_name: `${application.students?.first_name} ${application.students?.last_name}`,
                job_title: application.jobs?.title || 'N/A',
                status: application.status,
                applied_at: application.applied_at,
                resume_url: application.students?.resume_url,
                company_name: application.jobs?.companies?.company_name || 'N/A',
                cover_letter: application.cover_letter,
                created_at: application.created_at,
                updated_at: application.updated_at,
            } as Application)))
            console.log(applications)
        }
    }
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString()
    }
    const handleViewApplication = (id: string) => {
        console.log(id)
        router.push(`/admin/applications/review/${id}`)
    }

  return (
    <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Applications</h1>
        <Table className="w-full">
            <TableHeader>
                <TableRow className="bg-muted">
                    {/* <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Application ID</TableHead> */}
                    <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Student Name</TableHead>
                    <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Job Title</TableHead>
                    <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Status</TableHead>
                    <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Applied Date</TableHead>
                    <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Resume URL</TableHead>
                    <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Company Name</TableHead>
                    {/* <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Created At</TableHead>
                    <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Updated At</TableHead> */}
                    <TableHead className="px-4 py-3 text-left font-semibold text-foreground">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {applications.map((application) => (
                    <TableRow key={application.id}>
                        {/* <TableCell>{application.id}</TableCell> */}
                        <TableCell>{application.student_name}</TableCell>
                        <TableCell>{application.job_title}</TableCell>
                        <TableCell>{application.status}</TableCell>
                        <TableCell>{formatDate(application.applied_at)}</TableCell>
                        <TableCell><a href={application.resume_url} target="_blank" rel="noopener noreferrer" className='flex items-center gap-2'>Resume<SquareArrowOutUpRight className="w-4 h-4" /></a></TableCell>
                        <TableCell>{application.company_name}</TableCell>
                        {/* <TableCell>{formatDate(application.created_at)}</TableCell>
                        <TableCell>{formatDate(application.updated_at)}</TableCell> */}
                        <TableCell><Button size="sm" variant="outline" onClick={() => handleViewApplication(application.id)}>Review</Button></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    <HistorySection target_table="applications" title="Applications History" />
    </div>
  )
}

export default Applications
 
// add history section export for page