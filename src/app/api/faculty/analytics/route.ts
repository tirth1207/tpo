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

    // Check if user is faculty or admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !['faculty', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    if (type === 'overview') {
      // Get overview statistics
      const [
        { count: totalStudents },
        { count: approvedStudents },
        { count: pendingStudents },
        { count: totalApplications },
        { count: selectedApplications },
        { count: totalJobs },
        { count: totalCompanies }
      ] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('profiles.is_approved', true),
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('profiles.is_approved', false),
        supabase.from('applications').select('id', { count: 'exact', head: true }),
        supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'selected'),
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id', { count: 'exact', head: true })
      ])

      return NextResponse.json({
        overview: {
          totalStudents: totalStudents || 0,
          approvedStudents: approvedStudents || 0,
          pendingStudents: pendingStudents || 0,
          totalApplications: totalApplications || 0,
          selectedApplications: selectedApplications || 0,
          totalJobs: totalJobs || 0,
          totalCompanies: totalCompanies || 0,
          placementRate: totalApplications > 0 ? ((selectedApplications || 0) / totalApplications * 100).toFixed(2) : 0
        }
      })
    }

    if (type === 'branch-stats') {
      // Get branch-wise statistics
      const { data: branchStats, error: branchError } = await supabase
        .from('students')
        .select(`
          branch,
          profiles!inner(is_approved),
          applications(id, status)
        `)

      if (branchError) {
        return NextResponse.json({ error: 'Failed to fetch branch statistics' }, { status: 400 })
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

      return NextResponse.json({ branchStats: branchData })
    }

    if (type === 'recent-activity') {
      // Get recent applications and approvals
      const { data: recentApplications, error: recentAppsError } = await supabase
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

      const { data: recentApprovals, error: recentApprovalsError } = await supabase
        .from('profiles')
        .select(`
          *,
          students(roll_number)
        `)
        .eq('is_approved', true)
        .order('approved_at', { ascending: false })
        .limit(10)

      if (recentAppsError || recentApprovalsError) {
        return NextResponse.json({ error: 'Failed to fetch recent activity' }, { status: 400 })
      }

      return NextResponse.json({
        recentApplications: recentApplications || [],
        recentApprovals: recentApprovals || []
      })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })

  } catch (error) {
    console.error('Get faculty analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

