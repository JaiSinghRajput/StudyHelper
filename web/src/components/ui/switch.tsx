import * as React from "react"

import { cn } from "@/lib/utils"

type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  onCheckedChange?: (checked: boolean) => void
}

function Switch({ className, onCheckedChange, checked, defaultChecked, ...props }: SwitchProps) {
  return (
    <label className={cn("relative inline-flex h-7 w-12 items-center", className)}>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        {...props}
      />
      <span className="absolute inset-0 rounded-full border border-border/70 bg-muted/80 transition peer-checked:border-foreground/60 peer-checked:bg-foreground" />
      <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-background shadow-sm transition-transform peer-checked:translate-x-5" />
    </label>
  )
}

export { Switch }