import * as React from "react"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value = 0,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value?: number }) {
  const safeValue = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted/70", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-linear-to-r from-foreground via-foreground/80 to-foreground transition-all"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  )
}

export { Progress }