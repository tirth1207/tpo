"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Users, FileSpreadsheet, Database } from "lucide-react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

export default function ExportData() {
  const [selectedData, setSelectedData] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState("csv");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const dataOptions = [
    { id: "student_profiles", label: "Student Profiles", description: "Complete student information", icon: Users },
    { id: "applications", label: "Job Applications", description: "All student applications", icon: FileText },
    { id: "placement_stats", label: "Placement Statistics", description: "Department placement data", icon: Database },
    { id: "company_data", label: "Company Information", description: "Visiting companies data", icon: FileSpreadsheet },
  ];

  const handleDataToggle = (dataId: string) => {
    setSelectedData((prev) =>
      prev.includes(dataId) ? prev.filter((id) => id !== dataId) : [...prev, dataId]
    );
  };

  const handleExport = async () => {
    if (selectedData.length === 0) {
      alert("Please select at least one data type to export");
      return;
    }

    try {
      const res = await fetch("/api/faculty/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataTypes: selectedData, fromDate, toDate }),
      });
      const { result, error } = await res.json();
      if (error) throw new Error(error);

      for (const type of selectedData) {
        const data = result[type];
        if (!data) continue;

        if (exportFormat === "csv") {
          const csv = convertToCSV(data);
          saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${type}.csv`);
        }

        if (exportFormat === "xlsx") {
          const ws = XLSX.utils.json_to_sheet(data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, type);
          XLSX.writeFile(wb, `${type}.xlsx`);
        }

        if (exportFormat === "json") {
          saveAs(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `${type}.json`);
        }

        if (exportFormat === "pdf") {
          const doc = new jsPDF();
          doc.text(type, 10, 10);
          doc.text(JSON.stringify(data, null, 2).slice(0, 2000), 10, 20); // basic demo
          doc.save(`${type}.pdf`);
        }
      }

      alert(`Export completed: ${selectedData.join(", ")} in ${exportFormat.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      alert("Export failed: " + err.message);
    }
  };

  const convertToCSV = (objArray: any[]) => {
    const array = typeof objArray !== "object" ? JSON.parse(objArray) : objArray;
    const headers = Object.keys(array[0] || {});
    const rows = array.map((row) =>
      headers.map((fieldName) => JSON.stringify(row[fieldName] ?? "")).join(",")
    );
    return [headers.join(","), ...rows].join("\r\n");
  };

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
              const Icon = option.icon;
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
              );
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
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range (Optional)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
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
    </div>
  );
}
