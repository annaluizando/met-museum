'use client'

import { useCallback, useEffect, useState } from 'react'
import { X, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useSearchStore } from '@/lib/stores/search-store'
import { useDepartments } from '@/lib/hooks/useDepartments'
import type { SearchFilters } from '@/lib/types/artwork'
import { searchFiltersSchema } from '@/lib/validations/search'
import { sanitizeString, sanitizeNumber } from '@/lib/utils/sanitize'

interface SearchFiltersProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Advanced search filters panel
 * Provides comprehensive filtering options for artwork search
 */
export function SearchFiltersPanel({ isOpen, onClose }: SearchFiltersProps) {
  const { filters, setFilters, resetFilters } = useSearchStore()
  const { data: departmentsData, isLoading: departmentsLoading } = useDepartments()
  
  // Local state for form inputs
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)

  // Sync local filters with store when filters change externally
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleApplyFilters = useCallback(() => {
    // Validate all filters before applying
    const result = searchFiltersSchema.safeParse(localFilters)
    
    if (result.success) {
      setFilters(result.data)
      onClose()
    } else {
      // If validation fails, still apply but with sanitized values
      // This prevents blocking the user while ensuring security
      const sanitizedFilters: SearchFilters = {
        ...localFilters,
        medium: localFilters.medium ? sanitizeString(localFilters.medium).substring(0, 200) : undefined,
        geoLocation: localFilters.geoLocation ? sanitizeString(localFilters.geoLocation).substring(0, 200) : undefined,
        dateBegin: localFilters.dateBegin !== undefined ? sanitizeNumber(localFilters.dateBegin, -5000, new Date().getFullYear()) ?? undefined : undefined,
        dateEnd: localFilters.dateEnd !== undefined ? sanitizeNumber(localFilters.dateEnd, -5000, new Date().getFullYear()) ?? undefined : undefined,
        departmentId: localFilters.departmentId !== undefined ? sanitizeNumber(localFilters.departmentId, 1) ?? undefined : undefined,
      }
      
      // Ensure dateBegin <= dateEnd
      if (sanitizedFilters.dateBegin !== undefined && sanitizedFilters.dateEnd !== undefined) {
        if (sanitizedFilters.dateBegin > sanitizedFilters.dateEnd) {
          sanitizedFilters.dateBegin = sanitizedFilters.dateEnd
        }
      }
      
      setFilters(sanitizedFilters)
      onClose()
    }
  }, [localFilters, setFilters, onClose])

  const handleResetFilters = useCallback(() => {
    const defaultFilters: SearchFilters = {}
    setLocalFilters(defaultFilters)
    resetFilters()
  }, [resetFilters])

  const updateFilter = useCallback(<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setLocalFilters(prev => {
      let sanitizedValue: SearchFilters[K] = value
      
      // Sanitize based on field type
      if (key === 'medium' || key === 'geoLocation') {
        if (typeof value === 'string') {
          sanitizedValue = sanitizeString(value).substring(0, 200) as SearchFilters[K]
        }
      } else if (key === 'dateBegin' || key === 'dateEnd') {
        if (typeof value === 'number') {
          const sanitized = sanitizeNumber(value, -5000, new Date().getFullYear())
          sanitizedValue = (sanitized ?? undefined) as SearchFilters[K]
        } else if (typeof value === 'string' && value !== '') {
          const num = sanitizeNumber(Number(value), -5000, new Date().getFullYear())
          sanitizedValue = (num ?? undefined) as SearchFilters[K]
        }
      } else if (key === 'departmentId') {
        if (typeof value === 'number') {
          const sanitized = sanitizeNumber(value, 1)
          sanitizedValue = (sanitized ?? undefined) as SearchFilters[K]
        } else if (typeof value === 'string' && value !== '') {
          const num = sanitizeNumber(Number(value), 1)
          sanitizedValue = (num ?? undefined) as SearchFilters[K]
        }
      }
      
      return {
        ...prev,
        [key]: sanitizedValue === '' || sanitizedValue === undefined ? undefined : sanitizedValue
      }
    })
  }, [])

  const setDateRange = useCallback((begin: number, end: number) => {
    const sanitizedBegin = sanitizeNumber(begin, -5000, new Date().getFullYear())
    const sanitizedEnd = sanitizeNumber(end, -5000, new Date().getFullYear())
    
    if (sanitizedBegin !== null && sanitizedEnd !== null) {
      // Ensure begin <= end
      const finalBegin = Math.min(sanitizedBegin, sanitizedEnd)
      const finalEnd = Math.max(sanitizedBegin, sanitizedEnd)
      
      setLocalFilters(prev => ({
        ...prev,
        dateBegin: finalBegin,
        dateEnd: finalEnd
      }))
    }
  }, [])

  const departmentOptions = departmentsData?.departments.map(dept => ({
    value: dept.departmentId.toString(),
    label: dept.displayName
  })) || []

  return (
    <div 
      className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${isOpen ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}
      `}
    >
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 shadow-sm">
        {/* Header */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Advanced Filters</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close filters"
            className="h-7 w-7"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 space-y-5 max-h-[500px] overflow-y-auto">
          {/* Filter Grid - 2 columns on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department Filter */}
            <div className="space-y-1.5">
              <Label htmlFor="department-filter" className="text-xs font-medium">Department</Label>
              <Select
                id="department-filter"
                placeholder="All Departments"
                options={departmentOptions}
                value={localFilters.departmentId?.toString() || ''}
                onChange={(e) => updateFilter('departmentId', e.target.value ? Number(e.target.value) : undefined)}
                disabled={departmentsLoading}
              />
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Filter by museum department</p>
            </div>

            {/* Medium Filter */}
            <div className="space-y-1.5">
              <Label htmlFor="medium-filter" className="text-xs font-medium">Medium</Label>
              <Input
                id="medium-filter"
                type="text"
                placeholder="e.g., Oil on canvas"
                value={localFilters.medium || ''}
                onChange={(e) => updateFilter('medium', e.target.value)}
                maxLength={200}
              />
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Artwork material or technique</p>
            </div>

            {/* Geographic Location Filter */}
            <div className="space-y-1.5">
              <Label htmlFor="location-filter" className="text-xs font-medium">Geographic Location</Label>
              <Input
                id="location-filter"
                type="text"
                placeholder="e.g., France, China"
                value={localFilters.geoLocation || ''}
                onChange={(e) => updateFilter('geoLocation', e.target.value)}
                maxLength={200}
              />
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Country, region, or city of origin</p>
            </div>

            {/* Date Range Filter - side by side with Geographic Location */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Artwork Date Range</Label>
            

              {/* Date Inputs */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="e.g., 1800"
                    value={localFilters.dateBegin ?? ''}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '') {
                        updateFilter('dateBegin', undefined)
                      } else {
                        const num = Number(value)
                        if (!isNaN(num)) {
                          updateFilter('dateBegin', num)
                        }
                      }
                    }}
                    min="-5000"
                    max={localFilters.dateEnd || new Date().getFullYear()}
                    aria-label="From year"
                  />
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">From year</p>
                </div>
                <div className="flex items-center justify-center w-8 h-10 text-zinc-400 dark:text-zinc-500">
                  <svg width="12" height="2" viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="0" y1="1" x2="12" y2="1" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="e.g., 1900"
                    value={localFilters.dateEnd ?? ''}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '') {
                        updateFilter('dateEnd', undefined)
                      } else {
                        const num = Number(value)
                        if (!isNaN(num)) {
                          updateFilter('dateEnd', num)
                        }
                      }
                    }}
                    min={localFilters.dateBegin || -5000}
                    max={new Date().getFullYear()}
                    aria-label="To year"
                  />
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">To year</p>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDateRange(1800, 1900)}
                  className="cursor-pointer px-2 py-1 text-[10px] rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  19th Century
                </button>
                <button
                  type="button"
                  onClick={() => setDateRange(1900, 2000)}
                  className="cursor-pointer px-2 py-1 text-[10px] rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  20th Century
                </button>
                <button
                  type="button"
                  onClick={() => setDateRange(2000, new Date().getFullYear())}
                  className="cursor-pointer px-2 py-1 text-[10px] rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  Contemporary
                </button>
                <button
                  type="button"
                  onClick={() => setDateRange(1400, 1600)}
                  className="cursor-pointer px-2 py-1 text-[10px] rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  Renaissance
                </button>
                <button
                  type="button"
                  onClick={() => { updateFilter('dateBegin', undefined); updateFilter('dateEnd', undefined); }}
                  className="cursor-pointer px-2 py-1 text-[10px] rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Boolean Filters */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
            <Checkbox
              id="has-images-filter"
              label="Has images"
              checked={localFilters.hasImages || false}
              onChange={(e) => updateFilter('hasImages', e.target.checked ? true : undefined)}
            />
            
            <Checkbox
              id="is-highlight-filter"
              label="Highlights"
              checked={localFilters.isHighlight || false}
              onChange={(e) => updateFilter('isHighlight', e.target.checked ? true : undefined)}
            />
            
            <Checkbox
              id="is-on-view-filter"
              label="On view"
              checked={localFilters.isOnView || false}
              onChange={(e) => updateFilter('isOnView', e.target.checked ? true : undefined)}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
          >
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </Button>
          {Object.keys(localFilters).filter(key => {
            const value = localFilters[key as keyof SearchFilters]
            return value !== undefined && value !== false && value !== ''
          }).length > 0 && (
            <span className="ml-auto text-xs text-zinc-600 dark:text-zinc-400 flex items-center">
              {Object.keys(localFilters).filter(key => {
                const value = localFilters[key as keyof SearchFilters]
                return value !== undefined && value !== false && value !== ''
              }).length} active
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
