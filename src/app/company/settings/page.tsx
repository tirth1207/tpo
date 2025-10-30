import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Configure your account settings</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Settings functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
