import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default async function FacultyLayout({
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

  if (profile?.role !== 'faculty') {
    if (profile?.role === 'admin') redirect('/admin')
    else if (profile?.role === 'student') redirect('/student')
    else if (profile?.role === 'company') redirect('/company')
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
      url: "/faculty",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/faculty",
        icon: "SquareTerminal",
        isActive: true,
        items: [
          { title: "Overview", url: "/faculty" },
          { title: "My Profile", url: "/faculty/profile" },
        ],
      },
      { title: "Student Profiles", url: "/faculty/students-list", icon: "Users" },
      { title: "Student Applications", url: "/faculty/applications", icon: "Briefcase" },
      { title: "Approval Requests", url: "/faculty/approvals", icon: "UserCheck" },
      { title: "Export Data", url: "/faculty/export", icon: "Download" },
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
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
