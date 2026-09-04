import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { insuredIdFromName } from '@/pages/shared/insuredId'

export type FavoriteEntityKind = 'policy' | 'insured'

export type FavoriteEntity = {
  kind: FavoriteEntityKind
  id: string
  label: string
}

export type FavoriteSectionId = 'watchlist' | 'renewals'

function entityKey(kind: FavoriteEntityKind, id: string) {
  return `${kind}:${id}`
}

function policyPath(policyNumber: string) {
  return `/policies/${encodeURIComponent(policyNumber)}`
}

function insuredPath(insuredName: string) {
  return `/insureds/${encodeURIComponent(insuredIdFromName(insuredName))}`
}

/** Seed lists — Favorites panel + details headers stay in sync from this. */
const SEED_WATCHLIST: FavoriteEntity[] = [
  { kind: 'policy', id: '01-BP-000009546-0', label: '01-BP-000009546-0' },
  {
    kind: 'insured',
    id: insuredIdFromName('Atlantic Ridge Construction, LLC'),
    label: 'Atlantic Ridge Construction, LLC',
  },
  {
    kind: 'insured',
    id: insuredIdFromName('Blue Harbor Logistics Inc.'),
    label: 'Blue Harbor Logistics Inc.',
  },
]

const SEED_RENEWALS: FavoriteEntity[] = [
  { kind: 'policy', id: '01-CA-000100005-0', label: '01-CA-000100005-0' },
  { kind: 'policy', id: '01-GL-000045821-0', label: '01-GL-000045821-0' },
]

const SEED_HIGH_RISK: FavoriteEntity[] = [
  { kind: 'policy', id: '01-WC-000078234-0', label: '01-WC-000078234-0' },
  {
    kind: 'insured',
    id: insuredIdFromName('Red Oak Hospitality Group'),
    label: 'Red Oak Hospitality Group',
  },
]

function toRecord(items: FavoriteEntity[]): Record<string, FavoriteEntity> {
  return Object.fromEntries(items.map((item) => [entityKey(item.kind, item.id), item]))
}

function toSectionMap(items: FavoriteEntity[], section: FavoriteSectionId): Record<string, FavoriteSectionId> {
  return Object.fromEntries(items.map((item) => [entityKey(item.kind, item.id), section]))
}

type FavoritesContextValue = {
  watchlist: FavoriteEntity[]
  renewals: FavoriteEntity[]
  highRisk: FavoriteEntity[]
  isFavorite: (kind: FavoriteEntityKind, id: string) => boolean
  isHighRisk: (kind: FavoriteEntityKind, id: string) => boolean
  toggleFavorite: (entity: FavoriteEntity) => void
  toggleHighRisk: (entity: FavoriteEntity) => void
  hrefFor: (entity: FavoriteEntity) => string
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoritesByKey, setFavoritesByKey] = useState<Record<string, FavoriteEntity>>(() => ({
    ...toRecord(SEED_WATCHLIST),
    ...toRecord(SEED_RENEWALS),
  }))
  const [favoriteSectionByKey, setFavoriteSectionByKey] = useState<Record<string, FavoriteSectionId>>(() => ({
    ...toSectionMap(SEED_WATCHLIST, 'watchlist'),
    ...toSectionMap(SEED_RENEWALS, 'renewals'),
  }))
  const [highRiskByKey, setHighRiskByKey] = useState<Record<string, FavoriteEntity>>(() =>
    toRecord(SEED_HIGH_RISK),
  )

  const isFavorite = useCallback(
    (kind: FavoriteEntityKind, id: string) => Boolean(favoritesByKey[entityKey(kind, id)]),
    [favoritesByKey],
  )

  const isHighRisk = useCallback(
    (kind: FavoriteEntityKind, id: string) => Boolean(highRiskByKey[entityKey(kind, id)]),
    [highRiskByKey],
  )

  const toggleFavorite = useCallback((entity: FavoriteEntity) => {
    const key = entityKey(entity.kind, entity.id)
    setFavoritesByKey((current) => {
      if (current[key]) {
        const next = { ...current }
        delete next[key]
        return next
      }
      return { ...current, [key]: entity }
    })
    setFavoriteSectionByKey((current) => {
      if (current[key]) {
        const next = { ...current }
        delete next[key]
        return next
      }
      // New favorites from details land in Watchlist.
      return { ...current, [key]: 'watchlist' }
    })
  }, [])

  const toggleHighRisk = useCallback((entity: FavoriteEntity) => {
    const key = entityKey(entity.kind, entity.id)
    setHighRiskByKey((current) => {
      if (current[key]) {
        const next = { ...current }
        delete next[key]
        return next
      }
      return { ...current, [key]: entity }
    })
  }, [])

  const hrefFor = useCallback((entity: FavoriteEntity) => {
    return entity.kind === 'policy' ? policyPath(entity.id) : `/insureds/${encodeURIComponent(entity.id)}`
  }, [])

  const watchlist = useMemo(
    () =>
      Object.values(favoritesByKey).filter(
        (item) => favoriteSectionByKey[entityKey(item.kind, item.id)] === 'watchlist',
      ),
    [favoriteSectionByKey, favoritesByKey],
  )

  const renewals = useMemo(
    () =>
      Object.values(favoritesByKey).filter(
        (item) => favoriteSectionByKey[entityKey(item.kind, item.id)] === 'renewals',
      ),
    [favoriteSectionByKey, favoritesByKey],
  )

  const highRisk = useMemo(() => Object.values(highRiskByKey), [highRiskByKey])

  const value = useMemo(
    () => ({
      watchlist,
      renewals,
      highRisk,
      isFavorite,
      isHighRisk,
      toggleFavorite,
      toggleHighRisk,
      hrefFor,
    }),
    [
      watchlist,
      renewals,
      highRisk,
      isFavorite,
      isHighRisk,
      toggleFavorite,
      toggleHighRisk,
      hrefFor,
    ],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return ctx
}

/** Safe helper when a screen may render outside the provider in tests. */
export function useFavoritesOptional() {
  return useContext(FavoritesContext)
}

// Keep seed path helper available for panel links that used insured names.
export { insuredPath, policyPath }
