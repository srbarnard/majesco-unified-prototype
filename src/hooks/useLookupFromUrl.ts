import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import { useSearchParams } from 'react-router'
import {
  resolvePoliciesLookup,
  resolveQuotesLookup,
  resolveTasksLookup,
  type QuickLookupId,
} from '@/app/navigation/globalSearchConfig'
import { emptyPoliciesListFilters, type PoliciesListFilters } from '@/pages/policies/filters/policiesListFilterTypes'
import { emptyQuotesListFilters, type QuotesListFilters } from '@/pages/quotes/filters/quotesListFilterTypes'
import { emptyTasksFilters, type TasksFilters } from '@/pages/tasks/filters/tasksFilterTypes'

function useLookupEffect<T>(
  emptyFilters: T,
  resolve: (id: QuickLookupId) => Partial<T> | null,
  setAppliedFilters: Dispatch<SetStateAction<T>>,
  onLookupApplied?: (lookupId: QuickLookupId) => void,
) {
  const [searchParams, setSearchParams] = useSearchParams()
  const appliedRef = useRef<string | null>(null)

  useEffect(() => {
    const lookup = searchParams.get('lookup') as QuickLookupId | null
    if (!lookup) {
      appliedRef.current = null
      return
    }

    if (appliedRef.current === lookup) return

    const patch = resolve(lookup)
    if (!patch) return

    appliedRef.current = lookup
    setAppliedFilters({ ...emptyFilters, ...patch })
    onLookupApplied?.(lookup)

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('lookup')
    setSearchParams(nextParams, { replace: true })
  }, [emptyFilters, onLookupApplied, resolve, searchParams, setAppliedFilters, setSearchParams])
}

export function usePoliciesLookupFromUrl(
  setAppliedFilters: Dispatch<SetStateAction<PoliciesListFilters>>,
  onLookupApplied?: (lookupId: QuickLookupId) => void,
) {
  useLookupEffect(emptyPoliciesListFilters, resolvePoliciesLookup, setAppliedFilters, onLookupApplied)
}

export function useQuotesLookupFromUrl(
  setAppliedFilters: Dispatch<SetStateAction<QuotesListFilters>>,
  onLookupApplied?: (lookupId: QuickLookupId) => void,
) {
  useLookupEffect(emptyQuotesListFilters, resolveQuotesLookup, setAppliedFilters, onLookupApplied)
}

export function useTasksLookupFromUrl(
  setAppliedFilters: Dispatch<SetStateAction<TasksFilters>>,
  onLookupApplied?: (lookupId: QuickLookupId) => void,
) {
  useLookupEffect(emptyTasksFilters, resolveTasksLookup, setAppliedFilters, onLookupApplied)
}
