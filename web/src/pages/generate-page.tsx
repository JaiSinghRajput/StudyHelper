import { ArrowRight, Loader2, Plus, Search } from "lucide-react"

import { OptionRow } from "@/components/app/option-row"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useAppContext } from "@/context/app-context"
import { SUGGESTED_PROMPTS } from "@/lib/app-types"

function GeneratePage() {
  const {
    generationForm,
    setGenerationForm,
    isGenerating,
    generateMaterial,
  } = useAppContext()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await generateMaterial()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate study material</CardTitle>
        <CardDescription>Dedicated route for prompt authoring and stream launch.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={(event) => void onSubmit(event)}>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-foreground" htmlFor="question">Question or topic</label>
              <span className="text-xs text-muted-foreground">{generationForm.question.length}/500</span>
            </div>
            <Textarea
              id="question"
              value={generationForm.question}
              onChange={(event) => setGenerationForm((current) => ({ ...current, question: event.target.value.slice(0, 500) }))}
              placeholder="Explain how photosynthesis works and include a visual diagram"
              className="min-h-40"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <OptionRow
              title="Include research"
              description="Fetch supporting material before writing the final answer."
              checked={Boolean(generationForm.includeResearch)}
              onCheckedChange={(checked) => setGenerationForm((current) => ({ ...current, includeResearch: checked }))}
            />
            <OptionRow
              title="Include diagrams"
              description="Let the engine add diagram-friendly structure when available."
              checked={Boolean(generationForm.includeDiagrams)}
              onCheckedChange={(checked) => setGenerationForm((current) => ({ ...current, includeDiagrams: checked }))}
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Quick prompts</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <Button key={prompt} type="button" variant="outline" size="sm" className="gap-2 rounded-full" onClick={() => setGenerationForm((current) => ({ ...current, question: prompt }))}>
                  <Plus className="size-3.5" />
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="outline" className="gap-1.5"><Search className="size-3.5" />Streaming endpoint</Badge>
              <span>Chunks update other routes in real time.</span>
            </div>
            <Button type="submit" className="gap-2 rounded-2xl px-5" disabled={isGenerating}>
              {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              {isGenerating ? "Generating" : "Generate material"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default GeneratePage
