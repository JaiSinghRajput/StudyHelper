import { Loader2, Moon, SunMedium } from "lucide-react"

import { useAppContext } from "@/context/app-context"

function LoadingPage() {
  const { theme } = useAppContext()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-[2rem] border border-border/60 bg-card/80 p-8 text-center shadow-[0_24px_100px_-54px_rgba(15,23,42,0.45)] backdrop-blur-xl">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-foreground text-background">
          {theme === "dark" ? <Moon className="size-6" /> : <SunMedium className="size-6" />}
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Restoring your session</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Checking tokens and loading your study workspace.
          </p>
        </div>
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    </div>
  )
}

export default LoadingPage
