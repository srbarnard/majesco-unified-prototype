import CheckIcon from '@mui/icons-material/Check'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import EditLocationAltOutlinedIcon from '@mui/icons-material/EditLocationAltOutlined'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useLayoutEffect, useRef, useState, type ChangeEvent } from 'react'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { CustomerAddressEditor } from '@/pages/customers/components/CustomerAddressEditor'
import { formatAddress } from '@/pages/customers/data/createCustomerDraft'
import { draftInputSx } from '@/pages/shared/components/DraftDrawer'
import type { InsuredLocation } from '@/pages/claims/data/policyLocations'
import { matchVehicles } from '@/pages/claims/data/vehicleCatalog'

type VehicleOption = { kind: 'vehicle'; label: string } | { kind: 'typed'; text: string }

const VEHICLE_PLACEHOLDER = 'Year, make, or model…'
const optionTextSx = { fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' } as const

/**
 * Vehicle typeahead for "What was damaged": picking a match writes "2025 Ford F-250, " so the damage
 * can follow; anything typed (an unlisted vehicle, or vehicle plus damage) commits as-is.
 */
export function ClaimVehicleDamageEdit({
  initialValue,
  onCommit,
  onDismiss,
}: {
  initialValue: string
  onCommit: (value: string) => void
  onDismiss: () => void
}) {
  const [input, setInput] = useState(initialValue)
  const [picked, setPicked] = useState<string | null>(null)
  const trimmed = input.trim()
  // Once a vehicle is picked, the rest of the line is the damage; stop suggesting until it is cleared.
  const describingDamage = picked != null && input.startsWith(picked)
  const matches = describingDamage ? [] : matchVehicles(trimmed)
  const options: VehicleOption[] = [
    ...matches.map((label) => ({ kind: 'vehicle' as const, label })),
    ...(trimmed ? [{ kind: 'typed' as const, text: trimmed }] : []),
  ]
  const commit = (text: string) => {
    const value = text.trim().replace(/,$/, '').trim()
    if (value) onCommit(value)
  }
  const pick = (label: string) => {
    setPicked(label)
    setInput(`${label}, `)
  }

  return (
    <Autocomplete<VehicleOption, false, true, true>
      size="small"
      freeSolo
      disableClearable
      autoHighlight
      open={trimmed.length > 0 && !describingDamage}
      options={options}
      filterOptions={(all) => all}
      inputValue={input}
      onInputChange={(_, next, reason) => {
        if (reason === 'reset') return
        setInput(next)
      }}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.kind === 'vehicle' ? option.label : option.text
      }
      isOptionEqualToValue={() => false}
      onChange={(_, next) => {
        if (typeof next === 'string') commit(next)
        else if (next.kind === 'vehicle') pick(next.label)
        else commit(next.text)
      }}
      onClose={(_, reason) => {
        if (reason === 'escape') onDismiss()
      }}
      renderOption={({ key, ...props }, option) => (
        <Box component="li" key={key} {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {option.kind === 'vehicle' ? (
            <>
              <DirectionsCarOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography sx={optionTextSx}>{option.label}</Typography>
            </>
          ) : (
            <>
              <KeyboardReturnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography sx={optionTextSx}>Use “{option.text}”</Typography>
            </>
          )}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={VEHICLE_PLACEHOLDER}
          autoFocus
          helperText={describingDamage ? 'Add the damage, e.g. rear bumper' : 'Year, make, and model, then the damage'}
          inputProps={{ ...params.inputProps, 'aria-label': 'What was damaged' }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <IconButton
                size="small"
                edge="end"
                aria-label="Save what was damaged"
                disabled={!trimmed}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => commit(input)}
                sx={{ color: 'primary.main' }}
              >
                <CheckIcon sx={{ fontSize: 18 }} />
              </IconButton>
            ),
          }}
          FormHelperTextProps={{ sx: { fontFamily: figmaFontFamilyStack.body, mx: 0 } }}
          sx={draftInputSx}
        />
      )}
      slotProps={{ listbox: { sx: { fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' } } }}
    />
  )
}

type LocationOption = { kind: 'insured'; location: InsuredLocation } | { kind: 'elsewhere' }

const SOMEWHERE_ELSE: LocationOption = { kind: 'elsewhere' }

/**
 * Location on a policy claim: the policy's insured locations first; "Somewhere else" always trails the
 * results and switches to the address typeahead for a loss away from an insured location.
 */
export function ClaimInsuredLocationEdit({
  locations,
  onCommit,
  onDismiss,
}: {
  locations: InsuredLocation[]
  onCommit: (address: string) => void
  onDismiss: () => void
}) {
  const [elsewhere, setElsewhere] = useState(false)

  if (elsewhere) {
    return (
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ ...optionTextSx, display: 'block', mb: 0.75 }}>
          Not an insured location · enter the address
        </Typography>
        <CustomerAddressEditor
          value={null}
          onSelect={(address) => onCommit(formatAddress(address))}
          onDone={onDismiss}
          onDismiss={onDismiss}
        />
        <Link
          component="button"
          type="button"
          underline="hover"
          onClick={() => setElsewhere(false)}
          sx={{ ...optionTextSx, mt: 0.75 }}
        >
          Back to insured locations
        </Link>
      </Box>
    )
  }

  return (
    <Autocomplete<LocationOption, false, true>
      size="small"
      disableClearable
      openOnFocus
      autoHighlight
      options={[...locations.map((location) => ({ kind: 'insured' as const, location })), SOMEWHERE_ELSE]}
      filterOptions={(all, { inputValue }) => {
        const words = inputValue.toLowerCase().split(/\s+/).filter(Boolean)
        const matches = all.filter(
          (option) =>
            option.kind === 'insured' &&
            words.every((word) => `${option.location.name} ${option.location.address}`.toLowerCase().includes(word)),
        )
        return [...matches, SOMEWHERE_ELSE]
      }}
      getOptionLabel={(option) => (option.kind === 'insured' ? option.location.address : 'Somewhere else')}
      isOptionEqualToValue={() => false}
      onChange={(_, next) => {
        if (next.kind === 'insured') onCommit(next.location.address)
        else setElsewhere(true)
      }}
      onClose={(_, reason) => {
        if (reason === 'escape') onDismiss()
      }}
      renderOption={({ key, ...props }, option) => (
        <Box component="li" key={key} {...props} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          {option.kind === 'insured' ? (
            <>
              <PlaceOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.25 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={optionTextSx}>{option.location.address}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
                  {option.location.name}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <EditLocationAltOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.25 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={optionTextSx}>Somewhere else</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
                  Not an insured location
                </Typography>
              </Box>
            </>
          )}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search insured locations…"
          autoFocus
          helperText="Insured locations on this policy"
          inputProps={{ ...params.inputProps, 'aria-label': 'Insured location' }}
          FormHelperTextProps={{ sx: { fontFamily: figmaFontFamilyStack.body, mx: 0 } }}
          sx={draftInputSx}
        />
      )}
      slotProps={{ listbox: { sx: { fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' } } }}
    />
  )
}

/** "2500.5" → "2,500.5": digits and one decimal point (two places), integer part grouped by thousands. */
function groupAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, '')
  const [whole, ...rest] = cleaned.split('.')
  const grouped = (whole.replace(/^0+(?=\d)/, '') || (rest.length ? '0' : '')).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return rest.length ? `${grouped}.${rest.join('').slice(0, 2)}` : grouped
}

/** Dollar amount that groups thousands as it is typed; commits "$2,500" on ✓, Enter, or blur. */
export function ClaimRepairEstimateEdit({
  initialValue,
  onCommit,
  onDismiss,
}: {
  initialValue: string
  onCommit: (value: string) => void
  onDismiss: () => void
}) {
  const [value, setValue] = useState(() => groupAmount(initialValue))
  const inputRef = useRef<HTMLInputElement>(null)
  const caret = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (caret.current == null || !inputRef.current) return
    inputRef.current.setSelectionRange(caret.current, caret.current)
    caret.current = null
  }, [value])

  const change = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    const next = groupAmount(raw)
    // Keep the caret after the same number of digits it followed before the commas moved.
    const kept = raw.slice(0, event.target.selectionStart ?? raw.length).replace(/[^\d.]/g, '').length
    let position = 0
    for (let seen = 0; position < next.length && seen < kept; position += 1) {
      if (/[\d.]/.test(next[position])) seen += 1
    }
    caret.current = position
    setValue(next)
  }

  const commit = () => (value.replace(/[.,]/g, '') ? onCommit(`$${value.replace(/\.$/, '')}`) : onDismiss())

  return (
    <TextField
      size="small"
      fullWidth
      value={value}
      autoFocus
      placeholder="2,500"
      helperText="A rough figure is fine"
      onChange={change}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onDismiss()
        if (event.key === 'Enter') {
          event.preventDefault()
          commit()
        }
      }}
      inputRef={inputRef}
      inputProps={{ 'aria-label': 'Repair estimate', inputMode: 'decimal' }}
      InputProps={{
        startAdornment: <InputAdornment position="start">$</InputAdornment>,
        endAdornment: (
          <IconButton
            size="small"
            edge="end"
            aria-label="Save repair estimate"
            disabled={!value.replace(/[.,]/g, '')}
            onMouseDown={(event) => event.preventDefault()}
            onClick={commit}
            sx={{ color: 'primary.main' }}
          >
            <CheckIcon sx={{ fontSize: 18 }} />
          </IconButton>
        ),
      }}
      FormHelperTextProps={{ sx: { fontFamily: figmaFontFamilyStack.body, mx: 0 } }}
      sx={draftInputSx}
    />
  )
}

/** Native date input; commits ISO `yyyy-mm-dd` on ✓, Enter, or blur. */
export function ClaimDateOfLossEdit({
  initialValue,
  onCommit,
  onDismiss,
}: {
  initialValue: string
  onCommit: (iso: string) => void
  onDismiss: () => void
}) {
  const [value, setValue] = useState(initialValue)
  const commit = () => (value ? onCommit(value) : onDismiss())
  return (
    <TextField
      size="small"
      fullWidth
      type="date"
      value={value}
      autoFocus
      helperText="When the loss happened"
      onChange={(event) => setValue(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onDismiss()
        if (event.key === 'Enter') {
          event.preventDefault()
          commit()
        }
      }}
      inputProps={{ 'aria-label': 'Date of loss', max: new Date().toISOString().slice(0, 10) }}
      InputProps={{
        endAdornment: (
          <IconButton
            size="small"
            edge="end"
            aria-label="Save date of loss"
            disabled={!value}
            onMouseDown={(event) => event.preventDefault()}
            onClick={commit}
            sx={{ color: 'primary.main' }}
          >
            <CheckIcon sx={{ fontSize: 18 }} />
          </IconButton>
        ),
      }}
      FormHelperTextProps={{ sx: { fontFamily: figmaFontFamilyStack.body, mx: 0 } }}
      sx={draftInputSx}
    />
  )
}
