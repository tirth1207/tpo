import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'dashboard'

    if (type === 'dashboard') {
      // Get comprehensive dashboard statistics
      const [
        { count: totalUsers },
        { count: totalStudents },
        { count: totalFaculty },
        { count: totalCompanies },
        { count: approvedUsers },
        { count: pendingUsers },
        { count: totalJobs },
        { count: activeJobs },
        { count: totalApplications },
        { count: selectedApplications }
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'faculty'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'company'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_approved', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('applications').select('id', { count: 'exact', head: true }),
        supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'selected')
      ])

      return NextResponse.json({
        dashboard: {
          users: {
            total: totalUsers || 0,
            students: totalStudents || 0,
            faculty: totalFaculty || 0,
            companies: totalCompanies || 0,
            approved: approvedUsers || 0,
            pending: pendingUsers || 0
          },
          jobs: {
            total: totalJobs || 0,
            active: activeJobs || 0
          },
          applications: {
            total: totalApplications || 0,
            selected: selectedApplications || 0,
            placementRate: totalApplications > 0 ? ((selectedApplications || 0) / totalApplications * 100).toFixed(2) : 0
          }
        }
      })
    }

    if (type === 'recent-activity') {
      // Get recent registrations, applications, and job postings
      const { data: recentRegistrations, error: regError } = await supabase
        .from('profiles')
        .select(`
          *,
          students(roll_number, branch),
          faculty(employee_id, department),
          companies(company_name, industry)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      const { data: recentApplications, error: appError } = await supabase
        .from('applications')
        .select(`
          *,
          students!inner(
            roll_number,
            profiles!inner(first_name, last_name)
          ),
          jobs!inner(
            title,
            companies!inner(company_name)
          )
        `)
        .order('applied_at', { ascending: false })
        .limit(10)

      const { data: recentJobs, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          companies!inner(company_name, industry)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (regError || appError || jobError) {
        return NextResponse.json({ error: 'Failed to fetch recent activity' }, { status: 400 })
      }

      return NextResponse.json({
        recentRegistrations: recentRegistrations || [],
        recentApplications: recentApplications || [],
        recentJobs: recentJobs || []
      })
    }

    if (type === 'analytics') {
      // Get detailed analytics
      const { data: branchStats, error: branchError } = await supabase
        .from('students')
        .select(`
          branch,
          profiles!inner(is_approved),
          applications(id, status)
        `)

      const { data: industryStats, error: industryError } = await supabase
        .from('companies')
        .select(`
          industry,
          profiles!inner(is_approved),
          jobs(id, status)
        `)

      if (branchError || industryError) {
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 400 })
      }

      // Process branch statistics
      const branchData = branchStats.reduce((acc: any, student: any) => {
        const branch = student.branch
        if (!acc[branch]) {
          acc[branch] = {
            totalStudents: 0,
            approvedStudents: 0,
            totalApplications: 0,
            selectedApplications: 0
          }
        }
        
        acc[branch].totalStudents++
        if (student.profiles.is_approved) {
          acc[branch].approvedStudents++
        }
        
        acc[branch].totalApplications += student.applications.length
        acc[branch].selectedApplications += student.applications.filter((app: any) => app.status === 'selected').length
      }, {})

      // Process industry statistics
      const industryData = industryStats.reduce((acc: any, company: any) => {
        const industry = company.industry
        if (!acc[industry]) {
          acc[industry] = {
            totalCompanies: 0,
            approvedCompanies: 0,
            totalJobs: 0,
            activeJobs: 0
          }
        }
        
        acc[industry].totalCompanies++
        if (company.profiles.is_approved) {
          acc[industry].approvedCompanies++
        }
        
        acc[industry].totalJobs += company.jobs.length
        acc[industry].activeJobs += company.jobs.filter((job: any) => job.status === 'active').length
      }, {})

      return NextResponse.json({
        branchStats: branchData,
        industryStats: industryData
      })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })

  } catch (error) {
    console.error('Get system data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
