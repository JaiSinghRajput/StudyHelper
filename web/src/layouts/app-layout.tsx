import { DatabaseZap, LogOut, Moon, Sparkles, SunMedium } from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/context/app-context"

const navItems = [
  { to: "/app/overview", label: "Overview" },
  { to: "/app/generate", label: "Generate" },
  { to: "/app/activity", label: "Activity" },
  { to: "/app/library", label: "Library" },
]

function AppLayout() {
  const {
    theme,
    setTheme,
    logout,
    materials,
    sessionGenerationCount,
    user,
  } = useAppContext()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_26%),radial-gradient(circle_at_90%_10%,rgba(56,189,248,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0.4))] text-foreground dark:bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_26%),radial-gradient(circle_at_90%_10%,rgba(56,189,248,0.14),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.9))]">
      <div className="mx-auto flex min-h-screen w-full max-w-400 flex-col gap-5 px-3 py-3 sm:px-5 lg:px-8">
        <header className="rounded-[1.8rem] border border-border/60 bg-background/75 px-4 py-4 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-foreground text-background">
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Study Material Maker</p>
                <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">Routed workspace</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-xs">
                <DatabaseZap className="size-3.5" />
                {materials.length} saved
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5 text-xs">{sessionGenerationCount} streamed</Badge>
              {user && <Badge variant="outline" className="px-3 py-1.5 text-xs">{user.role}</Badge>}
              <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}>
                {theme === "dark" ? <SunMedium className="size-4" /> : <Moon className="size-4" />}
              </Button>
              <Button type="button" variant="ghost" size="sm" className="gap-2 rounded-full" onClick={logout}>
                <LogOut className="size-4" />
                Logout
              </Button>
            </div>
          </div>

          <nav className="mt-4 overflow-auto">
            <div className="flex min-w-max gap-2 rounded-2xl bg-muted/40 p-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-2 text-sm font-medium transition ${isActive ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
