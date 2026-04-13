import { ArrowRight, Moon, PanelRightClose, Sparkles, SunMedium, WandSparkles, Loader2 } from "lucide-react"
import { Navigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAppContext } from "@/context/app-context"
import { DEMO_CREDENTIALS, SUGGESTED_PROMPTS } from "@/lib/app-types"

function AuthPage() {
  const {
    authStatus,
    theme,
    setTheme,
    authMode,
    setAuthMode,
    authForm,
    setAuthForm,
    isAuthBusy,
    authError,
    submitAuth,
    fillDemoAccount,
  } = useAppContext()

  if (authStatus === "authenticated") {
    return <Navigate to="/app/overview" replace />
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await submitAuth()
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_24%),radial-gradient(circle_at_80%_15%,rgba(56,189,248,0.15),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,245,249,0.9))] px-4 py-6 text-foreground dark:bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_24%),radial-gradient(circle_at_80%_15%,rgba(56,189,248,0.15),transparent_26%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.92))] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-border/60 bg-background/80 p-6 shadow-[0_24px_100px_-50px_rgba(15,23,42,0.5)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(56,189,248,0.14),transparent_25%),radial-gradient(circle_at_85%_0%,rgba(245,158,11,0.14),transparent_20%)]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground text-background">
                  <Sparkles className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Study Material Maker</p>
                  <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Multi-page frontend with routing</h1>
                </div>
              </div>

              <Button type="button" variant="outline" size="sm" className="gap-2 rounded-full" onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}>
                {theme === "dark" ? <SunMedium className="size-4" /> : <Moon className="size-4" />}
                {theme === "dark" ? "Light" : "Dark"}
              </Button>
            </div>

            <div className="space-y-5">
              <Badge variant="secondary" className="gap-2 px-3 py-1.5 text-xs uppercase tracking-[0.2em]"><WandSparkles className="size-3.5" />Streaming backend</Badge>
              <h2 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl">Separate pages for each use case with responsive layout.</h2>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Use navigation after login to move across overview, generation, activity, and library routes.</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <Badge key={prompt} variant="outline" className="px-3 py-1.5 text-xs">{prompt}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-border/60 bg-background/92 shadow-[0_24px_100px_-54px_rgba(15,23,42,0.55)]">
          <CardHeader>
            <CardTitle>{authMode === "login" ? "Sign in" : "Create account"}</CardTitle>
            <CardDescription>Use demo users or create a fresh account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-muted/50 p-1">
              <Button type="button" variant={authMode === "login" ? "default" : "ghost"} className="rounded-xl" onClick={() => setAuthMode("login")}>Login</Button>
              <Button type="button" variant={authMode === "register" ? "default" : "ghost"} className="rounded-xl" onClick={() => setAuthMode("register")}>Register</Button>
            </div>

            <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
              {authMode === "register" && (
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">Username</label>
                  <Input id="username" value={authForm.username} onChange={(event) => setAuthForm((current) => ({ ...current, username: event.target.value }))} placeholder="Your display name" />
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input id="email" type="email" value={authForm.email} onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))} placeholder="name@example.com" />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input id="password" type="password" value={authForm.password} onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))} placeholder="••••••••" />
              </div>

              {authMode === "register" && (
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</label>
                  <Input id="confirmPassword" type="password" value={authForm.confirmPassword} onChange={(event) => setAuthForm((current) => ({ ...current, confirmPassword: event.target.value }))} placeholder="••••••••" />
                </div>
              )}

              {authError && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{authError}</div>}

              <Button type="submit" className="w-full gap-2 rounded-2xl" disabled={isAuthBusy}>
                {isAuthBusy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                {authMode === "login" ? "Sign in" : "Create account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <Separator />
            <div>
              <p className="text-sm font-medium">Demo accounts</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {DEMO_CREDENTIALS.map((account) => (
                <Button key={account.label} type="button" variant="outline" className="justify-start gap-2 rounded-2xl" onClick={() => fillDemoAccount(account.email, account.password)}>
                  <PanelRightClose className="size-4" />
                  {account.label}
                </Button>
              ))}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default AuthPage
