import { createServerSupabaseClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*, sites(name)")
      .eq("id", user.id)
      .single()
    profile = data
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Account and application settings" />

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{profile?.full_name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{profile?.email || user?.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge variant="outline" className="mt-1 capitalize">
                {profile?.role?.replace("_", " ") || "-"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned Site</p>
              <p className="font-medium">{(profile?.sites as any)?.name || "All Sites"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Framework</span>
            <span className="text-sm">Next.js + Supabase</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Organization</span>
            <span className="text-sm">Blessing Homz Pvt Ltd (Fusion Limited)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
