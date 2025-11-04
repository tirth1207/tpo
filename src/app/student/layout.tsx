// app/student/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudentSidebarLayout } from './StudentSidebarLayout' // client wrapper
import { User2 } from 'lucide-react'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
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
    company: { name: "RCTI TPO", plan: profile?.role || "Member", url: "/student" },
    navMain: [
      { title: "Dashboard", url: "/student", icon: "SquareTerminal", items: [] },
      { title: "My Profile", url: "/student/profile", icon: "User2"},
      { title: "Applications", url: "/student/applications", icon: "Briefcase" },
      { title: "Offer Letters", url: "/student/offers", icon: "FileText" },
      { title: "Jobs", url: "/student/jobs", icon: "Notebook" },
    ],
    navSecondary: [{ title: "Theme Toggle", url: "#", icon: "Sun" }],
    projects: [],
  }

  // Wrap children in a client component that hides sidebar for profile-completion
  return <StudentSidebarLayout sidebarData={sidebarData}>{children}</StudentSidebarLayout>
  
}
