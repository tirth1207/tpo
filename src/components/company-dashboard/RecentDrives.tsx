import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function RecentDrives({ recentDrives }: any) {
  return (
    <Card className="mb-6">
      <CardHeader className="flex justify-between items-center">
        <div>
          <CardTitle>Recent Drives</CardTitle>
          <CardDescription>Your latest recruitment drives</CardDescription>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="h-4 w-4 mr-2" /> Create Drive
        </Button>
      </CardHeader>
      <CardContent>
        {recentDrives.length === 0 ? (
          <p className="text-gray-500">No recent drives found.</p>
        ) : (
          <div className="space-y-4">
            {recentDrives.map((drive: any) => (
              <div key={drive.id} className="flex justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{drive.title}</h3>
                  <p className="text-sm text-gray-600">
                    {drive.applications} applications • Deadline: {drive.deadline}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={drive.status === "Active" ? "default" : "secondary"}>{drive.status}</Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" /> View
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
