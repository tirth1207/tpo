import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>Manage your company information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Company profile management functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
