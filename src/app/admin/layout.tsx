import { AppSidebar } from "@/components/app-sidebar"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Create server client
  const supabase = await createClient()

  // Fetch current logged-in user
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) {
    // Redirect to login if not authenticated
    redirect('/auth/login')
  }

  // Fetch profile from your 'profiles' table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Check if user is admin
  if (profile?.role !== 'admin') {
    // Redirect non-admin users to their appropriate dashboard
    if (profile?.role === 'student') {
      redirect('/student/dashboard')
    } else if (profile?.role === 'faculty') {
      redirect('/faculty/dashboard')
    } else if (profile?.role === 'company') {
      redirect('/company/dashboard')
    } else {
      redirect('/')
    }
  }

  // Sidebar data (pass icons as strings!)
  const sidebarData = {
    user: {
      name: profile?.full_name || user.email?.split("@")[0] || "User",
      email: user.email!,
      avatar: profile?.avatar_url || "/avatars/default.jpg",
    },
    company: {
      name: "RCTI TPO",
      plan: profile?.role || "Member",
      url: "/admin",
    },
    navMain: [
      { 
        title: "Dashboard", 
        url: "/admin", 
        icon: "SquareTerminal", 
        isActive: true, 
        items: [{ title: "Overview", url: "/admin" },
            { title: "Company Approvals", url: "/admin/company-approvals" },
            { title: "Faculty Approvals", url: "/admin/faculty-approvals" }
        ]
      },
      { 
        title: "Analytics", 
        url: "/admin/analytics", 
        icon: "AlignEndHorizontal", 
        // items: [{ title: "View Analytics", url: "/admin/analytics" }] 
      },
      { 
        title: "Drives", 
        url: "/admin/drives", 
        icon: "Bot", 
      },
      { title: "Reports",
        url: "/admin/reports", 
        icon: "PieChart" 
      },
      { 
        title: "Settings", 
        url: "/admin/settings", 
        icon: "Settings2", 
      },
    ],
    navSecondary: [
      // { title: "Support", url: "/admin/support", icon: "LifeBuoy" },
      // { title: "Feedback", url: "/admin/feedback", icon: "Send" },
      // { title: "Settings", url: "/admin/settings", icon: "Settings" },
    ],
    projects: [
      // { name: "Placement Drives", url: "/admin/projects/placements", icon: "Frame" },
      
      // { name: "Events", url: "/admin/projects/events", icon: "Map" },
    ],
  }

  return (
    <SidebarProvider>
      <AppSidebar data={sidebarData} />
      <SidebarInset>
        <body>
             <SidebarTrigger className="mb-4" />
          {children}
        </body>
      </SidebarInset>
    </SidebarProvider>
  )
}