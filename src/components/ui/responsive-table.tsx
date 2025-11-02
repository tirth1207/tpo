"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

interface Column<T> {
  key: keyof T
  label: string
  render?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowSelect?: (selectedRows: T[]) => void
  onRowClick?: (row: T) => void
  selectable?: boolean
  className?: string
}

export function ResponsiveTable<T extends { id: string }>({
  data,
  columns,
  onRowSelect,
  onRowClick,
  selectable = false,
  className,
}: ResponsiveTableProps<T>) {
  const [selectedRows, setSelectedRows] = React.useState<T[]>([])
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T
    direction: 'asc' | 'desc'
  } | null>(null)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows([...data])
      onRowSelect?.(data)
    } else {
      setSelectedRows([])
      onRowSelect?.([])
    }
  }

  const handleSelectRow = (row: T, checked: boolean) => {
    let newSelectedRows: T[]
    if (checked) {
      newSelectedRows = [...selectedRows, row]
    } else {
      newSelectedRows = selectedRows.filter((r) => r.id !== row.id)
    }
    setSelectedRows(newSelectedRows)
    onRowSelect?.(newSelectedRows)
  }

  const handleSort = (key: keyof T) => {
    const column = columns.find((col) => col.key === key)
    if (!column?.sortable) return

    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { key, direction: 'asc' }
    })
  }

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [data, sortConfig])

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              {selectable && (
                <th className="text-left p-4">
                  <Checkbox
                    checked={selectedRows.length === data.length && data.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "text-left p-4 font-medium text-muted-foreground",
                    column.sortable && "cursor-pointer hover:text-foreground",
                    column.className
                  )}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="text-xs">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b hover:bg-muted/50",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <td className="p-4">
                    <Checkbox
                      checked={selectedRows.some((r) => r.id === row.id)}
                      onCheckedChange={(checked) => handleSelectRow(row, checked as boolean)}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={String(column.key)} className={cn("p-4", column.className)}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {sortedData.map((row) => (
          <div
            key={row.id}
            className={cn(
              "border rounded-lg p-4 space-y-3",
              onRowClick && "cursor-pointer hover:bg-muted/50"
            )}
            onClick={() => onRowClick?.(row)}
          >
            {selectable && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedRows.some((r) => r.id === row.id)}
                  onCheckedChange={(checked) => handleSelectRow(row, checked as boolean)}
                />
                <span className="text-sm font-medium">Select</span>
              </div>
            )}
            {columns.map((column) => (
              <div key={String(column.key)} className="flex justify-between items-start">
                <span className="text-sm font-medium text-muted-foreground">
                  {column.label}:
                </span>
                <span className="text-sm text-right flex-1 ml-2">
                  {column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key] || '')}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  )
}
