import { useLocation, useNavigate } from 'react-router-dom'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { LeadRead, LeadSortField, SortOrder } from '@/api/types'
import { PriorityBadge } from '@/components/PriorityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { LeadBackState } from '@/lib/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatBudget, formatDate } from '@/lib/format'

const SORTABLE: Record<string, LeadSortField> = {
  name: 'name',
  priority: 'priority',
  status: 'status',
  created_at: 'created_at',
}

export function LeadsTable({
  leads,
  sortBy,
  sortOrder,
  onSortChange,
  onDelete,
}: {
  leads: LeadRead[]
  sortBy: LeadSortField
  sortOrder: SortOrder
  onSortChange: (field: LeadSortField) => void
  onDelete: (lead: LeadRead) => void
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const backState: LeadBackState = {
    backTo: `${location.pathname}${location.search}`,
    backLabel: 'Back to leads',
  }

  const sorting: SortingState = [{ id: sortBy, desc: sortOrder === 'desc' }]

  const columns: ColumnDef<LeadRead>[] = [
    {
      accessorKey: 'name',
      header: 'Client',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{row.original.name}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'company',
      header: 'Company',
      cell: ({ row }) => (
        <span className="block max-w-40 truncate">{row.original.company ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="block max-w-40 truncate">{row.original.category ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) =>
        row.original.priority ? (
          <PriorityBadge priority={row.original.priority} />
        ) : (
          <Badge asChild variant="outline" className="cursor-pointer hover:bg-muted">
            <button
              type="button"
              aria-label="View unclassified leads"
              onClick={(event) => {
                event.stopPropagation()
                toast.info('Showing unclassified leads')
                navigate('/leads?priority=none')
              }}
            >
              Unclassified
            </button>
          </Badge>
        ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'budget',
      header: 'Budget',
      cell: ({ row }) => <span className="whitespace-nowrap">{formatBudget(row.original)}</span>,
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${row.original.name}`}
          onClick={(event) => {
            event.stopPropagation()
            onDelete(row.original)
          }}
        >
          <Trash2 className="size-4" aria-hidden />
        </Button>
      ),
    },
  ]

  const table = useReactTable({
    data: leads,
    columns,
    state: { sorting },
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortField = SORTABLE[header.column.id]
                const isSorted = sortField && sortField === sortBy
                return (
                  <TableHead key={header.id}>
                    {sortField ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                        onClick={() => onSortChange(sortField)}
                        aria-label={`Sort by ${String(header.column.columnDef.header)}`}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {isSorted ? (
                          sortOrder === 'desc' ? (
                            <ArrowDown className="size-3.5" aria-hidden />
                          ) : (
                            <ArrowUp className="size-3.5" aria-hidden />
                          )
                        ) : (
                          <ChevronsUpDown className="size-3.5 opacity-50" aria-hidden />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer"
              tabIndex={0}
              role="link"
              aria-label={`View ${row.original.name}`}
              onClick={() => navigate(`/leads/${row.original.id}`, { state: backState })}
              onKeyDown={(event) => {
                if (event.key === 'Enter') navigate(`/leads/${row.original.id}`, { state: backState })
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
