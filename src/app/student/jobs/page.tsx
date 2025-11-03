"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, MapPin, Calendar, AlertCircle, Building2 } from "lucide-react";

export default function JobsBoard() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/students/jobs");
      const data = await res.json();
      setJobs(data.jobs || []);
      setAppliedJobIds(data.appliedJobIds || []);
    } catch {
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = async (job_id: string) => {
    const res = await fetch("/api/students/apply", {
      method: "POST",
      body: JSON.stringify({ job_id }),
    });

    const data = await res.json();
    if (res.ok) {
      setAppliedJobIds((prev) => [...prev, job_id]);
    } else {
      alert(data.error);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="grid gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-300 bg-red-50">
        <CardContent className="p-4 flex items-center gap-2 text-red-600">
          <AlertCircle /> {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Jobs ⎯ Opportunities Await</h1>

      <div className="grid gap-6">
        {jobs.map((job: any) => (
          <Card key={job.id} className="hover:shadow-md transition">
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" /> {job.title}
                </CardTitle>
                <Badge className="capitalize">{job.job_type}</Badge>
              </div>
              <CardDescription>{job.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{job.companies?.company_name}</p>

              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {job.location}
                </span>

                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {formatDate(job.application_deadline)}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  disabled={appliedJobIds.includes(job.id)}
                  onClick={() => handleApply(job.id)}
                >
                  {appliedJobIds.includes(job.id) ? "✅ Applied" : "Apply"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
