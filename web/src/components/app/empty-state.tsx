import type { ReactNode } from "react"

function EmptyState({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/70 bg-background/60 px-6 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export { EmptyState }
