import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import type { LeadPriority, PriorityBucket } from '@/api/types'

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

const LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
  unclassified: 'Unclassified',
}

const FILTERABLE_PRIORITIES: LeadPriority[] = ['low', 'medium', 'high', 'urgent']

export function PriorityChart({ data }: { data: PriorityBucket[] }) {
  const navigate = useNavigate()
  const chartData = data.map((bucket) => ({
    ...bucket,
    label: LABELS[bucket.priority] ?? bucket.priority,
    filterable: FILTERABLE_PRIORITIES.includes(bucket.priority as LeadPriority),
  }))

  function handleBarActivate(entry: (typeof chartData)[number]) {
    if (!entry.filterable) return
    toast.success(`Showing ${entry.count} ${entry.label.toLowerCase()} lead${entry.count === 1 ? '' : 's'}`)
    navigate(`/leads?priority=${entry.priority}`)
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={208}>
        <BarChart data={chartData} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={28}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: 'var(--muted)' }}
            contentStyle={{
              background: 'var(--popover)',
              color: 'var(--popover-foreground)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={24}>
            <LabelList dataKey="count" position="top" style={{ fill: 'var(--foreground)', fontSize: 12 }} />
            {chartData.map((entry, index) => (
              <Cell
                key={entry.priority}
                fill={COLORS[index % COLORS.length]}
                cursor={entry.filterable ? 'pointer' : 'default'}
                tabIndex={entry.filterable ? 0 : undefined}
                role={entry.filterable ? 'button' : undefined}
                aria-label={entry.filterable ? `View ${entry.count} ${entry.label} leads` : undefined}
                onClick={() => handleBarActivate(entry)}
                onKeyDown={(event: React.KeyboardEvent) => {
                  if (event.key === 'Enter' || event.key === ' ') handleBarActivate(entry)
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div aria-label="Priority legend" className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {chartData.map((entry, index) => (
          <span key={entry.priority} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-sm"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            {entry.label}
          </span>
        ))}
      </div>
    </div>
  )
}
