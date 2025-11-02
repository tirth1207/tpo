"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  User,
  FileText,
  Award,
  Bell,
  LogOut,
  GraduationCap,
  Menu,
} from "lucide-react";
import Link from "next/link";

interface SidebarProps {
  activeSection: string;
}

export function Sidebar({ activeSection }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      link: "/student/dashboard",
    },
    {
      id: "profile",
      label: "My Profile",
      icon: User,
      link: "/student/profile",
    },
    {
      id: "applications",
      label: "Applications",
      icon: FileText,
      link: "/student/applications",
    },
    {
      id: "offers",
      label: "Offer Letters",
      icon: Award,
      link: "/student/offers",
    },
    // {
    //   id: "notifications",
    //   label: "Notifications",
    //   icon: Bell,
    //   link: "student/dashboard/notifications",
    // },
    // {
    //   id: "logout",
    //   label: "Logout",
    //   icon: LogOut,
    //   link: "",
    // },
  ];

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
        })
        if (response.ok) {
          alert("Logged out successfully!");
          window.location.href = "/";
        } else {
          alert("Logout failed!");
        }
      } catch (error) {
        console.error("Logout error:", error);
        alert("Logout failed!");
      }
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 flex-1">
        <div className="flex items-center gap-2 mb-8">
          <GraduationCap className="h-8 w-8 text-primary" />
          <div>
            <h2 className="font-bold text-sidebar-foreground">TPO Portal</h2>
            <p className="text-xs text-muted-foreground">Student Panel</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} href={item.link}>
                <Button
                  variant={activeSection === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    activeSection === item.id
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-sidebar-border bg-sidebar">
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">Student User</p>
          <p className="text-xs text-muted-foreground">CS2021003</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-sidebar border-r border-sidebar-border flex flex-col min-h-screen">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="bg-sidebar h-full">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
