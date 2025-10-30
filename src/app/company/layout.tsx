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

export default async function CompanyLayout({
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

  if (profile?.role !== 'company') {
    if (profile?.role === 'student') redirect('/student/dashboard')
    else if (profile?.role === 'faculty') redirect('/faculty/dashboard')
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
      name: "TechCorp Inc.",
      plan: "Company Portal",
      url: "/company",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/company",
        icon: "LayoutDashboard",
        isActive: true,
      },
      { title: "Manage Drives", url: "/company/drives", icon: "Calendar" },
      { title: "Applications", url: "/company/applications", icon: "Users" },
      { title: "Interviews", url: "/company/interviews", icon: "FileText" },
      { title: "Reports", url: "/company/reports", icon: "BarChart3" },
      { title: "Profile", url: "/company/profile", icon: "Building2" },
      { title: "Settings", url: "/company/settings", icon: "Settings" },
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
        <div className="rounded-lg bg-background flex flex-col h-full">
          <div className="flex items-center h-16 px-4 border-b">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-8 w-8" />
              <Separator orientation="vertical" className="h-6" />
              <DynamicHeader />
            </div>
          </div>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
