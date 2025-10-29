"use client"

import * as React from "react"
import * as LucideIcons from "lucide-react"
import { Command, LucideIcon } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// ✅ Updated type to accept icon names as strings
type SidebarData = {
  user: {
    name: string
    email: string
    avatar: string
  }
  company?: {
    name: string
    plan?: string
    url?: string
  }
  navMain: Array<{
    title: string
    url: string
    icon: string  // Changed from LucideIcon to string
    isActive?: boolean
    items?: Array<{ title: string; url: string }>
  }>
  navSecondary: Array<{
    title: string
    url: string
    icon: string  // Changed from LucideIcon to string
  }>
  projects: Array<{
    name: string
    url: string
    icon: string  // Changed from LucideIcon to string
  }> 
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  data: SidebarData
}

// ✅ Helper function to convert string to icon component
function getIconComponent(iconName: string): LucideIcon {
  return (LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon) || LucideIcons.Circle
}

export function AppSidebar({ data, ...props }: AppSidebarProps) {
  const company = {
    name: "RCTI TPO",
    plan: "Enterprise",
    url: "/dashboard",
  }

  if (!data) return <div className="p-4">Loading sidebar...</div>

  // ✅ Transform string icon names to actual components
  const transformedData = {
    ...data,
    navMain: data.navMain.map(item => ({
      ...item,
      icon: getIconComponent(item.icon)
    })),
    navSecondary: data.navSecondary.map(item => ({
      ...item,
      icon: getIconComponent(item.icon)
    })),
    projects: data.projects.map(project => ({
      ...project,
      icon: getIconComponent(project.icon)
    }))
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href={company.url}>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{company.name}</span>
                  <span className="truncate text-xs">{company.plan}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={transformedData.navMain} />
        <NavProjects projects={transformedData.projects} />
        <NavSecondary items={transformedData.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}