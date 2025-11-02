import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default async function StudentLayout({
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

  if (profile?.role !== 'student') {
    if (profile?.role === 'admin') redirect('/admin')
    else if (profile?.role === 'faculty') redirect('/faculty')
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
      url: "/student",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/student/dashboard",
        icon: "SquareTerminal",
        isActive: true,
        items: [
          { title: "Overview", url: "/student/dashboard" },
          { title: "My Profile", url: "/student/profile" },
        ],
      },
      { title: "Applications", url: "/student/applications", icon: "Briefcase" },
      { title: "Offer Letters", url: "/student/offers", icon: "FileText" },
      { title: "Settings", url: "/student/settings", icon: "Settings2" },
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
