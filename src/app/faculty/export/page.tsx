"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, Users, FileSpreadsheet, Database } from "lucide-react"

export default function ExportData() {
  const [selectedData, setSelectedData] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState("csv")

  const dataOptions = [
    { id: "student_profiles", label: "Student Profiles", description: "Complete student information", icon: Users },
    { id: "applications", label: "Job Applications", description: "All student applications", icon: FileText },
    { id: "placement_stats", label: "Placement Statistics", description: "Department placement data", icon: Database },
    { id: "company_data", label: "Company Information", description: "Visiting companies data", icon: FileSpreadsheet },
  ]

  const handleDataToggle = (dataId: string) => {
    setSelectedData((prev) =>
      prev.includes(dataId) ? prev.filter((id) => id !== dataId) : [...prev, dataId]
    )
  }

  const handleExport = () => {
    if (selectedData.length === 0) {
      alert("Please select at least one data type to export")
      return
    }

    // Simulate export process
    console.log(`Exporting ${selectedData.join(", ")} in ${exportFormat} format`)
    alert(`Export initiated for: ${selectedData.join(", ")}\nFormat: ${exportFormat.toUpperCase()}\n\nDownload will start shortly...`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Export Data</h1>
          <p className="text-muted-foreground mt-1">Export department data for analysis and reporting</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Data to Export</CardTitle>
            <CardDescription>Choose which data you want to include in the export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dataOptions.map((option) => {
              const Icon = option.icon
              return (
                <div key={option.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={option.id}
                    checked={selectedData.includes(option.id)}
                    onCheckedChange={() => handleDataToggle(option.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={option.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </label>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Export Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Export Settings</CardTitle>
            <CardDescription>Configure your export preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range (Optional)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                  placeholder="From"
                />
                <input
                  type="date"
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                  placeholder="To"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleExport} className="w-full" disabled={selectedData.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export Selected Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
          <CardDescription>Your recent data export history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: 1,
                name: "Student Profiles - Jan 2024",
                format: "CSV",
                date: "2024-01-15",
                size: "2.3 MB",
                status: "Completed",
              },
              {
                id: 2,
                name: "Placement Statistics - Q4 2023",
                format: "XLSX",
                date: "2024-01-10",
                size: "1.8 MB",
                status: "Completed",
              },
              {
                id: 3,
                name: "Applications Report",
                format: "PDF",
                date: "2024-01-08",
                size: "5.2 MB",
                status: "Processing",
              },
            ].map((export_) => (
              <div key={export_.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{export_.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {export_.format} • {export_.size} • {export_.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      export_.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {export_.status}
                  </span>
                  {export_.status === "Completed" && (
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
