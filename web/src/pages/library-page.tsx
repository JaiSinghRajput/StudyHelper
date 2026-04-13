import { ChevronRight, DatabaseZap, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { EmptyState } from "@/components/app/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAppContext } from "@/context/app-context"
import { formatDate, readingTime, shortenText } from "@/lib/formatters"

function LibraryPage() {
  const { materials, selectedMaterialId, selectedMaterial, selectMaterial, deleteMaterial } = useAppContext()
  const navigate = useNavigate()

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Recent library</CardTitle>
          <CardDescription>Open, inspect, or remove stored materials from the backend.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {materials.length === 0 ? (
              <EmptyState title="Library is empty" description="Generated materials will appear here once saved." icon={<DatabaseZap className="size-5" />} />
            ) : (
              materials.map((material) => {
                const isSelected = material.id === selectedMaterialId

                return (
                  <button
                    key={material.id}
                    type="button"
                    onClick={() => {
                      void selectMaterial(material.id)
                      navigate(`/app/library/${material.id}`)
                    }}
                    className={`group w-full rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-foreground bg-foreground/5"
                        : "border-border/60 bg-background/75 hover:border-foreground/30 hover:bg-background"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={isSelected ? "default" : "outline"}>Saved</Badge>
                          <span className="text-sm font-medium text-foreground">{shortenText(material.question, 58)}</span>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">{shortenText(material.summary, 120)}</p>
                      </div>
                      <ChevronRight className="mt-1 size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(material.createdAt)}</span>
                      <span>•</span>
                      <span>{readingTime(material.content)} min read</span>
                      <span>•</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="h-7 gap-1 rounded-full px-2.5 text-xs"
                        onClick={(event) => {
                          event.stopPropagation()
                          void deleteMaterial(material.id)
                        }}
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </Button>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selected material</CardTitle>
          <CardDescription>Focused reading view for current selection.</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedMaterial ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{selectedMaterial.id.slice(0, 8)}</Badge>
                <Badge variant="secondary">{readingTime(selectedMaterial.content)} min read</Badge>
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold tracking-tight">{selectedMaterial.question}</h2>
                <p className="text-sm leading-6 text-muted-foreground">{selectedMaterial.summary}</p>
              </div>
              <Separator />
              <div className="max-h-96 overflow-auto rounded-2xl border border-border/60 bg-background/75 p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-foreground">{selectedMaterial.content}</pre>
              </div>
            </div>
          ) : (
            <EmptyState title="Nothing selected" description="Click a saved item or open /app/library/:id." icon={<DatabaseZap className="size-5" />} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default LibraryPage
