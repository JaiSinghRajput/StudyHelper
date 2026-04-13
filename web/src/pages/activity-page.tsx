import { Copy, FileText, Menu } from "lucide-react"

import { EmptyState } from "@/components/app/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useAppContext } from "@/context/app-context"
import { badgeVariantForEvent, formatDate, formatTime } from "@/lib/formatters"

function ActivityPage() {
  const { streamEvents, liveContent, selectedMaterial } = useAppContext()

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Streaming activity</CardTitle>
          <CardDescription>Every backend chunk appears in this page.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-136 space-y-3 overflow-auto pr-1">
            {streamEvents.length === 0 ? (
              <EmptyState title="No stream yet" description="Generate material and return here for chunk-by-chunk events." icon={<Menu className="size-5" />} />
            ) : (
              streamEvents.map((event, index) => (
                <div key={`${event.timestamp}-${index}`} className="rounded-2xl border border-border/60 bg-background/80 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={badgeVariantForEvent(event.type)} className="capitalize">{event.type}</Badge>
                        <span className="text-sm font-medium">{event.title}</span>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">{event.detail}</p>
                    </div>
                    <span className="whitespace-nowrap text-xs text-muted-foreground">{formatTime(event.timestamp)}</span>
                  </div>
                  {typeof event.progress === "number" && (
                    <div className="mt-3 space-y-2">
                      <Progress value={event.progress} />
                      <div className="text-xs text-muted-foreground">{event.progress}% reported by the stream</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Live content</CardTitle>
            <CardDescription>Token output and latest saved material preview.</CardDescription>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" className="rounded-full" onClick={() => navigator.clipboard.writeText(liveContent || selectedMaterial?.content || "")}>
            <Copy className="size-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="max-h-136 overflow-auto rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
            {liveContent ? (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-foreground">{liveContent}</pre>
            ) : selectedMaterial ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedMaterial.question}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Saved at {formatDate(selectedMaterial.createdAt)}</p>
                </div>
                <Separator />
                <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-foreground">{selectedMaterial.content}</pre>
              </div>
            ) : (
              <EmptyState title="Nothing to preview" description="Start generation to see live content." icon={<FileText className="size-5" />} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ActivityPage
