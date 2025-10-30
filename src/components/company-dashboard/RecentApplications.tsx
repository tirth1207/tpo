import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function RecentApplications({ recentApplications }: any) {
  const handleDownloadResume = (student: any) => {
    alert(`Downloading resume for ${student}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Applications</CardTitle>
        <CardDescription>Latest student applications</CardDescription>
      </CardHeader>
      <CardContent>
        {recentApplications.length === 0 ? (
          <p className="text-gray-500">No recent applications yet.</p>
        ) : (
          <div className="space-y-4">
            {recentApplications.map((app: any) => (
              <div key={app.id} className="flex justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{app.student}</h3>
                  <p className="text-sm text-gray-600">{app.position} • CGPA: {app.cgpa}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      app.status === "offer_extended"
                        ? "default"
                        : app.status === "shortlisted"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {app.status}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadResume(app.student)}>
                    <Download className="h-4 w-4 mr-2" /> Resume
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
