import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

import {
  deleteStudyMaterial,
  getStudyMaterial,
  getStudyStats,
  listStudyMaterials,
  login,
  refreshSession,
  register,
  streamStudyMaterial,
  validateSession,
} from "@/lib/api"
import {
  AUTH_STORAGE_KEY,
  type AuthFormState,
  type AuthMode,
  type GenerationEvent,
  type GenerationFormState,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from "@/lib/app-types"
import { applyTheme, appendGeneratedText, extractGeneratedText, formatChunkDetail, formatChunkTitle, getInitialTheme } from "@/lib/formatters"
import type {
  AuthSession,
  AuthUser,
  StudyMaterial,
  StreamChunk,
  UserStudyStats,
} from "@/lib/types"

type AuthStatus = "loading" | "guest" | "authenticated"

type AppContextValue = {
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
  authStatus: AuthStatus
  authMode: AuthMode
  setAuthMode: React.Dispatch<React.SetStateAction<AuthMode>>
  authForm: AuthFormState
  setAuthForm: React.Dispatch<React.SetStateAction<AuthFormState>>
  session: AuthSession | null
  user: AuthUser | null
  isAuthBusy: boolean
  authError: string | null
  submitAuth: () => Promise<void>
  fillDemoAccount: (email: string, password: string) => void
  logout: () => void
  generationForm: GenerationFormState
  setGenerationForm: React.Dispatch<React.SetStateAction<GenerationFormState>>
  isGenerating: boolean
  generationProgress: number
  generationStatus: string
  streamEvents: GenerationEvent[]
  liveContent: string
  sessionGenerationCount: number
  materials: StudyMaterial[]
  selectedMaterialId: string | null
  selectedMaterial: StudyMaterial | null
  stats: UserStudyStats | null
  dashboardError: string | null
  generateMaterial: () => Promise<void>
  selectMaterial: (materialId: string) => Promise<void>
  deleteMaterial: (materialId: string) => Promise<void>
  refreshDashboard: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme(THEME_STORAGE_KEY))
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [authForm, setAuthForm] = useState<AuthFormState>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [generationForm, setGenerationForm] = useState<GenerationFormState>({
    question: "",
    includeResearch: true,
    includeDiagrams: true,
  })
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading")
  const [session, setSession] = useState<AuthSession | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isAuthBusy, setIsAuthBusy] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null)
  const [stats, setStats] = useState<UserStudyStats | null>(null)
  const [streamEvents, setStreamEvents] = useState<GenerationEvent[]>([])
  const [liveContent, setLiveContent] = useState("")
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState("Idle")
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessionGenerationCount, setSessionGenerationCount] = useState(0)

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)

    if (!stored) {
      setAuthStatus("guest")
      return
    }

    void bootstrapSession(stored)
  }, [])

  useEffect(() => {
    if (authStatus !== "authenticated" || !session) {
      return
    }

    void refreshDashboard()
  }, [authStatus, session])

  function persistSession(nextSession: AuthSession) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession))
  }

  function clearSessionStorage() {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  async function bootstrapSession(storedSession: string) {
    try {
      const parsed = JSON.parse(storedSession) as AuthSession
      const validatedUser = await validateSession(parsed.accessToken)
      const nextSession = { ...parsed, user: validatedUser }

      persistSession(nextSession)
      setSession(nextSession)
      setUser(validatedUser)
      setAuthStatus("authenticated")
    } catch {
      try {
        const parsed = JSON.parse(storedSession) as AuthSession
        if (!parsed.refreshToken) {
          throw new Error("Missing refresh token")
        }

        const refreshed = await refreshSession(parsed.refreshToken)
        persistSession(refreshed)
        setSession(refreshed)
        setUser(refreshed.user)
        setAuthStatus("authenticated")
      } catch {
        clearSessionStorage()
        setAuthStatus("guest")
        setSession(null)
        setUser(null)
      }
    }
  }

  async function refreshDashboard() {
    if (!session || !user) {
      return
    }

    try {
      setDashboardError(null)

      const [listResponse, statsResponse] = await Promise.all([
        listStudyMaterials(session.accessToken, 1, 12),
        user.role === "premium" || user.role === "admin"
          ? getStudyStats(session.accessToken).catch(() => null)
          : Promise.resolve(null),
      ])

      const listData = Array.isArray(listResponse.data) ? listResponse.data : []

      setMaterials(listData)
      setSelectedMaterialId((current) => current ?? listData[0]?.id ?? null)
      setSelectedMaterial((current) => current ?? listData[0] ?? null)
      setStats(statsResponse)
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Failed to load dashboard data")
    }
  }

  async function submitAuth() {
    setIsAuthBusy(true)
    setAuthError(null)

    try {
      if (authMode === "login") {
        const nextSession = await login({
          email: authForm.email.trim(),
          password: authForm.password,
        })

        persistSession(nextSession)
        setSession(nextSession)
        setUser(nextSession.user)
        setAuthStatus("authenticated")
        return
      }

      await register({
        username: authForm.username.trim(),
        email: authForm.email.trim(),
        password: authForm.password,
        confirmPassword: authForm.confirmPassword,
      })

      const nextSession = await login({
        email: authForm.email.trim(),
        password: authForm.password,
      })

      persistSession(nextSession)
      setSession(nextSession)
      setUser(nextSession.user)
      setAuthStatus("authenticated")
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed")
    } finally {
      setIsAuthBusy(false)
    }
  }

  async function generateMaterial() {
    if (!session) {
      return
    }

    const question = generationForm.question.trim()
    if (!question) {
      setDashboardError("Enter a question or topic to generate study material")
      return
    }

    setDashboardError(null)
    setIsGenerating(true)
    setGenerationProgress(8)
    setGenerationStatus("Preparing prompt")
    setLiveContent("")
    setStreamEvents([])

    try {
      const { finalMaterialId } = await streamStudyMaterial(
        session.accessToken,
        generationForm,
        (chunk) => updateGenerationFromChunk(chunk)
      )

      setGenerationStatus("Syncing library")
      const listResponse = await listStudyMaterials(session.accessToken, 1, 12)
      setMaterials(listResponse.data)

      if (finalMaterialId) {
        const material = await getStudyMaterial(session.accessToken, finalMaterialId)
        setSelectedMaterialId(material.id)
        setSelectedMaterial(material)
      } else {
        const latestMaterial = listResponse.data[0] ?? null
        setSelectedMaterialId(latestMaterial?.id ?? null)
        setSelectedMaterial(latestMaterial)
      }

      setGenerationProgress(100)
      setGenerationStatus("Complete")
      setSessionGenerationCount((value) => value + 1)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Streaming generation failed"
      setDashboardError(message)
      setGenerationStatus("Failed")
      setGenerationProgress(0)
      setStreamEvents((current) => [
        ...current,
        {
          type: "error",
          title: "Generation failed",
          detail: message,
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsGenerating(false)
      window.setTimeout(() => {
        setGenerationProgress((value) => (value === 100 ? 0 : value))
      }, 1400)
    }
  }

  async function selectMaterial(materialId: string) {
    if (!session) {
      return
    }

    setSelectedMaterialId(materialId)

    const cached = materials.find((item) => item.id === materialId)
    if (cached) {
      setSelectedMaterial(cached)
    }

    try {
      const material = await getStudyMaterial(session.accessToken, materialId)
      setSelectedMaterial(material)
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Failed to open material")
    }
  }

  async function deleteMaterial(materialId: string) {
    if (!session) {
      return
    }

    try {
      await deleteStudyMaterial(session.accessToken, materialId)
      const remaining = materials.filter((item) => item.id !== materialId)
      setMaterials(remaining)

      if (selectedMaterialId === materialId) {
        const nextMaterial = remaining[0] ?? null
        setSelectedMaterialId(nextMaterial?.id ?? null)
        setSelectedMaterial(nextMaterial)
      }
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Failed to delete material")
    }
  }

  function fillDemoAccount(email: string, password: string) {
    setAuthMode("login")
    setAuthForm((current) => ({
      ...current,
      email,
      password,
      confirmPassword: password,
    }))
  }

  function logout() {
    clearSessionStorage()
    setAuthStatus("guest")
    setSession(null)
    setUser(null)
    setMaterials([])
    setSelectedMaterial(null)
    setSelectedMaterialId(null)
    setStats(null)
    setStreamEvents([])
    setLiveContent("")
    setDashboardError(null)
    setGenerationStatus("Idle")
    setGenerationProgress(0)
    setSessionGenerationCount(0)
  }

  function updateGenerationFromChunk(chunk: StreamChunk) {
    const detail = formatChunkDetail(chunk)
    const title = formatChunkTitle(chunk)

    setStreamEvents((current) => [
      ...current,
      {
        type: chunk.type,
        title,
        detail,
        progress: chunk.progress,
        timestamp: chunk.timestamp,
      },
    ])

    if (chunk.type === "planning") {
      setGenerationStatus("Planning outline")
    }

    if (chunk.type === "researching") {
      setGenerationStatus("Researching sources")
    }

    if (chunk.type === "generating") {
      setGenerationStatus("Writing material")
    }

    if (typeof chunk.progress === "number") {
      setGenerationProgress((current) => Math.max(current, chunk.progress ?? 0))
    } else if (chunk.type === "planning") {
      setGenerationProgress(20)
    } else if (chunk.type === "researching") {
      setGenerationProgress(45)
    } else if (chunk.type === "generating") {
      setGenerationProgress((current) => Math.max(current, 70))
    }

    if (chunk.type === "generating") {
      const text = extractGeneratedText(chunk.data)
      if (text) {
        setLiveContent((current) => appendGeneratedText(current, text))
      }
    }

    if (chunk.type === "complete") {
      setGenerationStatus("Finalizing saved copy")
      setGenerationProgress(100)
    }

    if (chunk.type === "error") {
      setGenerationStatus("Failed")
      setGenerationProgress(0)
    }
  }

  const value = useMemo<AppContextValue>(
    () => ({
      theme,
      setTheme,
      authStatus,
      authMode,
      setAuthMode,
      authForm,
      setAuthForm,
      session,
      user,
      isAuthBusy,
      authError,
      submitAuth,
      fillDemoAccount,
      logout,
      generationForm,
      setGenerationForm,
      isGenerating,
      generationProgress,
      generationStatus,
      streamEvents,
      liveContent,
      sessionGenerationCount,
      materials,
      selectedMaterialId,
      selectedMaterial,
      stats,
      dashboardError,
      generateMaterial,
      selectMaterial,
      deleteMaterial,
      refreshDashboard,
    }),
    [
      theme,
      authStatus,
      authMode,
      authForm,
      session,
      user,
      isAuthBusy,
      authError,
      generationForm,
      isGenerating,
      generationProgress,
      generationStatus,
      streamEvents,
      liveContent,
      sessionGenerationCount,
      materials,
      selectedMaterialId,
      selectedMaterial,
      stats,
      dashboardError,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider")
  }

  return context
}
