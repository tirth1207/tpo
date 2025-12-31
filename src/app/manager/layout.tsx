import { AppSidebar } from "@/components/app-sidebar"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import DynamicHeader from "@/components/DynamicHeader"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') {
    if (profile?.role === 'student') redirect('/student')
    else if (profile?.role === 'faculty') redirect('/faculty')
    else if (profile?.role === 'company') redirect('/company')
    else if (profile?.role === 'admin') redirect('/admin')
    else redirect('/')
  }

  const sidebarData = {
    user: {
      name: profile?.full_name || user.email?.split("@")[0] || "User",
      email: user.email!,
      avatar: profile?.avatar_url || "/avatars/default.jpg",
    },
    company: {
      name: "RCTI TPO",
      plan: profile?.role || "Member",
      url: "/manager",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/manager",
        icon: "SquareTerminal",
        isActive: true,
        items: [
          { title: "Overview", url: "/manager" },
          { title: "Company Approvals", url: "/manager/company-approvals" },
          { title: "Faculty Approvals", url: "/manager/faculty-approvals" },
          { title: "Faculty - Students List", url: "/manager/faculty-table" },
        ],
      },
      { title: "Analytics", url: "/manager/analytics", icon: "AlignEndHorizontal" },
      { title: "Drives", url: "/manager/drives", icon: "Bot" },
      { title: "Reports", url: "/manager/reports", icon: "PieChart" },
      { title: "Applications", url: "/manager/applications", icon: "FileText" },
      // { title: "Settings", url: "/manager/settings", icon: "Settings2" },
    ],
    navSecondary: [
      {
        title: "Theme Toggle",
        url: "#",
        icon: "Sun",
      },
    ],
    projects: [],
  }

  return (
    <SidebarProvider>
      <AppSidebar data={sidebarData} />
      <SidebarInset>
        <div className="rounded-lg bg-background flex flex-col h-full overflow-auto">
          <div className="flex items-center h-16 px-4 border-b">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-8 w-8" />
              <Separator orientation="vertical" className="h-6" />
              <DynamicHeader pathName="manager"/>
            </div>
          </div>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
