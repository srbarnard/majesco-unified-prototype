import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BlockIcon from '@mui/icons-material/Block'
import CheckIcon from '@mui/icons-material/Check'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Button } from '@/design-system/components'
import { filterFooterButtonSx } from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { layoutTokens } from '@/design-system/tokens/layout'
import {
  copilotDrawerHeadingSx,
  copilotDrawerTabsSx,
  copilotSubtitleSx,
} from '@/pages/policies/components/copilot/copilotDrawerStyles'

/**
 * Shared chrome for conversational "create record" drawers (New task, Create customer):
 * New/History tabs, teal subtitle, issue-style checklist rows, composer slot, Save draft / Create footer.
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
      autoFocus={prefersFinePointer()}
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
  /** Issue severity, matching Submission issues: error = blocker (pink), warning = amber. */
  tone?: 'error' | 'warning'
  /** Quiet status line under the value (e.g. "Emailed to …"). */
  meta?: ReactNode
  extra?: ReactNode
  /** Collection row: trailing chevron; the parent navigates instead of opening an inline editor. */
  chevron?: boolean
  /** Replaces the status badge with a category icon (e.g. location type); wins over `tone`. */
  badge?: DraftRowBadge
}

export type DraftRowBadge = { icon: ReactNode; label: string; color: 'teal' | 'green' }

type NeededBadgeTone = 'success' | 'error' | 'warning' | 'empty'

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
          aria-label={row.chevron ? `Open ${row.term.toLowerCase()}` : `${missing ? 'Set' : 'Edit'} ${row.term.toLowerCase()}`}
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
  createLabel,
  createDisabled,
  onCreate,
  onSaveDraft,
  onNewTabClick,
  variant = 'draft',
  children,
}: {
  heading: string
  /** `record`: the saved record — same heading, tabs and composer, but no Save / Create footer. */
  variant?: 'draft' | 'record'
  /** Fires on every New tab click, including when New is already selected. */
  onNewTabClick?: () => void
  closeLabel: string
  tab: DraftTab
  onTabChange: (tab: DraftTab) => void
  onClose: () => void
  history: ReactNode
  composer: ReactNode
  createLabel: string
  createDisabled: boolean
  onCreate: () => void
  onSaveDraft: () => void
  children: ReactNode
}) {
  const isRecord = variant === 'record'
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
        <Box sx={{ flexShrink: 0, pb: isRecord ? 1.5 : 0 }}>{composer}</Box>

        <Box sx={{ px: draftPanelPx, pb: 2, pt: 0.5, flexShrink: 0, display: isRecord ? 'none' : undefined }}>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" color="primary" fullWidth onClick={onSaveDraft} sx={filterFooterButtonSx}>
              Save draft
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={createDisabled}
              onClick={onCreate}
              sx={filterFooterButtonSx}
            >
              {createLabel}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
