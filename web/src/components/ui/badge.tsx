import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
  secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border-border bg-transparent text-foreground",
  success: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  warning: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300",
  danger: "border-transparent bg-destructive/15 text-destructive",
}

type BadgeVariant = keyof typeof badgeVariants

function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: BadgeVariant }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants }