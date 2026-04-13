import { useEffect } from "react"
import { useParams } from "react-router-dom"

import { EmptyState } from "@/components/app/empty-state"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppContext } from "@/context/app-context"
import { readingTime } from "@/lib/formatters"

function MaterialPage() {
  const { materialId } = useParams()
  const { selectMaterial, selectedMaterial } = useAppContext()

  useEffect(() => {
    if (materialId) {
      void selectMaterial(materialId)
    }
  }, [materialId])

  if (!selectedMaterial) {
    return (
      <EmptyState
        title="Material not found"
        description="The requested item is missing or still loading."
        icon={<span className="text-lg font-semibold">?</span>}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{selectedMaterial.question}</CardTitle>
        <CardDescription>{selectedMaterial.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{selectedMaterial.id.slice(0, 8)}</Badge>
          <Badge variant="secondary">{readingTime(selectedMaterial.content)} min read</Badge>
        </div>
        <div className="max-h-[70vh] overflow-auto rounded-2xl border border-border/60 bg-background/75 p-4">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-foreground">{selectedMaterial.content}</pre>
        </div>
      </CardContent>
    </Card>
  )
}

export default MaterialPage
