import { Brain, DatabaseZap, FileText, Rocket, WandSparkles } from "lucide-react"
import { Link } from "react-router-dom"

import { MetricCard } from "@/components/app/metric-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAppContext } from "@/context/app-context"

function OverviewPage() {
  const {
    user,
    materials,
    sessionGenerationCount,
    generationStatus,
    generationProgress,
    dashboardError,
    isGenerating,
    stats,
  } = useAppContext()

  if (!user) {
    return null
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Workspace status</CardTitle>
            <CardDescription>Use routed pages to generate, monitor, and browse materials.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{user.role}</Badge>
            {stats && <Badge variant="secondary">Avg {stats.averageLength}</Badge>}
            <Badge variant={isGenerating ? "warning" : "success"}>{generationStatus}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard title="Materials" value={materials.length.toString()} description="Saved in backend" icon={<FileText className="size-4" />} />
          <MetricCard title="Session streams" value={sessionGenerationCount.toString()} description="Generated while active" icon={<Rocket className="size-4" />} />
          <MetricCard title="Current role" value={user.role} description={user.email} icon={<Brain className="size-4" />} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
          <CardDescription>Current stream status and quick links.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={generationProgress} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{generationStatus}</span>
            <span>{generationProgress}%</span>
          </div>
          {dashboardError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{dashboardError}</div>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
              Open Generate page to start a new stream.
            </div>
          )}
          <div className="grid gap-2">
            <Link
              to="/app/generate"
              className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <WandSparkles className="size-4" />
              Generate
            </Link>
            <Link
              to="/app/library"
              className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <DatabaseZap className="size-4" />
              Library
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OverviewPage
