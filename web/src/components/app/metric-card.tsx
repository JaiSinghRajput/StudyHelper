import type { ReactNode } from "react"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string
  value: string
  description: string
  icon: ReactNode
}) {
  return (
    <Card className="bg-background/70">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="rounded-full border border-border/60 bg-muted/50 p-2 text-foreground">{icon}</div>
        </div>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

export { MetricCard }
