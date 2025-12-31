"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase/supabaseClient";
import { useAuth } from "@/lib/supabase/useSupabaseAuth";

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
}

export default function FacultyRangesPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [ranges, setRanges] = useState<FacultyRange[]>([]);
  const [facultyId, setFacultyId] = useState("");
  const [startRoll, setStartRoll] = useState("");
  const [endRoll, setEndRoll] = useState("");
  const [dataLoading, setDataLoading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const { user, loading: authLoading, refreshUser } = useAuth();

  // Use auth context instead of calling getUser directly to avoid a race
  // where the auth provider hasn't initialized yet and getUser returns null.
  useEffect(() => {
    if (user) {
      console.log("Current user:", user);
      setProfileId(user.id);
      return;
    }

    // If there's no user but the provider finished loading, try a refresh once
    if (!authLoading) {
      refreshUser().catch((err) => console.error("Failed to refresh user", err));
    }
  }, [user, authLoading, refreshUser]);

  // Fetch data from API
  const fetchData = async () => {
    setDataLoading(true);
    try {
      const res = await fetch("/api/manager/faculty-table");
      const data = await res.json();
      if (res.ok) {
        setFaculties(data.faculties || []);
        setRanges(data.ranges || []);
      } else {
        alert(data.error || "Failed to fetch data");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add new range
  const addRange = async () => {
    if (!facultyId || !startRoll || !endRoll || !profileId) return alert("All fields required!");
    try {
      const res = await fetch("/api/manager/faculty-table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faculty_id: facultyId, start_roll_number: startRoll, end_roll_number: endRoll , updated_by: profileId }),
      });
      const data = await res.json();
      console.log(data);
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
      const res = await fetch(`/api/manager/faculty-table?id=${id}`, { method: "DELETE" });
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
      {dataLoading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Faculty</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Start Roll</TableHead>
              <TableHead>End Roll</TableHead>
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
                  <Button variant="destructive" size="sm" onClick={() => deleteRange(r.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
