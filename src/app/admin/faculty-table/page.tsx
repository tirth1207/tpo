"use client";

import { useEffect, useState } from "react";
import HistorySection from "@/components/admin/HistorySection"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Faculty {
  id: string;
  profiles?: { full_name: string };
  department: string;
}

interface FacultyRange {
  id: string;
  faculty_id: string;
  start_roll_number: string;
  end_roll_number: string;
  faculty?: Faculty;
  profiles: { full_name: string; email: string };
}

export default function FacultyRangesPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [ranges, setRanges] = useState<FacultyRange[]>([]);
  const [facultyId, setFacultyId] = useState("");
  const [startRoll, setStartRoll] = useState("");
  const [endRoll, setEndRoll] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faculty-table");
      const data = await res.json();
      if (res.ok) {
        setFaculties(data.faculties || []);
        setRanges(data.ranges || []);
        console.log(data);

      } else {
        alert(data.error || "Failed to fetch data");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add new range
  const addRange = async () => {
    if (!facultyId || !startRoll || !endRoll) return alert("All fields required!");
    try {
      const res = await fetch("/api/admin/faculty-table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faculty_id: facultyId, start_roll_number: startRoll, end_roll_number: endRoll }),
      });
      const data = await res.json();
      if (res.ok) {
        setStartRoll("");
        setEndRoll("");
        fetchData();
      } else {
        alert(data.error || "Failed to add range");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // Delete range
  const deleteRange = async (id: string) => {
    if (!confirm("Are you sure you want to delete this range?")) return;
    try {
      const res = await fetch(`/api/admin/faculty-table?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        fetchData();
      } else {
        alert(data.error || "Failed to delete range");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Faculty-Student Ranges</h1>

      {/* Add new range */}
      <div className="flex gap-2 mb-6">
        <Select onValueChange={setFacultyId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select Faculty" />
          </SelectTrigger>
          <SelectContent>
            {faculties.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.profiles?.full_name} - {f.department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Start Roll Number"
          value={startRoll}
          onChange={(e) => setStartRoll(e.target.value)}
        />
        <Input
          placeholder="End Roll Number"
          value={endRoll}
          onChange={(e) => setEndRoll(e.target.value)}
        />
        <Button onClick={addRange}>Add Range</Button>
      </div>

      {/* Existing ranges */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Faculty</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Start Roll</TableHead>
              <TableHead>End Roll</TableHead>
              <TableHead>Updated By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranges.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.faculty?.profiles?.full_name}</TableCell>
                <TableCell>{r.faculty?.department}</TableCell>
                <TableCell>{r.start_roll_number}</TableCell>
                <TableCell>{r.end_roll_number}</TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger>
                      {r.profiles?.full_name}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{r.profiles?.email}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Button variant="destructive" size="sm" onClick={() => deleteRange(r.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <HistorySection target_table="faculty_student_ranges" title="Faculty Ranges History" />
    </div>
  );
}
