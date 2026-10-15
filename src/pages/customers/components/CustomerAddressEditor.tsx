import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { draftInputSx, useDebouncedValue } from '@/pages/shared/components/DraftDrawer'
import { cachedUsAddresses, currentPosition, reverseGeocodeUs, searchUsAddresses } from '../data/addressLookup'
import { formatAddress, parseCustomerField, type CustomerAddress } from '../data/createCustomerDraft'

const PLACEHOLDER = 'Start typing address…'

type AddressOption =
  | { kind: 'address'; address: CustomerAddress }
  | { kind: 'typed'; text: string }
  | { kind: 'searching' }

const captionSx = { fontFamily: figmaFontFamilyStack.body, display: 'block', mt: 0.5 } as const
const SEARCHING_OPTION: AddressOption = { kind: 'searching' }
const EMPTY_ADDRESSES: CustomerAddress[] = []
/** Pause before the network lookup. Cached lines still show on the keystroke that matches them. */
const ADDRESS_SEARCH_DEBOUNCE_MS = 250

const AddressSuggestion = memo(function AddressSuggestion({ address }: { address: CustomerAddress }) {
  return (
    <>
      <Typography sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' }}>{address.street}</Typography>
      <Typography color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.75rem' }}>
        {[address.city, [address.state, address.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')}
      </Typography>
    </>
  )
})

/**
 * Address row editor: US typeahead (or the typed line, confirmed) writes one formatted line to the row;
 * then an optional Apt / suite line. Lookup failures never block — the typed line is always offered.
 */
export function CustomerAddressEditor({
  value,
  onSelect,
  onDone,
  onDismiss,
}: {
  value: CustomerAddress | null
  onSelect: (address: CustomerAddress) => void
  onDone: () => void
  onDismiss: () => void
}) {
  const [phase, setPhase] = useState<'search' | 'unit'>(value ? 'unit' : 'search')
  const [input, setInput] = useState('')
  const [query] = useDebouncedValue(input, ADDRESS_SEARCH_DEBOUNCE_MS)
  const [lookup, setLookup] = useState<{ query: string; results: CustomerAddress[] }>({ query: '', results: [] })
  const [searching, setSearching] = useState(false)
  const [lookupFailed, setLookupFailed] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locateFailed, setLocateFailed] = useState(false)
  const [unit, setUnit] = useState(value?.unit ?? '')

  useEffect(() => {
    const q = query.trim()
    if (phase !== 'search' || q.length < 3) {
      setLookup((current) => (current.query === '' && current.results.length === 0 ? current : { query: '', results: [] }))
      setSearching(false)
      return
    }
    const key = q.toLowerCase()
    const cached = cachedUsAddresses(q)
    if (cached) {
      setLookup((current) => (current.query === key && current.results === cached ? current : { query: key, results: cached }))
      setSearching(false)
      setLookupFailed(false)
      return
    }
    const controller = new AbortController()
    setSearching(true)
    searchUsAddresses(q, controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return
        setLookup({ query: query.trim().toLowerCase(), results: next })
        setLookupFailed(false)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        console.warn(error)
        setLookup({ query: '', results: [] })
        setLookupFailed(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setSearching(false)
      })
    return () => controller.abort()
  }, [phase, query])

  const select = (address: CustomerAddress) => {
    onSelect(address)
    setUnit(address.unit ?? '')
    setPhase('unit')
  }

  const confirmTyped = (text: string) => {
    const typed = text.trim()
    if (!typed) return
    const parsed = parseCustomerField('address', typed)
    if (parsed) select(parsed)
  }

  const fillFromCurrentLocation = async () => {
    setLocating(true)
    setLocateFailed(false)
    try {
      const { coords } = await currentPosition()
      const address = await reverseGeocodeUs(coords.latitude, coords.longitude)
      if (address) select(address)
      else setLocateFailed(true)
    } catch {
      setLocateFailed(true)
    } finally {
      setLocating(false)
    }
  }

  const commitUnit = () => {
    if (!value) return
    const next = unit.trim() || undefined
    if (next !== value.unit) onSelect({ ...value, unit: next })
  }

  const trimmed = input.trim()
  const cachedNow = cachedUsAddresses(trimmed)
  // Keep earlier suggestions only while the user is still extending the query that produced them.
  const extended = lookup.query && trimmed.toLowerCase().startsWith(lookup.query) ? lookup.results : EMPTY_ADDRESSES
  const base = cachedNow ?? extended
  const exact = Boolean(cachedNow) || Boolean(lookup.query && trimmed.toLowerCase() === lookup.query)
  const visibleAddresses = useMemo(() => {
    if (!trimmed || exact) return base.slice(0, 6)
    const words = trimmed.toLowerCase().split(/\s+/).filter(Boolean)
    const filtered: CustomerAddress[] = []
    for (const address of base) {
      const haystack = formatAddress(address).toLowerCase()
      if (words.every((word) => haystack.includes(word))) filtered.push(address)
      if (filtered.length >= 6) break
    }
    // A house number often isn't on the street-level hit yet. Keep those rows until the lookup returns.
    return filtered.length > 0 ? filtered : base
  }, [base, exact, trimmed])
  const addressOptions = useMemo<AddressOption[]>(
    () => visibleAddresses.map((address) => ({ kind: 'address', address })),
    [visibleAddresses],
  )
  const showSearching = (searching || (trimmed !== query.trim() && trimmed.length >= 3)) && visibleAddresses.length === 0 && !cachedNow
  const options = useMemo<AddressOption[]>(() => {
    const next = addressOptions.slice()
    if (showSearching) next.push(SEARCHING_OPTION)
    if (trimmed) next.push({ kind: 'typed', text: trimmed })
    return next
  }, [addressOptions, showSearching, trimmed])
  const keepOptions = useCallback((all: AddressOption[]) => all, [])

  if (phase === 'unit' && value) {
    return (
      <Box>
        <TextField
          size="small"
          fullWidth
          value={unit}
          placeholder="Apt / suite (optional)"
          autoFocus
          onChange={(event) => setUnit(event.target.value)}
          onBlur={() => {
            commitUnit()
            onDone()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') onDismiss()
            if (event.key === 'Enter') {
              event.preventDefault()
              commitUnit()
              onDone()
            }
          }}
          inputProps={{ 'aria-label': 'Apt / suite (optional)' }}
          sx={draftInputSx}
        />
        <ButtonBase
          disableRipple
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            commitUnit()
            setInput('')
            setPhase('search')
          }}
          sx={{ ...captionSx, typography: 'caption', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
        >
          Change address
        </ButtonBase>
      </Box>
    )
  }

  return (
    <Box>
      <Autocomplete<AddressOption, false, true, true>
        size="small"
        freeSolo
        disableClearable
        autoHighlight
        open={trimmed.length > 0}
        options={options}
        filterOptions={keepOptions}
        inputValue={input}
        onInputChange={(_, next, reason) => {
          if (reason === 'reset') return
          setInput(next)
          setLocateFailed(false)
        }}
        getOptionLabel={(option) =>
          typeof option === 'string'
            ? option
            : option.kind === 'address'
              ? formatAddress(option.address)
              : option.kind === 'typed'
                ? option.text
                : ''
        }
        getOptionDisabled={(option) => option.kind === 'searching'}
        isOptionEqualToValue={() => false}
        onChange={(_, next) => {
          if (typeof next === 'string') confirmTyped(next)
          else if (next.kind === 'typed') confirmTyped(next.text)
          else if (next.kind === 'address') select(next.address)
        }}
        onClose={(_, reason) => {
          if (reason === 'escape') onDismiss()
        }}
        renderOption={({ key, ...props }, option) => (
          <Box component="li" key={key} {...props} sx={{ display: 'block !important' }}>
            {option.kind === 'address' ? (
              <AddressSuggestion address={option.address} />
            ) : option.kind === 'searching' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={14} />
                <Typography color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' }}>
                  Searching addresses…
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <KeyboardReturnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' }}>
                  Use “{option.text}”
                </Typography>
              </Box>
            )}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={PLACEHOLDER}
            autoFocus
            inputProps={{ ...params.inputProps, 'aria-label': PLACEHOLDER }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: -0.5 }}>
                  {searching ? <CircularProgress size={14} aria-label="Searching addresses" /> : null}
                  <Tooltip title="Use current location">
                    <span>
                      <IconButton
                        size="small"
                        aria-label="Use current location"
                        disabled={locating}
                        onClick={() => void fillFromCurrentLocation()}
                      >
                        {locating ? <CircularProgress size={16} /> : <MyLocationIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              ),
            }}
            sx={draftInputSx}
          />
        )}
        slotProps={{ listbox: { sx: { fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' } } }}
      />
      {locateFailed ? (
        <Typography variant="caption" color="error" sx={captionSx}>
          Couldn’t get your location. Type the address instead.
        </Typography>
      ) : lookupFailed && trimmed ? (
        <Typography variant="caption" color="text.secondary" sx={captionSx}>
          Lookup unavailable. Press Enter to use what you typed.
        </Typography>
      ) : null}
    </Box>
  )
}
