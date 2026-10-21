import AddIcon from '@mui/icons-material/Add'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import AirlineSeatReclineNormalOutlinedIcon from '@mui/icons-material/AirlineSeatReclineNormalOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import RemoveIcon from '@mui/icons-material/Remove'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MuiChip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import MenuItem from '@mui/material/MenuItem'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme, type Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { CLAIMS_ONLY } from '@/app/config/claimsOnly'
import { useRightTool } from '@/app/contexts/RightToolContext'
import { useRegisterRightToolRecordContext } from '@/app/hooks/useRightToolRegistration'
import { Button as DsButton, Chip, CopilotQuickActions, EntityListHomeButton } from '@/design-system/components'
import { chatAuthorAvatarSx, chatBubbleIncoming, sectionTabRowBorderSx } from '@/design-system/theme/themeSurfaces'
import { figmaBorderRadius } from '@/design-system/tokens/figma-border-radius'
import { getFigmaColors } from '@/design-system/tokens/figma-colors'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { layoutTokens } from '@/design-system/tokens/layout'
import { fadeSlideDownSx } from '@/design-system/tokens/motion'
import { ClaimDateOfLossEdit } from '@/pages/claims/components/ClaimLossEditors'
import { getClaim, upsertClaim } from '@/pages/claims/data/claimsStore'
import {
  CLAIM_CURRENT_USER,
  CLAIM_QUEUES,
  formatLossDate,
  recordFromDraft,
  type CreateClaimDraft,
} from '@/pages/claims/data/createClaimDraft'
import {
  FNOL_OPENING,
  FNOL_PARTY_ROLES,
  FNOL_STATE_CHOICES,
  FNOL_POLICY_NUMBERS,
  addFnolParty,
  applyFnolDamageAnswer,
  assignFnolPolicy,
  buildFnolTally,
  createFnolDraft,
  fnolAsk,
  fnolCanSubmit,
  fnolCaptured,
  fnolLossStarted,
  fnolPolicyLabel,
  fnolPolicySearch,
  fnolPolicySubtitle,
  fnolReply,
  fnolStateLabel,
  formatFnolContact,
  fnolSuggestions,
  ingestFnolTurn,
  referFnolDriver,
  removeFnolParty,
  setFnolAirbag,
  setFnolPartyContact,
  syncFnolParties,
  updateFnolParty,
  type FnolIntakeMode,
  type FnolParty,
  type FnolPartyRole,
} from '@/pages/claims/data/fnolConversation'
import { copilotSubtitleSx } from '@/pages/policies/components/copilot/copilotDrawerStyles'
import { CopilotComposer } from '@/pages/policies/components/CopilotComposer'
import type { CopilotAttachedFile } from '@/pages/policies/components/CopilotComposer'
import {
  DraftAccordions,
  DraftInlineLookup,
  DraftInlineOptions,
  DraftInlineTextEdit,
  draftBodySx,
  draftInputSx,
  draftPanelPx,
} from '@/pages/shared/components/DraftDrawer'
import { insuredIdFromName } from '@/pages/shared/insuredId'
import { ADD_TASK_ASSIGNEES } from '@/pages/tasks/data/addTaskDraft'

const ASSIGNEE_OPTIONS = [
  CLAIM_CURRENT_USER,
  ...CLAIM_QUEUES,
  ...ADD_TASK_ASSIGNEES.filter((name) => name !== CLAIM_CURRENT_USER && !/queue/i.test(name)),
]

const START_ANOTHER_CLAIM = 'Create another claim'

const confirmationLinkSx = (theme: Theme) => ({
  ...draftBodySx,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  px: 1,
  py: 0.5,
  borderRadius: 1.5,
  transition: 'background-color 0.15s ease, color 0.15s ease',
  '&:hover': {
    bgcolor: getFigmaColors(theme.palette.mode).primary.hover,
    color: 'primary.main',
  },
  '&:active': { bgcolor: getFigmaColors(theme.palette.mode).primary.selected },
})

function assigneeLabel(name: string) {
  return name === CLAIM_CURRENT_USER ? 'You' : name
}

function FnolSubmitConfirmation({
  draft,
  insuredName,
  onClose,
  onStartAnother,
  onOpen,
}: {
  draft: CreateClaimDraft
  insuredName: string | null
  onClose: () => void
  onStartAnother: () => void
  onOpen: (path: string) => void
}) {
  const assignedTo = draft.assignee ?? CLAIM_CURRENT_USER
  const confirmationRows: { term: string; value: string; href?: string }[] = [
    { term: 'Claim', value: draft.claimNumber, href: `/claims/${encodeURIComponent(draft.claimNumber)}` },
    ...(insuredName
      ? [
          {
            term: 'Insured',
            value: insuredName,
            href: CLAIMS_ONLY ? undefined : `/insureds/${insuredIdFromName(insuredName)}`,
          },
        ]
      : []),
    ...(draft.policy
      ? [
          {
            term: 'Policy',
            value: `${draft.policy.policyNumber} · ${draft.policy.product}`,
            href: CLAIMS_ONLY ? undefined : `/policies/${encodeURIComponent(draft.policy.policyNumber)}`,
          },
        ]
      : []),
    ...(draft.dateOfLoss ? [{ term: 'Date of loss', value: formatLossDate(draft.dateOfLoss) }] : []),
    { term: 'Assigned to', value: assigneeLabel(assignedTo) },
  ]

  return (
    <Stack alignItems="center" sx={[{ pt: 4, pb: 2, textAlign: 'center' }, fadeSlideDownSx()]}>
      <Box
        aria-hidden
        sx={(theme) => ({
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.12),
          color: 'success.main',
          mb: 1.5,
        })}
      >
        <InventoryOutlinedIcon sx={{ fontSize: 28 }} />
      </Box>
      <Typography variant="subtitle1" sx={{ ...copilotSubtitleSx, lineHeight: 1.35 }}>
        Claim submitted
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ ...draftBodySx, mt: 0.5 }}>
        {`Claim ${draft.claimNumber} submitted and assigned to ${assignedTo === CLAIM_CURRENT_USER ? 'you' : assignedTo}.`}
      </Typography>

      <Box sx={{ width: '100%', maxWidth: 480, mt: 3, textAlign: 'left' }}>
        {confirmationRows.map(({ term, value, href }, index) => (
          <Stack
            key={term}
            direction="row"
            spacing={1.5}
            alignItems="baseline"
            sx={{ px: 1.5, py: 1, borderRadius: '5px', bgcolor: index % 2 === 0 ? 'action.hover' : 'background.paper' }}
          >
            <Typography variant="caption" color="text.primary" sx={{ ...draftBodySx, fontWeight: 600, width: 84, flexShrink: 0 }}>
              {term}
            </Typography>
            {href ? (
              <Link
                component="button"
                type="button"
                variant="body2"
                underline="hover"
                onClick={() => onOpen(href)}
                sx={{ ...draftBodySx, minWidth: 0, textAlign: 'left', wordBreak: 'break-word' }}
              >
                {value}
              </Link>
            ) : (
              <Typography variant="body2" sx={{ ...draftBodySx, minWidth: 0, wordBreak: 'break-word' }}>
                {value}
              </Typography>
            )}
          </Stack>
        ))}
      </Box>

      <Stack direction="row" alignItems="center" justifyContent="center" flexWrap="wrap" gap={0.5} sx={{ mt: 3 }}>
        <DsButton size="small" variant="contained" color="primary" onClick={onClose}>
          Close
        </DsButton>
        <Link
          component="button"
          type="button"
          underline="none"
          color="text.primary"
          onClick={onStartAnother}
          sx={confirmationLinkSx}
        >
          <AddCircleOutlineIcon sx={{ fontSize: 16 }} />
          {START_ANOTHER_CLAIM}
        </Link>
      </Stack>
    </Stack>
  )
}

const RAIL_TOOLS = new Set(['notes', 'email', 'newTask'])

const FNOL_TALLY_WIDTH_KEY = 'fnol-tally-width'
const FNOL_TALLY_DEFAULT = 360
const FNOL_TALLY_MIN = 280

function clampTallyWidth(value: number) {
  return Math.max(FNOL_TALLY_MIN, value)
}

function readTallyWidth() {
  if (typeof window === 'undefined') return FNOL_TALLY_DEFAULT
  const parsed = Number(window.localStorage.getItem(FNOL_TALLY_WIDTH_KEY))
  return Number.isFinite(parsed) ? clampTallyWidth(parsed) : FNOL_TALLY_DEFAULT
}

type FnolMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  pending?: boolean
  elapsedSeconds?: number
}
type LookupWhere = 'thread' | 'tally'
type FnolColumnTab = 'chat' | 'parties'

function fnolElapsedSeconds() {
  return Math.round((0.55 + Math.random() * 1.35) * 100) / 100
}

const fnolColumnTabSx = {
  minHeight: 44,
  '& .MuiTabs-scrollButtons': { width: 28 },
  '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', bgcolor: 'primary.main' },
  '& .MuiTab-root': {
    minHeight: 44,
    minWidth: 'auto',
    px: { xs: 1.25, md: 1.75 },
    py: 0.875,
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.875rem',
    fontFamily: figmaFontFamilyStack.heading,
    color: 'text.secondary',
    transition: 'color 0.2s ease',
    gap: '7px',
  },
  '& .MuiTab-root > .MuiTab-icon': { marginRight: 0 },
  '& .Mui-selected': { color: 'primary.main', fontWeight: 600 },
} as const

function messageId() {
  return `fnol-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function PartyTextField({
  label,
  value,
  onChange,
  autoFocus = false,
  endAdornment,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
  endAdornment?: ReactNode
}) {
  const id = useId()
  return (
    <Box>
      <Typography
        component="label"
        htmlFor={id}
        sx={{
          display: 'block',
          mb: 0.5,
          fontFamily: figmaFontFamilyStack.body,
          fontWeight: 500,
          fontSize: '0.875rem',
          lineHeight: 1.4,
          color: 'text.primary',
        }}
      >
        {label}
      </Typography>
      <TextField
        id={id}
        fullWidth
        variant="outlined"
        size="small"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoFocus={autoFocus}
        InputProps={endAdornment ? { endAdornment } : undefined}
      />
    </Box>
  )
}

function PartyRoleOptions({
  selected,
  onPick,
}: {
  selected: FnolPartyRole
  onPick: (role: FnolPartyRole) => void
}) {
  return (
    <Stack direction="row" role="group" aria-label="Party role" flexWrap="wrap" useFlexGap spacing={1}>
      {FNOL_PARTY_ROLES.map((option) => {
        const isSelected = option === selected
        return (
          <Chip
            key={option}
            label={option}
            clickable
            color="primary"
            variant={isSelected ? 'filled' : 'outlined'}
            aria-pressed={isSelected}
            onClick={() => onPick(option)}
            sx={{ borderRadius: '30px' }}
          />
        )
      })}
    </Stack>
  )
}

function FnolPartyForm({
  seed,
  onSubmit,
  onCancel,
  showTitle = true,
  autoFocus = true,
}: {
  seed: FnolPartyRole
  onSubmit: (party: { role: FnolPartyRole; name: string; contact: string }) => void
  onCancel: () => void
  showTitle?: boolean
  autoFocus?: boolean
}) {
  const [role, setRole] = useState<FnolPartyRole>(seed === 'Insured' ? 'Claimant' : seed)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const submit = () => {
    if (!name.trim()) return
    onSubmit({ role, name, contact })
  }
  return (
    <Stack
      spacing={1.5}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' || !(event.target instanceof HTMLInputElement)) return
        event.preventDefault()
        submit()
      }}
    >
      {showTitle ? (
        <Typography sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.875rem' }}>
          Add party
        </Typography>
      ) : null}
      <PartyRoleOptions selected={role} onPick={setRole} />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        <PartyTextField label="Name" value={name} onChange={setName} autoFocus={autoFocus} />
        <PartyTextField label="Phone or email" value={contact} onChange={setContact} />
      </Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 1 }}>
        <Button variant="contained" disabled={!name.trim()} onClick={submit}>
          Add
        </Button>
        <Button color="inherit" onClick={onCancel}>
          Cancel
        </Button>
      </Stack>
    </Stack>
  )
}

function PartyInlineEdit({
  party,
  onSave,
  onDismiss,
}: {
  party: FnolParty
  onSave: (input: { role: FnolPartyRole; name: string; contact: string }) => void
  onDismiss: () => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [role, setRole] = useState<FnolPartyRole>(party.role === 'Insured' ? 'Claimant' : party.role)
  const [name, setName] = useState(party.name)
  const [contact, setContact] = useState(party.contact ? formatFnolContact(party.contact) : '')
  const save = () => {
    if (!name.trim()) {
      onDismiss()
      return
    }
    onSave({ role, name, contact })
  }
  return (
    <Stack
      ref={rootRef}
      spacing={1.5}
      sx={{ pl: 7, pr: 2, pb: 1.5 }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onDismiss()
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
          event.preventDefault()
          save()
        }
      }}
      onBlur={() => {
        // Defer so a row click can toggle or switch edit before dismiss runs.
        requestAnimationFrame(() => {
          if (rootRef.current?.contains(document.activeElement)) return
          onDismiss()
        })
      }}
    >
      <PartyRoleOptions selected={role} onPick={setRole} />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        <PartyTextField label="Name" value={name} onChange={setName} autoFocus />
        <PartyTextField
          label="Phone or email"
          value={contact}
          onChange={setContact}
          endAdornment={
            <IconButton
              size="small"
              edge="end"
              aria-label="Save party"
              disabled={!name.trim()}
              onMouseDown={(event) => event.preventDefault()}
              onClick={save}
              sx={{ color: 'primary.main' }}
            >
              <CheckIcon sx={{ fontSize: 18 }} />
            </IconButton>
          }
        />
      </Box>
    </Stack>
  )
}

function FnolStateSelect({
  code,
  onCommit,
  onDismiss,
}: {
  code: string
  onCommit: (code: string) => void
  onDismiss: () => void
}) {
  return (
    <TextField
      select
      fullWidth
      size="small"
      value={code}
      autoFocus
      helperText="State"
      onChange={(event) => {
        if (event.target.value) onCommit(event.target.value)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onDismiss()
      }}
      SelectProps={{
        displayEmpty: true,
        defaultOpen: true,
        renderValue: (selected) => {
          const value = String(selected ?? '')
          return value ? fnolStateLabel(value) : 'State'
        },
      }}
      inputProps={{ 'aria-label': 'State' }}
      FormHelperTextProps={{ sx: { fontFamily: figmaFontFamilyStack.body, mx: 0 } }}
      sx={draftInputSx}
    >
      <MenuItem value="" disabled>
        State
      </MenuItem>
      {FNOL_STATE_CHOICES.map((state) => (
        <MenuItem key={state.code} value={state.code}>
          {state.name}
        </MenuItem>
      ))}
    </TextField>
  )
}

function UserTurn({ text }: { text: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2.5 }}>
      <Box sx={{ maxWidth: '100%', minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
          <Avatar sx={(theme) => chatAuthorAvatarSx(theme)}>CR</Avatar>
          <Typography sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.8125rem' }}>
            You
          </Typography>
        </Stack>
        <Box sx={(theme) => ({ px: 2, py: 1.5, borderRadius: 2, bgcolor: chatBubbleIncoming(theme) })}>
          <Typography sx={{ ...draftBodySx, lineHeight: 1.55, overflowWrap: 'break-word' }}>{text}</Typography>
        </Box>
      </Box>
    </Box>
  )
}

function AssistantTurn({
  text,
  pending,
  elapsedSeconds,
}: {
  text: string
  pending?: boolean
  elapsedSeconds?: number
}) {
  return (
    <Box sx={{ mb: 2.5, maxWidth: '100%', minWidth: 0 }}>
      <Typography variant="body2" sx={{ ...draftBodySx, lineHeight: 1.6, mb: 0.5, whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>
        {text}
      </Typography>
      {pending ? (
        <LinearProgress aria-label="Reading sources" sx={{ mt: 1.25, borderRadius: 1 }} />
      ) : (
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            size="small"
            aria-label="Copy response"
            onClick={() => {
              void navigator.clipboard?.writeText(text)
            }}
            sx={{ ml: -0.75 }}
          >
            <ContentCopyOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          </IconButton>
          {elapsedSeconds != null ? (
            <Typography variant="caption" color="text.secondary" sx={draftBodySx}>
              {elapsedSeconds.toFixed(2)}s
            </Typography>
          ) : null}
        </Stack>
      )}
    </Box>
  )
}

const PARTY_ROLE_VISUAL: Record<FnolPartyRole, { icon: SvgIconComponent; tone: 'blue' | 'purple' | 'teal' | 'amber' | 'lightBlue' | 'red' | 'grey' | 'green' }> = {
  Reporter: { icon: RecordVoiceOverOutlinedIcon, tone: 'blue' },
  Claimant: { icon: PersonOutlinedIcon, tone: 'purple' },
  Driver: { icon: DirectionsCarOutlinedIcon, tone: 'teal' },
  Witness: { icon: VisibilityOutlinedIcon, tone: 'amber' },
  Passenger: { icon: AirlineSeatReclineNormalOutlinedIcon, tone: 'lightBlue' },
  Injured: { icon: LocalHospitalOutlinedIcon, tone: 'red' },
  Other: { icon: MoreHorizIcon, tone: 'grey' },
  Insured: { icon: BadgeOutlinedIcon, tone: 'green' },
}

function PartiesList({
  parties,
  readOnly,
  editingId,
  onEdit,
  onRemove,
  renderEditor,
}: {
  parties: FnolParty[]
  readOnly: boolean
  editingId: string | null
  onEdit: (id: string) => void
  onRemove: (id: string) => void
  renderEditor: (party: FnolParty) => ReactNode
}) {
  if (parties.length === 0) return null
  const radius = `${layoutTokens.cardRadius}px`

  return (
    <Stack component="ul" aria-label="Parties" spacing="3px" sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {parties.map((party) => {
        const visual = PARTY_ROLE_VISUAL[party.role]
        const Icon = visual.icon
        const contact = party.contact?.trim() ? formatFnolContact(party.contact) : 'No contact'
        const editable = !readOnly && party.role !== 'Insured'
        const selected = editingId === party.id
        return (
          <Box
            key={party.id}
            component="li"
            sx={{
              borderRadius: radius,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ pr: 1 }}>
            <Box
              component={editable ? 'button' : 'div'}
              type={editable ? 'button' : undefined}
              aria-pressed={editable ? selected : undefined}
              aria-label={editable ? `Edit ${party.name}` : undefined}
              onMouseDown={
                editable
                  ? (event) => {
                      // Keep the editor from blur-dismissing before this toggle runs.
                      event.preventDefault()
                    }
                  : undefined
              }
              onClick={editable ? () => onEdit(party.id) : undefined}
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                m: 0,
                // Include former outer Stack py: 0.5 so the hit target fills the header.
                py: 1.5,
                pl: 2,
                pr: 1,
                border: 0,
                borderRadius: 1,
                bgcolor: 'transparent',
                color: 'inherit',
                textAlign: 'left',
                font: 'inherit',
                cursor: editable ? 'pointer' : 'default',
                '&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: -2 },
              }}
            >
              <Box
                sx={(theme) => {
                  const tone = theme.figmaPalette[visual.tone]
                  const isLight = theme.palette.mode === 'light'
                  return {
                    width: 32,
                    height: 32,
                    borderRadius: `${figmaBorderRadius.borderRadius}px`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    bgcolor: isLight ? tone[100] : tone[900],
                    color: isLight ? tone[800] : tone[200],
                  }
                }}
              >
                <Icon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: figmaFontFamilyStack.heading,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    lineHeight: 1.35,
                  }}
                >
                  {party.name}
                </Typography>
                <Typography sx={{ ...draftBodySx, color: 'text.secondary', fontSize: '0.8125rem', lineHeight: 1.4, mt: 0.25 }}>
                  {`${party.role} · ${contact}`}
                </Typography>
              </Box>
            </Box>
            {editable ? (
              <IconButton size="small" aria-label={`Remove ${party.name}`} onClick={() => onRemove(party.id)} sx={{ flexShrink: 0 }}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            ) : null}
            </Stack>
            {selected ? renderEditor(party) : null}
          </Box>
        )
      })}
    </Stack>
  )
}

export function FnolConversationPage() {
  const theme = useTheme()
  const stacked = useMediaQuery(theme.breakpoints.down('lg'), { noSsr: true })
  const navigate = useNavigate()
  const { activeTool, closeTool } = useRightTool()
  const [draft, setDraft] = useState(createFnolDraft)
  const [parties, setParties] = useState<FnolParty[]>([])
  const [messages, setMessages] = useState<FnolMessage[]>([
    { id: 'opening', role: 'assistant', text: FNOL_OPENING, elapsedSeconds: 0.42 },
  ])
  const [mode, setMode] = useState<FnolIntakeMode>('narrative')
  const [editing, setEditing] = useState<string | null>(null)
  const [knownOpen, setKnownOpen] = useState(false)
  const [partySeed, setPartySeed] = useState<FnolPartyRole>('Claimant')
  const [partyFormGeneration, setPartyFormGeneration] = useState(0)
  const [editingPartyId, setEditingPartyId] = useState<string | null>(null)
  // User pin for Add party; forced closed while a party row is being edited.
  const [addPartyUserOpen, setAddPartyUserOpen] = useState(true)
  const addPartyOpen = !editingPartyId && addPartyUserOpen
  const [policyLookupWhere, setPolicyLookupWhere] = useState<LookupWhere | null>(null)
  const [attachKey, setAttachKey] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [pane, setPane] = useState<'conversation' | 'tally'>('conversation')
  const [tallyWidth, setTallyWidth] = useState(readTallyWidth)
  const [columnTab, setColumnTab] = useState<FnolColumnTab>('chat')
  const threadEnd = useRef<HTMLDivElement>(null)
  const readTimer = useRef<number | null>(null)
  const activeToolRef = useRef(activeTool)
  const prevEditingPartyId = useRef<string | null>(null)
  activeToolRef.current = activeTool

  const userTurns = messages.filter((message) => message.role === 'user').length
  const started = fnolLossStarted(draft, userTurns)
  const tally = buildFnolTally(draft, parties, started)
  const canSubmit = fnolCanSubmit(draft, tally.attention)
  const suggestions = fnolSuggestions(draft, tally.attention, mode)
  const insured = draft.policy?.insured ?? null

  useRegisterRightToolRecordContext(
    { title: insured ?? 'New claim', subtitle: draft.claimNumber, kind: 'claim' },
    [insured, draft.claimNumber],
  )

  useEffect(() => {
    const tool = activeToolRef.current
    if (tool && !RAIL_TOOLS.has(tool)) closeTool()
  }, [closeTool])

  useEffect(() => {
    window.localStorage.setItem(FNOL_TALLY_WIDTH_KEY, String(tallyWidth))
  }, [tallyWidth])

  // After inline edit ends, restore Add party so +/− and Collapse stay aligned.
  useEffect(() => {
    if (prevEditingPartyId.current && !editingPartyId) {
      setAddPartyUserOpen(true)
    }
    prevEditingPartyId.current = editingPartyId
  }, [editingPartyId])

  const startTallyResize = (startX: number) => {
    const startWidth = tallyWidth
    const onMove = (event: MouseEvent) => {
      setTallyWidth(clampTallyWidth(startWidth + (startX - event.clientX)))
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ block: 'end' })
  }, [messages, policyLookupWhere])

  useEffect(
    () => () => {
      if (readTimer.current != null) window.clearTimeout(readTimer.current)
    },
    [],
  )

  const pushAssistant = (text: string) => {
    setMessages((current) => [
      ...current,
      { id: messageId(), role: 'assistant', text, elapsedSeconds: fnolElapsedSeconds() },
    ])
  }

  const showConversation = () => {
    if (stacked) setPane('conversation')
  }

  const openPartyForm = (seed: FnolPartyRole = 'Claimant') => {
    setPartySeed(seed)
    setEditingPartyId(null)
    setPartyFormGeneration((generation) => generation + 1)
    setEditing(null)
    setColumnTab('parties')
    showConversation()
  }

  const editParty = (id: string) => {
    if (submitted) return
    const party = parties.find((item) => item.id === id)
    if (!party || party.role === 'Insured') return
    setEditingPartyId((current) => (current === id ? null : id))
    setColumnTab('parties')
  }

  const showChat = () => {
    setColumnTab('chat')
    showConversation()
  }

  const applyChange = (nextDraft: typeof draft, nextParties: FnolParty[] = parties) => {
    const synced = syncFnolParties(nextDraft, nextParties)
    const captured = fnolCaptured({ draft, parties }, { draft: nextDraft, parties: synced })
    setDraft(nextDraft)
    setParties(synced)
    setEditing(null)
    if (captured.length === 0) return
    pushAssistant(fnolReply(captured, buildFnolTally(nextDraft, synced, true).attention))
  }

  const finishTurn = (
    result: { draft: typeof draft; parties: FnolParty[]; captured: string[] },
    pendingId?: string,
  ) => {
    setDraft(result.draft)
    setParties(result.parties)
    setEditing(null)
    const text = fnolReply(result.captured, buildFnolTally(result.draft, result.parties, true).attention)
    if (pendingId) {
      setMessages((current) =>
        current.map((message) =>
          message.id === pendingId
            ? { ...message, pending: false, text, elapsedSeconds: fnolElapsedSeconds() }
            : message,
        ),
      )
      return
    }
    pushAssistant(text)
  }

  const send = (raw: string, files?: CopilotAttachedFile[]) => {
    if (submitted || busy) return
    const text = raw.trim()
    const names = (files ?? []).map((file) => file.name)
    if (!text && names.length === 0) return
    const userText = text || `Attached ${names.join(', ')}`
    const userId = messageId()
    const reading = names.length > 0 && draft.policy == null && draft.description == null
    const pendingId = reading ? messageId() : undefined
    setMessages((current) => [
      ...current,
      { id: userId, role: 'user', text: userText },
      ...(pendingId
        ? [{ id: pendingId, role: 'assistant' as const, text: `Reading ${names.length === 1 ? names[0] : `${names.length} sources`}…`, pending: true }]
        : []),
    ])
    setPolicyLookupWhere(null)
    const snapshot = { draft, parties, mode }
    const apply = () => ingestFnolTurn({ ...snapshot, text, files: names })
    if (!reading) {
      finishTurn(apply())
      return
    }
    setBusy(true)
    readTimer.current = window.setTimeout(() => {
      readTimer.current = null
      setBusy(false)
      finishTurn(apply(), pendingId)
    }, 900)
  }

  const pickPolicy = (policyNumber: string) => {
    const next = assignFnolPolicy(draft, policyNumber)
    if (!next) return
    const synced = syncFnolParties(next, parties)
    setPolicyLookupWhere(null)
    finishTurn({ draft: next, parties: synced, captured: fnolCaptured({ draft, parties }, { draft: next, parties: synced }) })
  }

  const submitParty = (input: { role: FnolPartyRole; name: string; contact: string }) => {
    finishTurn(addFnolParty(draft, parties, input))
    setPartyFormGeneration((generation) => generation + 1)
  }

  const saveParty = (id: string, input: { role: FnolPartyRole; name: string; contact: string }) => {
    finishTurn(updateFnolParty(draft, parties, id, input))
    setEditingPartyId(null)
  }

  const removeParty = (id: string) => {
    const party = parties.find((item) => item.id === id)
    const result = removeFnolParty(draft, parties, id)
    setDraft(result.draft)
    setParties(result.parties)
    if (editingPartyId === id) setEditingPartyId(null)
    if (!party) return
    const next = buildFnolTally(result.draft, result.parties, true).attention[0]
    pushAssistant(next ? `Removed ${party.name}. ${fnolAsk(next.field, next.term)}` : `Removed ${party.name}.`)
  }

  const referDriver = () => {
    const next = referFnolDriver(draft)
    if (next === draft || !draft.driver) return
    const synced = syncFnolParties(next, parties)
    setDraft(next)
    setParties(synced)
    setEditing(null)
    pushAssistant(`${draft.driver.name} is referred to coverage, and a review task is on the claim.`)
  }

  const submit = () => {
    if (!canSubmit || submitted) return
    const status = draft.driver?.status === 'referred' ? 'Coverage referral' : 'Reported'
    const record = recordFromDraft(draft, status, getClaim(draft.claimNumber))
    upsertClaim({
      ...record,
      assignee: draft.assignee ?? CLAIM_CURRENT_USER,
      parties: parties.map(({ name, role, contact }) => ({ name, role, contact })),
    })
    setSubmitted(true)
    setEditing(null)
    setEditingPartyId(null)
    setPolicyLookupWhere(null)
    setColumnTab('chat')
    showConversation()
  }

  const startAnotherClaim = () => {
    setDraft(createFnolDraft())
    setParties([])
    setMessages([{ id: 'opening', role: 'assistant', text: FNOL_OPENING, elapsedSeconds: 0.42 }])
    setMode('narrative')
    setEditing(null)
    setEditingPartyId(null)
    setKnownOpen(false)
    setPartySeed('Claimant')
    setPartyFormGeneration((generation) => generation + 1)
    setPolicyLookupWhere(null)
    setAttachKey(null)
    setBusy(false)
    setSubmitted(false)
    setColumnTab('chat')
    showConversation()
    if (readTimer.current != null) {
      window.clearTimeout(readTimer.current)
      readTimer.current = null
    }
  }

  const onSuggestion = (action: string) => {
    if (submitted || busy) return
    if (action === 'Match a policy') {
      setPolicyLookupWhere('thread')
      setEditing(null)
      showChat()
      return
    }
    if (action === 'Attach a loss notice') {
      setAttachKey((current) => (current ?? 0) + 1)
      showChat()
      return
    }
    if (action === 'Caller on the phone') {
      setMode('caller')
      pushAssistant('I am on the call with you. Who is calling, and what happened?')
      showChat()
      return
    }
    if (action === 'Refer to coverage') {
      referDriver()
      return
    }
    send(action)
  }

  const onToggle = (field: string) => {
    if (submitted) return
    if (field === 'documents') {
      setAttachKey((current) => (current ?? 0) + 1)
      showChat()
      return
    }
    if (field === 'witness') {
      openPartyForm('Witness')
      return
    }
    if (field === 'policy' && draft.policy == null) {
      setPolicyLookupWhere('tally')
      setEditing(null)
      if (stacked) setPane('tally')
      return
    }
    setPolicyLookupWhere(null)
    setEditing((current) => (current === field ? null : field))
  }

  const textEdit = (
    label: string,
    value: string,
    onCommit: (next: string) => void,
    multiline = false,
    autoFocus = true,
  ) => (
    <DraftInlineTextEdit
      initialValue={value}
      label={label}
      helperText={label}
      multiline={multiline}
      confirmable={!multiline}
      autoFocus={autoFocus}
      onCommit={onCommit}
      onDismiss={() => setEditing(null)}
    />
  )

  const policyLookup = () => (
    <DraftInlineLookup
      options={FNOL_POLICY_NUMBERS}
      optionLabel={fnolPolicyLabel}
      optionSubtitle={fnolPolicySubtitle}
      searchText={fnolPolicySearch}
      placeholder="Search policy number or insured"
      onPick={pickPolicy}
      onDismiss={() => {
        setPolicyLookupWhere(null)
        setEditing(null)
      }}
    />
  )

  const renderEditor = (field: string) => {
    if (field === 'policy' || field === 'insured') return policyLookup()
    if (field === 'dateOfLoss') {
      return (
        <ClaimDateOfLossEdit
          initialValue={draft.dateOfLoss ?? ''}
          onCommit={(iso) => applyChange({ ...draft, dateOfLoss: iso })}
          onDismiss={() => setEditing(null)}
        />
      )
    }
    if (field === 'location') {
      return (
        <FnolStateSelect
          code={draft.location ?? ''}
          onCommit={(state) => applyChange({ ...draft, location: state })}
          onDismiss={() => setEditing(null)}
        />
      )
    }
    if (field === 'description') {
      return textEdit('What happened', draft.description ?? '', (description) => applyChange({ ...draft, description }), true)
    }
    if (field === 'reporter') {
      return textEdit('Reported by', draft.reporter?.name ?? '', (name) =>
        applyChange({ ...draft, reporter: { name, method: draft.reporter?.method ?? 'Phone' } }),
      )
    }
    if (field === 'claimant') {
      return textEdit('Claimant name', draft.claimant?.name ?? '', (name) =>
        applyChange({ ...draft, claimant: { name, email: draft.claimant?.email ?? null } }),
      )
    }
    if (field === 'claimantEmail') {
      const claimantParty = parties.find((party) => party.role === 'Claimant' && party.name === draft.claimant?.name)
      const current = draft.claimant?.email ?? claimantParty?.contact ?? ''
      return textEdit('Phone or email', current, (value) => {
        const claimant = draft.claimant
        if (!claimant) return
        if (value.includes('@')) {
          applyChange({ ...draft, claimant: { name: claimant.name, email: value } })
          return
        }
        finishTurn(
          claimantParty
            ? setFnolPartyContact(draft, parties, claimantParty.id, value)
            : addFnolParty(draft, parties, { role: 'Claimant', name: claimant.name, contact: value }),
        )
      })
    }
    if (field === 'driver' || field === 'driverName') {
      if (draft.driver?.status === 'off-schedule') {
        return (
          <Stack spacing={1}>
            <DraftInlineOptions
              options={['Refer to coverage']}
              selected={null}
              onPick={() => {
                referDriver()
              }}
            />
            {textEdit('Driver', draft.driver.name, (name) => {
              const trimmed = name.trim()
              if (!trimmed) return
              // Confirming a corrected driver name clears the off-schedule attention item.
              applyChange({ ...draft, driver: { name: trimmed, status: 'scheduled' } })
            })}
          </Stack>
        )
      }
      return textEdit('Driver', draft.driver?.name ?? '', (name) =>
        applyChange({ ...draft, driver: { name, status: draft.driver?.status === 'referred' ? 'referred' : 'scheduled' } }),
      )
    }
    if (field === 'airbag') {
      return (
        <DraftInlineOptions
          options={['Yes', 'No', 'Unknown']}
          selected={draft.airbag === 'deployed' ? 'Yes' : draft.airbag === 'not deployed' ? 'No' : draft.airbag === 'unknown' ? 'Unknown' : null}
          onPick={(label) => {
            const airbag = label === 'Yes' ? 'deployed' : label === 'No' ? 'not deployed' : 'unknown'
            applyChange(setFnolAirbag(draft, airbag))
          }}
        />
      )
    }
    if (field === 'policeReport') {
      return textEdit('Police report', draft.policeReport === 'None filed' ? '' : (draft.policeReport ?? ''), (policeReport) =>
        applyChange({ ...draft, policeReport }),
      )
    }
    if (field === 'damage') {
      return (
        <Stack spacing={1}>
          {textEdit(
            'What was damaged',
            '',
            (value) => {
              const trimmed = value.trim()
              if (!trimmed) return
              applyChange(applyFnolDamageAnswer(draft, trimmed))
            },
            false,
            true,
          )}
          {textEdit(
            'Who was hurt',
            draft.injuries ?? '',
            (value) => {
              const trimmed = value.trim()
              if (!trimmed) return
              applyChange({ ...draft, injuries: trimmed })
            },
            false,
            false,
          )}
        </Stack>
      )
    }
    if (field === 'injuries') {
      return textEdit('Injuries', draft.injuries ?? '', (injuries) => applyChange({ ...draft, injuries }), true)
    }
    if (field === 'assignee') {
      return (
        <DraftInlineLookup
          options={ASSIGNEE_OPTIONS}
          optionLabel={(name) => (name === CLAIM_CURRENT_USER ? `${name} (you)` : name)}
          placeholder="Search people or queues"
          onPick={(assignee) => applyChange({ ...draft, assignee })}
          onDismiss={() => setEditing(null)}
        />
      )
    }
    if (field.startsWith('vehicle:')) {
      const index = Number(field.slice('vehicle:'.length))
      const current = draft.vehicles[index] ?? ''
      return textEdit('Damage', current.replace(/^Vehicle · /, '').replace(/^Property · /, ''), (value) => {
        const vehicles = draft.vehicles.map((entry, entryIndex) => (entryIndex === index ? value : entry))
        applyChange({ ...draft, vehicles })
      })
    }
    if (field.startsWith('contact:')) {
      const id = field.slice('contact:'.length)
      const party = parties.find((item) => item.id === id)
      if (!party) return null
      return textEdit('Phone or email', party.contact ?? '', (contact) => finishTurn(setFnolPartyContact(draft, parties, id, contact)))
    }
    return null
  }

  const partyForm = submitted ? null : (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: `${layoutTokens.cardRadius}px`,
        bgcolor: 'background.paper',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{ pl: 2, pr: 1.5, py: 1.5, gap: 1.25 }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconButton
            size="small"
            aria-label={addPartyOpen ? 'Collapse Add party' : 'Expand Add party'}
            aria-expanded={addPartyOpen}
            onClick={() => {
              if (editingPartyId) {
                setEditingPartyId(null)
                setAddPartyUserOpen(true)
                return
              }
              setAddPartyUserOpen((open) => !open)
            }}
            sx={{ color: 'primary.main' }}
          >
            {addPartyOpen ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: figmaFontFamilyStack.heading,
              fontWeight: 600,
              fontSize: '0.875rem',
              lineHeight: 1.35,
              color: 'text.primary',
            }}
          >
            Add party
          </Typography>
          <Typography sx={{ ...draftBodySx, color: 'text.secondary', fontSize: '0.8125rem', lineHeight: 1.4, mt: 0.25 }}>
            Role, name, and how to reach them
          </Typography>
        </Box>
      </Stack>
      <Collapse in={addPartyOpen} unmountOnExit={false}>
        <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5 }}>
          <FnolPartyForm
            key={`${partySeed}-${partyFormGeneration}`}
            seed={partySeed}
            showTitle={false}
            autoFocus={addPartyOpen && !editingPartyId}
            onSubmit={submitParty}
            onCancel={() => setPartyFormGeneration((generation) => generation + 1)}
          />
        </Box>
      </Collapse>
    </Box>
  )

  const selectColumnTab = (next: FnolColumnTab) => {
    setColumnTab(next)
  }

  const conversationVisible = !stacked || pane === 'conversation'
  const tallyVisible = !stacked || pane === 'tally'

  const pageHeader = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1.5}
      sx={{ px: `${layoutTokens.contentPaddingX}px`, pt: layoutTokens.policyHeaderTopPadding, pb: 1.25, flexShrink: 0 }}
    >
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
        <EntityListHomeButton to="/claims" label="All claims" icon={FileCopyOutlinedIcon} tone="submissions" />
        <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              component="h1"
              sx={{
                fontFamily: figmaFontFamilyStack.heading,
                fontWeight: 600,
                lineHeight: 1.3,
                fontSize: { xs: '1rem', md: '1.0625rem' },
                color: 'text.primary',
              }}
            >
            First notice of loss
          </Typography>
          <Typography sx={{ ...draftBodySx, color: 'text.secondary' }} noWrap>
            {`${draft.claimNumber} · ${insured ?? 'Policy not matched'}`}
          </Typography>
        </Box>
      </Stack>
      {submitted ? null : (
        <Button variant="contained" disabled={!canSubmit || busy} onClick={submit} sx={{ flexShrink: 0 }}>
          Submit claim
        </Button>
      )}
    </Stack>
  )

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      {stacked ? pageHeader : null}

      {stacked ? (
        <Tabs
          value={pane}
          onChange={(_, next: 'conversation' | 'tally') => setPane(next)}
          aria-label="FNOL sections"
          sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 40, px: 1 }}
        >
          <Tab value="conversation" label="Conversation" sx={{ textTransform: 'none', minHeight: 40 }} />
          <Tab value="tally" label={`Tally (${tally.attention.length})`} sx={{ textTransform: 'none', minHeight: 40 }} />
        </Tabs>
      ) : null}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: stacked ? 'minmax(0, 1fr)' : `minmax(0, 1fr) ${tallyWidth}px`,
          gridTemplateRows: 'minmax(0, 1fr)',
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            minHeight: 0,
            display: conversationVisible ? 'flex' : 'none',
            flexDirection: 'column',
            borderRight: stacked ? 0 : 1,
            borderColor: 'divider',
          }}
        >
          {stacked ? null : pageHeader}
          <Box sx={sectionTabRowBorderSx}>
            <Box sx={{ px: `${layoutTokens.contentPaddingX}px`, minHeight: 44, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
              <Tabs
                value={columnTab}
                onChange={(_, next: FnolColumnTab) => selectColumnTab(next)}
                aria-label="FNOL conversation"
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={fnolColumnTabSx}
              >
                <Tab icon={<ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Chat" value="chat" />
                <Tab icon={<GroupsOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Parties" value="parties" />
              </Tabs>
            </Box>
          </Box>
          {columnTab === 'parties' ? (
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: `${layoutTokens.contentPaddingX}px`, py: 2.5 }}>
              <Stack spacing={1.5}>
                <PartiesList
                  parties={parties}
                  readOnly={submitted}
                  editingId={editingPartyId}
                  onEdit={editParty}
                  onRemove={removeParty}
                  renderEditor={(party) => (
                    <PartyInlineEdit
                      key={party.id}
                      party={party}
                      onSave={(input) => saveParty(party.id, input)}
                      onDismiss={() => setEditingPartyId((current) => (current === party.id ? null : current))}
                    />
                  )}
                />
                {partyForm}
              </Stack>
            </Box>
          ) : submitted ? (
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: `${layoutTokens.contentPaddingX}px`, py: 2.5 }}>
              <FnolSubmitConfirmation
                draft={draft}
                insuredName={insured}
                onClose={() => navigate('/claims')}
                onStartAnother={startAnotherClaim}
                onOpen={(path) => navigate(path)}
              />
            </Box>
          ) : (
            <>
          <Box role="log" aria-live="polite" aria-relevant="additions" aria-busy={busy} sx={{ flex: '1 1 auto', minHeight: 140, overflowY: 'auto', px: `${layoutTokens.contentPaddingX}px`, py: 2.5 }}>
            {messages.map((message) =>
              message.role === 'user' ? (
                <UserTurn key={message.id} text={message.text} />
              ) : (
                <AssistantTurn
                  key={message.id}
                  text={message.text}
                  pending={message.pending}
                  elapsedSeconds={message.elapsedSeconds}
                />
              ),
            )}
            {policyLookupWhere === 'thread' ? <Box sx={{ maxWidth: 480, mb: 2 }}>{policyLookup()}</Box> : null}
            <Box ref={threadEnd} />
          </Box>
          <Box sx={{ flexShrink: 0, px: `${layoutTokens.contentPaddingX}px`, pb: 2 }}>
            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1 }}>
              <Stack spacing={1.25}>
                {mode === 'caller' ? (
                  <MuiChip label="Caller on the phone" onDelete={() => setMode('narrative')} sx={{ alignSelf: 'flex-start' }} />
                ) : null}
                <CopilotQuickActions actions={busy ? [] : suggestions} onAction={onSuggestion} />
                <CopilotComposer
                  padded={false}
                  minRows={2}
                  showDisclaimer={false}
                  showModeSelector={false}
                  placeholder={mode === 'caller' ? 'Who is calling, and what happened?' : 'Describe the loss, or attach a notice.'}
                  attachRequestKey={attachKey}
                  onSubmit={send}
                />
              </Stack>
            </Box>
          </Box>
            </>
          )}
        </Box>

        <Box
          component="aside"
          aria-label="Running tally"
          sx={{
            position: 'relative',
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
            display: tallyVisible ? 'flex' : 'none',
            flexDirection: 'column',
            bgcolor: 'background.paper',
          }}
        >
          {stacked ? null : (
            <Box
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize running tally"
              aria-valuenow={tallyWidth}
              aria-valuemin={FNOL_TALLY_MIN}
              tabIndex={0}
              onMouseDown={(event) => startTallyResize(event.clientX)}
              onKeyDown={(event) => {
                if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
                event.preventDefault()
                const delta = event.key === 'ArrowLeft' ? 16 : -16
                setTallyWidth((current) => clampTallyWidth(current + delta))
              }}
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 6,
                cursor: 'col-resize',
                zIndex: 2,
                transform: 'translateX(-50%)',
                '&:hover, &:active, &:focus-visible': {
                  bgcolor: (t) => t.figmaPalette.blue[200],
                },
              }}
            />
          )}
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <Box sx={{ px: 2, pt: layoutTokens.policyHeaderTopPadding, pb: 1 }}>
              <Typography sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '1rem' }}>
                Running tally
              </Typography>
              <Typography sx={{ ...draftBodySx, color: 'text.secondary', fontSize: '0.8125rem' }}>
                Known facts, needs attention, and considerations update as you talk.
              </Typography>
            </Box>
            {policyLookupWhere === 'tally' ? <Box sx={{ px: 2, pb: 1.5 }}>{policyLookup()}</Box> : null}
            <Box sx={{ px: draftPanelPx }}>
              <DraftAccordions
                known={tally.known}
                attention={tally.attention}
                considerations={tally.considerations}
                editingField={submitted ? null : editing}
                knownOpen={knownOpen}
                onKnownOpenChange={setKnownOpen}
                onToggle={onToggle}
                onGroupToggle={() => setEditing(null)}
                renderEditor={renderEditor}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default FnolConversationPage
