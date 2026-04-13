import type { ReactNode } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { AppProvider, useAppContext } from "@/context/app-context"
import AppLayout from "@/layouts/app-layout"
import ActivityPage from "@/pages/activity-page"
import AuthPage from "@/pages/auth-page"
import GeneratePage from "@/pages/generate-page"
import LibraryPage from "@/pages/library-page"
import LoadingPage from "@/pages/loading-page"
import MaterialPage from "@/pages/material-page"
import OverviewPage from "@/pages/overview-page"

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { authStatus } = useAppContext()

  if (authStatus === "loading") {
    return <LoadingPage />
  }

  if (authStatus !== "authenticated") {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { authStatus } = useAppContext()

  if (authStatus === "loading") {
    return <LoadingPage />
  }

  if (authStatus === "authenticated") {
    return <Navigate to="/app/overview" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="generate" element={<GeneratePage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="library/:materialId" element={<MaterialPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/app/overview" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}

export default App
