// app/student/StudentSidebarLayout.tsx
"use client"

import React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { usePathname } from "next/navigation"

interface SidebarData {
  user: {
    name: string
    email: string
    avatar: string
  }
  company: {
    name: string
    plan: string
    url: string
  }
  navMain: any[]
  navSecondary: any[]
  projects: any[]
}

export const StudentSidebarLayout: React.FC<{
  sidebarData: SidebarData
  children: React.ReactNode
}> = ({ sidebarData, children }) => {
  const pathname = usePathname()
  const hideSidebar = pathname.includes("/student/profile-completion")

  if (hideSidebar) return <>{children}</>

  return (
    <SidebarProvider>
      <AppSidebar data={sidebarData} />
      <SidebarInset>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
