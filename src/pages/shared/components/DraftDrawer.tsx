import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BlockIcon from '@mui/icons-material/Block'
import CheckIcon from '@mui/icons-material/Check'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { StatusChip } from '@/design-system/components'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { layoutTokens } from '@/design-system/tokens/layout'
import {
  copilotDrawerHeadingSx,
  copilotDrawerTabsSx,
  copilotSubtitleSx,
} from '@/pages/policies/components/copilot/copilotDrawerStyles'

/**
 * Shared chrome for conversational "create record" drawers (New task, Create customer):
 * New/History tabs, teal subtitle, Known facts / Needs attention accordions, document chips, composer slot.
 */

export const draftPanelPx = 2

export const draftBodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
  fontSize: '0.875rem',
  lineHeight: 1.55,
} as const

export const draftChipSx = {
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.75rem',
  height: 28,
  maxWidth: '100%',
  '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
} as const

export const draftInputSx = {
  '& .MuiInputBase-input': { fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' },
} as const

export const DRAFT_LIVE_PARSE_DEBOUNCE_MS = 300

export type DraftTab = 'new' | 'history'

export type DraftThreadMessage = { id: string; text: string; files?: string[] }

export function draftUid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function useDebouncedValue<T>(value: T, delayMs = DRAFT_LIVE_PARSE_DEBOUNCE_MS) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])
  return [debounced, setDebounced] as const
}

/**
 * Work-list order: filled fields first, in the order they were filled (later edits don't reshuffle them),
 * then empty fields in their given order.
 */
export function useFilledFirstOrder<F extends string>(fields: F[], isFilled: (field: F) => boolean): F[] {
  const filled = fields.filter(isFilled)
  const filledKey = filled.join(',')
  const [filledOrder, setFilledOrder] = useState<F[]>([])
  useEffect(() => {
    const next = (filledKey ? filledKey.split(',') : []) as F[]
    setFilledOrder((current) => {
      const ordered = [...current.filter((field) => next.includes(field)), ...next.filter((field) => !current.includes(field))]
      return ordered.join(',') === current.join(',') ? current : ordered
    })
  }, [filledKey])
  return [
    ...filledOrder.filter((field) => filled.includes(field)),
    ...filled.filter((field) => !filledOrder.includes(field)),
    ...fields.filter((field) => !filled.includes(field)),
  ]
}

const prefersFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches === true

export function DraftInlineOptions({
  options,
  selected,
  onPick,
}: {
  options: string[]
  selected: string | null
  onPick: (option: string) => void
}) {
  return (
    <Stack direction="row" flexWrap="wrap" useFlexGap gap={0.75}>
      {options.map((option) => {
        const isSelected = option === selected
        return (
          <Chip
            key={option}
            label={option}
            clickable
            color={isSelected ? 'primary' : 'default'}
            variant={isSelected ? 'filled' : 'outlined'}
            onClick={() => onPick(option)}
            sx={{ ...draftChipSx, ...(isSelected ? {} : { borderColor: 'divider' }) }}
          />
        )
      })}
    </Stack>
  )
}

export function DraftInlineLookup({
  options,
  placeholder,
  hint,
  searchText,
  optionSubtitle,
  optionLabel,
  onPick,
  onDismiss,
}: {
  options: string[]
  placeholder: string
  hint?: string
  /** Extra text an option matches on beyond its label (e.g. producer names). */
  searchText?: (option: string) => string
  /** Quiet second line under an option (e.g. a record number); also searchable. */
  optionSubtitle?: (option: string) => string | undefined
  /** Display text for an option when its key isn't what the user should read (e.g. a unique catalog label). */
  optionLabel?: (option: string) => string
  onPick: (option: string) => void
  onDismiss: () => void
}) {
  const filterOptions = useMemo(() => {
    if (searchText) return createFilterOptions<string>({ stringify: searchText })
    if (optionSubtitle) {
      return createFilterOptions<string>({ stringify: (option) => `${option} ${optionSubtitle(option) ?? ''}` })
    }
    return undefined
  }, [optionSubtitle, searchText])
  return (
    <Box>
      <Autocomplete
        size="small"
        options={options}
        filterOptions={filterOptions}
        openOnFocus
        autoHighlight
        onChange={(_, next) => {
          if (next) onPick(next)
        }}
        onClose={(_, reason) => {
          if (reason === 'escape') onDismiss()
        }}
        renderOption={
          optionSubtitle || optionLabel
            ? ({ key, ...props }, option) => {
                const subtitle = optionSubtitle?.(option)
                return (
                  <Box component="li" key={key} {...props}>
                    <Box sx={{ minWidth: 0 }}>
                      <Box>{optionLabel ? optionLabel(option) : option}</Box>
                      {subtitle ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', lineHeight: 1.35 }}
                        >
                          {subtitle}
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>
                )
              }
            : undefined
        }
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            autoFocus={prefersFinePointer()}
            inputProps={{ ...params.inputProps, 'aria-label': placeholder }}
            sx={draftInputSx}
          />
        )}
        slotProps={{ listbox: { sx: { fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' } } }}
      />
      {hint ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mt: 0.5 }}
        >
          {hint}
        </Typography>
      ) : null}
    </Box>
  )
}

export function DraftInlineTextEdit({
  initialValue,
  multiline = false,
  label,
  placeholder,
  helperText,
  confirmable = false,
  inputMode,
  type = 'text',
  autoFocus = true,
  onCommit,
  onDismiss,
}: {
  initialValue: string
  multiline?: boolean
  label: string
  placeholder?: string
  /** Caption under the open input (the row itself carries no helper text). */
  helperText?: string
  /** Trailing ✓ button that commits, alongside Enter / blur. */
  confirmable?: boolean
  inputMode?: 'text' | 'numeric' | 'decimal'
  /** Native input type; `tel` / `email` also set autocomplete and the mobile keyboard. */
  type?: 'text' | 'tel' | 'email'
  /** Off for every field but the first when several open together. */
  autoFocus?: boolean
  onCommit: (value: string) => void
  onDismiss: () => void
}) {
  const [value, setValue] = useState(initialValue)
  const commit = () => {
    const next = value.trim()
    if (next) onCommit(next)
    else onDismiss()
  }
  return (
    <TextField
      size="small"
      fullWidth
      multiline={multiline}
      minRows={multiline ? 3 : undefined}
      value={value}
      placeholder={placeholder}
      helperText={helperText}
      autoFocus={autoFocus && prefersFinePointer()}
      onChange={(event) => setValue(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onDismiss()
        if (event.key === 'Enter' && (!multiline || event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          commit()
        }
      }}
      type={multiline ? undefined : type}
      inputProps={{
        'aria-label': label,
        ...(inputMode ? { inputMode } : {}),
        ...(type === 'tel' ? { autoComplete: 'tel', inputMode: 'tel' } : {}),
        ...(type === 'email' ? { autoComplete: 'email', inputMode: 'email' } : {}),
      }}
      InputProps={
        confirmable
          ? {
              endAdornment: (
                <IconButton
                  size="small"
                  edge="end"
                  aria-label={`Save ${label.toLowerCase()}`}
                  disabled={!value.trim()}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={commit}
                  sx={{ color: 'primary.main' }}
                >
                  <CheckIcon sx={{ fontSize: 18 }} />
                </IconButton>
              ),
            }
          : undefined
      }
      FormHelperTextProps={{ sx: { fontFamily: figmaFontFamilyStack.body, mx: 0 } }}
      sx={draftInputSx}
    />
  )
}

export type DraftHistoryItem = { id: string; title: string; subtitle: string }

export function DraftHistoryList({
  entries,
  emptyText,
  onOpen,
}: {
  entries: DraftHistoryItem[]
  emptyText: string
  onOpen: (id: string) => void
}) {
  if (entries.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ ...draftBodySx, textAlign: 'center', py: 4 }}>
        {emptyText}
      </Typography>
    )
  }
  return (
    <Stack sx={{ mx: -draftPanelPx, mt: -1 }}>
      {entries.map((entry) => (
        <Box
          key={entry.id}
          component="button"
          type="button"
          onClick={() => onOpen(entry.id)}
          sx={{
            width: '100%',
            display: 'block',
            px: draftPanelPx,
            py: 1.5,
            border: 'none',
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Typography variant="body2" noWrap sx={{ ...draftBodySx, fontWeight: 600 }}>
            {entry.title}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mt: 0.25 }}
          >
            {entry.subtitle}
          </Typography>
        </Box>
      ))}
    </Stack>
  )
}

export function formatDraftCreatedTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export type DraftNeededRow<F extends string> = {
  term: string
  /** Plain text for the row; null = still needed. */
  value: string | null
  /** Helper text shown while the value is empty, in place of "still needed"; the badge carries the state. */
  hint?: string
  field?: F
  /** Issue severity, matching Submission issues: error = blocker (pink), warning = amber; new = unsaved new item (blue plus). */
  tone?: 'error' | 'warning' | 'new'
  /** Quiet status line under the value (e.g. "Emailed to …"). */
  meta?: ReactNode
  extra?: ReactNode
  /** Collection row: trailing chevron; the parent navigates instead of opening an inline editor. */
  chevron?: boolean
  /** Disclosure row: expands in place; the chevron points down and flips when open. */
  expandable?: boolean
  /** Replaces the status badge with a category icon (e.g. location type); wins over `tone`. */
  badge?: DraftRowBadge
}

export type DraftRowBadge = { icon: ReactNode; label: string; color: 'teal' | 'green' }

type NeededBadgeTone = 'success' | 'error' | 'warning' | 'new' | 'empty'

function CategoryBadge({ badge }: { badge: DraftRowBadge }) {
  return (
    <Box
      aria-label={badge.label}
      sx={(theme) => {
        const isLight = theme.palette.mode === 'light'
        const palette = theme.figmaPalette[badge.color]
        return {
          width: 32,
          height: 32,
          borderRadius: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          bgcolor: isLight ? palette[100] : palette[900],
          color: isLight ? palette[800] : palette[200],
          '& .MuiSvgIcon-root': { fontSize: 18 },
        }
      }}
    >
      {badge.icon}
    </Box>
  )
}

const BADGE_LABELS: Record<NeededBadgeTone, string> = {
  success: 'Filled',
  error: 'Blocker',
  warning: 'Warning',
  new: 'New',
  empty: 'Still needed',
}

function NeededStatusBadge({ tone }: { tone: NeededBadgeTone }) {
  return (
    <Box
      aria-label={BADGE_LABELS[tone]}
      sx={(theme) => {
        const isLight = theme.palette.mode === 'light'
        const palette =
          tone === 'error'
            ? theme.figmaPalette.red
            : tone === 'warning'
              ? theme.figmaPalette.amber
              : tone === 'success'
                ? theme.figmaPalette.green
                : tone === 'new'
                  ? theme.figmaPalette.blue
                  : null
        return {
          width: 32,
          height: 32,
          borderRadius: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          bgcolor: palette ? (isLight ? palette[100] : palette[900]) : 'action.hover',
          color: palette ? (isLight ? palette[800] : palette[200]) : 'text.disabled',
        }
      }}
    >
      {tone === 'error' ? (
        <BlockIcon sx={{ fontSize: 18 }} />
      ) : tone === 'warning' ? (
        <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} />
      ) : tone === 'success' ? (
        <CheckIcon sx={{ fontSize: 18 }} />
      ) : tone === 'new' ? (
        <AddIcon sx={{ fontSize: 18 }} />
      ) : (
        <RadioButtonUncheckedIcon sx={{ fontSize: 18 }} />
      )}
    </Box>
  )
}

/** How an expanded row is marked; `none` leaves only the editor's own focus ring. */
export type DraftOpenRowStyle = 'bar' | 'outline' | 'none'

function NeededItem<F extends string>({
  row,
  expanded,
  openRowStyle,
  onToggle,
  sx,
  children,
}: {
  row: DraftNeededRow<F>
  expanded: boolean
  openRowStyle: DraftOpenRowStyle
  onToggle?: () => void
  sx?: SxProps<Theme>
  children?: ReactNode
}) {
  const missing = row.value == null
  // An empty hint ('') means the row shows its title only.
  const subtitle = missing ? (row.hint ?? 'still needed') : row.value
  const line = (
    <>
      {row.badge ? (
        <CategoryBadge badge={row.badge} />
      ) : (
        <NeededStatusBadge tone={row.tone ?? (missing ? 'empty' : 'success')} />
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body2"
          sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.35 }}
        >
          {row.term}
        </Typography>
        {subtitle ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ...draftBodySx, fontSize: '0.8125rem', lineHeight: 1.4, mt: 0.25, overflowWrap: 'anywhere' }}
          >
            {subtitle}
          </Typography>
        ) : null}
        {row.meta ? <Box sx={{ mt: 0.5 }}>{row.meta}</Box> : null}
      </Box>
      {row.chevron ? (
        <ChevronRightIcon sx={{ fontSize: 20, color: 'text.secondary', alignSelf: 'center', flexShrink: 0 }} />
      ) : row.expandable ? (
        <ExpandMoreIcon
          sx={{
            fontSize: 20,
            color: 'text.secondary',
            alignSelf: 'center',
            flexShrink: 0,
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s ease',
          }}
        />
      ) : null}
    </>
  )
  const lineSx = {
    width: '100%',
    display: 'flex',
    alignItems: subtitle || row.meta ? 'flex-start' : 'center',
    gap: 1.25,
    px: 2,
    py: 1.5,
    textAlign: 'left',
  } as const

  return (
    <Box
      component="li"
      sx={[
        {
          listStyle: 'none',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: (theme) =>
            !expanded || openRowStyle === 'none'
              ? 'none'
              : openRowStyle === 'outline'
                ? `inset 0 0 0 1px ${theme.palette.primary.main}`
                : `inset 3px 0 0 ${theme.palette.primary.main}`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {onToggle ? (
        <ButtonBase
          disableRipple
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={
            row.chevron
              ? `Open ${row.term.toLowerCase()}`
              : row.expandable
                ? `${expanded ? 'Hide' : 'Show'} ${row.term.toLowerCase()}`
                : `${missing ? 'Set' : 'Edit'} ${row.term.toLowerCase()}`
          }
          sx={{
            ...lineSx,
            color: 'text.primary',
            '&.Mui-focusVisible': { outline: 2, outlineColor: 'primary.main', outlineOffset: -2 },
          }}
        >
          {line}
        </ButtonBase>
      ) : (
        <Box sx={{ ...lineSx, color: 'text.primary' }}>{line}</Box>
      )}
      {row.extra || children ? (
        <Box sx={{ pl: 7.25, pr: 2, pb: 2, pt: 0.5 }}>
          {row.extra}
          {children ? <Box sx={{ mt: row.extra ? 0.75 : 0 }}>{children}</Box> : null}
        </Box>
      ) : null}
    </Box>
  )
}

/** Checklist of draft fields; the expanded row renders its inline editor. */
export function DraftNeededList<F extends string>({
  rows,
  editingField,
  openRowStyle = 'bar',
  onToggle,
  renderEditor,
  rowSx,
}: {
  rows: DraftNeededRow<F>[]
  editingField: F | null
  openRowStyle?: DraftOpenRowStyle
  onToggle: (field: F) => void
  renderEditor: (field: F) => ReactNode
  /** Per-row extra styles (e.g. staggered entrance). */
  rowSx?: (index: number) => SxProps<Theme> | undefined
}) {
  if (rows.length === 0) return null
  return (
    <Box component="ul" sx={{ m: 0, p: 0, mx: -draftPanelPx, mb: 2 }}>
      {rows.map((row, index) => {
        const field = row.field
        const expanded = field != null && editingField === field
        return (
          <NeededItem
            key={row.field ?? row.term}
            row={row}
            expanded={expanded}
            openRowStyle={openRowStyle}
            onToggle={field ? () => onToggle(field) : undefined}
            sx={rowSx?.(index)}
          >
            {expanded && field ? renderEditor(field) : null}
          </NeededItem>
        )
      })}
    </Box>
  )
}

/** Unresolved: empty, or flagged as a blocker / warning / new item. Everything else is a known fact. */
export function isDraftRowOpen(row: DraftNeededRow<string>) {
  return row.value == null || row.tone != null
}

/**
 * Known facts: filled and unflagged. Considerations: warnings (optional or worth a look, never blocking).
 * Needs attention: everything else that's open — blockers and rows being added.
 */
export function splitDraftRows<F extends string>(rows: DraftNeededRow<F>[]) {
  return {
    known: rows.filter((row) => !isDraftRowOpen(row)),
    attention: rows.filter((row) => isDraftRowOpen(row) && row.tone !== 'warning'),
    considerations: rows.filter((row) => row.tone === 'warning'),
  }
}

/** Accordion header padding + chevron + gap: where the label (and the group's content) starts. */
const ACCORDION_INSET = 5

function DraftAccordion({
  label,
  count,
  open,
  onToggle,
  children,
}: {
  label: string
  count: number
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  if (count === 0) return null
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Box
        component="button"
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 2,
          py: 1.25,
          border: 'none',
          bgcolor: 'transparent',
          color: 'text.primary',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {open ? (
          <ExpandMoreIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        ) : (
          <KeyboardArrowRightIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        )}
        <Typography variant="body2" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
          {label}
        </Typography>
        <StatusChip status="default" label={count} sx={{ ml: 0.75, height: 20, minWidth: 24 }} />
      </Box>
      <Collapse in={open} unmountOnExit>
        {children}
      </Collapse>
    </Box>
  )
}

/**
 * Known facts (collapsed), Needs attention (open, blockers only), Considerations (collapsed, warnings):
 * the groups every create drawer shows. Rows keep their status icons and open their editor in place.
 * A collapsed group opens while one of its rows is being edited.
 */
export function DraftAccordions<F extends string>({
  known,
  attention,
  considerations = [],
  editingField,
  onToggle,
  renderEditor,
  knownOpen: knownOpenProp,
  onKnownOpenChange,
  onGroupToggle,
  hideKnown = false,
}: {
  known: DraftNeededRow<F>[]
  attention: DraftNeededRow<F>[]
  considerations?: DraftNeededRow<F>[]
  editingField: F | null
  onToggle: (field: F) => void
  renderEditor: (field: F) => ReactNode
  /** Control Known facts from outside (e.g. a "Review all" action). */
  knownOpen?: boolean
  onKnownOpenChange?: (open: boolean) => void
  /** Fires when any header is clicked (e.g. to close an open editor). */
  onGroupToggle?: () => void
  /** Leave out Known facts (e.g. once the record is filed). */
  hideKnown?: boolean
}) {
  const [knownOpenState, setKnownOpenState] = useState(false)
  const [attentionOpen, setAttentionOpen] = useState(true)
  const [considerationsOpen, setConsiderationsOpen] = useState(false)
  const editingIn = (rows: DraftNeededRow<F>[]) => editingField != null && rows.some((row) => row.field === editingField)
  const knownOpen = (knownOpenProp ?? knownOpenState) || editingIn(known)
  const showAttention = attentionOpen || editingIn(attention)
  const showConsiderations = considerationsOpen || editingIn(considerations)
  if (known.length === 0 && attention.length === 0 && considerations.length === 0) return null

  const rowList = (rows: DraftNeededRow<F>[]) => (
    <Box
      sx={{
        // Rows pad their content by draftPanelPx; shift them so it lands on the label's left edge.
        pl: ACCORDION_INSET - draftPanelPx,
        '& > ul': { mb: 0, mx: 0 },
        '& > ul > li:last-of-type': { borderBottom: 0 },
      }}
    >
      <DraftNeededList
        rows={rows}
        editingField={editingField}
        openRowStyle="none"
        onToggle={onToggle}
        renderEditor={renderEditor}
      />
    </Box>
  )

  return (
    <Stack sx={{ mx: -draftPanelPx, mb: 2 }}>
      {hideKnown ? null : (
        <DraftAccordion
          label="Known facts"
          count={known.length}
          open={knownOpen}
          onToggle={() => {
            const next = !knownOpen
            setKnownOpenState(next)
            onKnownOpenChange?.(next)
            onGroupToggle?.()
          }}
        >
          {rowList(known)}
        </DraftAccordion>
      )}
      <DraftAccordion
        label="Needs attention"
        count={attention.length}
        open={showAttention}
        onToggle={() => {
          setAttentionOpen(!showAttention)
          onGroupToggle?.()
        }}
      >
        {rowList(attention)}
      </DraftAccordion>
      <DraftAccordion
        label="Considerations"
        count={considerations.length}
        open={showConsiderations}
        onToggle={() => {
          setConsiderationsOpen(!showConsiderations)
          onGroupToggle?.()
        }}
      >
        {rowList(considerations)}
      </DraftAccordion>
    </Stack>
  )
}

/** Files on the draft, same chips as Notes; each opens its document. Sits under Suggested actions. */
export function DraftDocumentChips({
  files,
  onOpen,
}: {
  files: { id: string; label: string }[]
  onOpen: (id: string) => void
}) {
  if (files.length === 0) return null
  return (
    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75} sx={{ mt: 1.5, mb: 1.5 }}>
      {files.map((file) => (
        <Chip
          key={file.id}
          size="small"
          label={file.label}
          onClick={() => onOpen(file.id)}
          sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.75rem' }}
        />
      ))}
    </Stack>
  )
}

/** ← Title header over the checklist, with the original request beneath. */
export function DraftHeader({
  title,
  request,
  backLabel,
  onBack,
}: {
  title: string
  request?: ReactNode
  /** Omit both to drop the ← (e.g. a drawer's top level). */
  backLabel?: string
  onBack?: () => void
}) {
  const hasBack = Boolean(onBack)
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: hasBack ? 'auto minmax(0, 1fr)' : 'minmax(0, 1fr)',
        columnGap: 0.5,
        alignItems: 'center',
        minHeight: 34,
        mb: 1,
      }}
    >
      {hasBack ? (
        <IconButton size="small" onClick={onBack} aria-label={backLabel} sx={{ ml: -0.75 }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
      ) : null}
      <Typography variant="subtitle1" noWrap title={title} sx={{ ...copilotSubtitleSx, lineHeight: 1.35 }}>
        {title}
      </Typography>
      {request ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ ...draftBodySx, gridColumn: hasBack ? 2 : 1, lineHeight: 1.5, overflowWrap: 'anywhere' }}
        >
          {request}
        </Typography>
      ) : null}
    </Box>
  )
}

/** Teal prompt + helper copy shown before anything is drafted. */
export function DraftWelcome({ title, body }: { title: string; body: string }) {
  return (
    <>
      <Typography variant="subtitle1" sx={{ ...copilotSubtitleSx, lineHeight: 1.35, mb: 0.75 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ ...draftBodySx, lineHeight: 1.6, mb: 2, color: 'text.primary' }}>
        {body}
      </Typography>
    </>
  )
}

export function DraftDrawerShell({
  heading,
  closeLabel,
  tab,
  onTabChange,
  onClose,
  history,
  composer,
  onNewTabClick,
  children,
}: {
  heading: string
  /** `record`: the saved record. Kept for callers; the chrome is the same. */
  variant?: 'draft' | 'record'
  /** Fires on every New tab click, including when New is already selected. */
  onNewTabClick?: () => void
  closeLabel: string
  tab: DraftTab
  onTabChange: (tab: DraftTab) => void
  onClose: () => void
  history: ReactNode
  /** Save draft / Create live in Suggested actions; the composer is the last thing in the drawer. */
  composer: ReactNode
  children: ReactNode
}) {
  return (
    <Box
      sx={{
        flex: 1,
        alignSelf: 'stretch',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: draftPanelPx,
          pt: layoutTokens.policyHeaderTopPadding,
          pb: 0,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography
            variant="subtitle1"
            component="h2"
            sx={{ ...copilotDrawerHeadingSx, flex: 1 }}
          >
            {heading}
          </Typography>
          <IconButton size="small" onClick={onClose} aria-label={closeLabel}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Tabs value={tab} onChange={(_, next: DraftTab) => onTabChange(next)} sx={copilotDrawerTabsSx}>
          <Tab label="New" value="new" onClick={onNewTabClick} />
          <Tab label="History" value="history" />
        </Tabs>
      </Box>

      <Box
        sx={{
          px: draftPanelPx,
          pt: 2,
          pb: 2,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
        }}
      >
        {tab === 'history' ? history : children}
      </Box>

      <Box sx={{ display: tab === 'new' ? 'contents' : 'none' }}>
        <Box sx={{ flexShrink: 0, pb: 1.5 }}>{composer}</Box>
      </Box>
    </Box>
  )
}
