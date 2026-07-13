import { Sparkles } from 'lucide-react'
import type { LeadRead } from '@/api/types'
import { AnalysisStatusBadge } from '@/components/AnalysisStatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBudget } from '@/lib/format'

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  )
}

export function AnalysisCard({
  lead,
  onReanalyze,
  isAnalyzing,
}: {
  lead: LeadRead
  onReanalyze: () => void
  isAnalyzing: boolean
}) {
  const status = isAnalyzing ? 'pending' : lead.analysis_status

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" aria-hidden />
          AI analysis
        </CardTitle>
        <div className="flex items-center gap-2">
          <AnalysisStatusBadge status={status} />
          {status !== 'pending' && (
            <Button variant="outline" size="sm" onClick={onReanalyze} disabled={isAnalyzing}>
              {lead.analysis_status === 'completed' ? 'Re-analyze' : 'Analyze'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {status === 'not_requested' && (
          <p className="text-sm text-muted-foreground">
            This lead has not been analyzed yet. Run analysis to classify priority, budget and category.
          </p>
        )}

        {status === 'pending' && (
          <p className="text-sm text-muted-foreground">Analyzing this lead…</p>
        )}

        {status === 'failed' && (
          <p className="text-sm text-destructive">
            Analysis failed{lead.analysis_error ? `: ${lead.analysis_error}` : '.'} You can retry.
          </p>
        )}

        {status === 'completed' && (
          <div className="space-y-4">
            {lead.ai_summary && <p className="text-sm text-foreground">{lead.ai_summary}</p>}

            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {lead.category && <Detail label="Category" value={lead.category} />}
              <Detail label="Budget" value={formatBudget(lead)} />
              {lead.deadline_text && <Detail label="Deadline" value={lead.deadline_text} />}
              {lead.confidence != null && (
                <Detail label="Confidence" value={`${Math.round(lead.confidence * 100)}%`} />
              )}
            </dl>

            {lead.recommended_action && (
              <div>
                <p className="text-xs text-muted-foreground">Recommended action</p>
                <p className="text-sm text-foreground">{lead.recommended_action}</p>
              </div>
            )}

            {lead.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {lead.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {lead.analysis_reasons.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">Reasoning</p>
                <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                  {lead.analysis_reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
