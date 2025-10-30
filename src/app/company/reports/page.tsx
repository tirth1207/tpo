import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>Generate and view recruitment reports</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Reports functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
