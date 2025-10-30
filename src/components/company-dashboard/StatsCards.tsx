import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Users, FileText, TrendingUp } from "lucide-react";

export function StatsCards({ stats }: any) {
  const data = [
    { title: "Active Drives", value: stats.drives, icon: Calendar },
    { title: "Applications Received", value: stats.applications, icon: Users },
    { title: "Interviews Scheduled", value: stats.interviews, icon: FileText },
    { title: "Offers Extended", value: stats.offers, icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {data.map((s, i) => (
        <Card key={i}>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">{s.title}</CardTitle>
            <s.icon className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
