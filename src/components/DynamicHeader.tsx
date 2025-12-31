"use client"

import { usePathname } from "next/navigation"

export default function DynamicHeader(pathName: string) {
  const pathname = usePathname()

  const pageTitle =
    pathname === "/admin" || pathName ? "Dashboard"
    : pathname.includes("analytics") ? "Analytics"
    : pathname.includes("drives") ? "Drives"
    : pathname.includes("reports") ? "Reports"
    : pathname.includes("settings") ? "Settings"
    : pathname.includes("company-approvals") ? "Company Approvals"
    : pathname.includes("faculty-approvals") ? "Faculty Approvals"
    : "Admin"

  return (
    <h1 className="text-lg font-semibold tracking-tight text-foreground">
      {pageTitle}
    </h1>
  )
}
