import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useRightTool } from '@/app/contexts/RightToolContext'
import { useRegisterRightToolRecordContext } from '@/app/hooks/useRightToolRegistration'
import { CopilotQuickActions, EntityListHomeButton } from '@/design-system/components'
import { chatAuthorAvatarSx, chatBubbleIncoming, sectionTabRowBorderSx } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { layoutTokens } from '@/design-system/tokens/layout'
import { ClaimDateOfLossEdit } from '@/pages/claims/components/ClaimLossEditors'
import { getClaim, upsertClaim } from '@/pages/claims/data/claimsStore'
import {
  CLAIM_CURRENT_USER,
  CLAIM_QUEUES,
  recordFromDraft,
} from '@/pages/claims/data/createClaimDraft'
import {
  FNOL_OPENING,
  FNOL_PARTY_ROLES,
  FNOL_POLICY_NUMBERS,
  addFnolParty,
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
  fnolStateFromText,
  fnolStateLabel,
  fnolSuggestions,
  ingestFnolTurn,
  referFnolDriver,
  removeFnolParty,
  setFnolAirbag,
  setFnolPartyContact,
  syncFnolParties,
  type FnolIntakeMode,
  type FnolParty,
  type FnolPartyRole,
} from '@/pages/claims/data/fnolConversation'
import { CopilotComposer } from '@/pages/policies/components/CopilotComposer'
import type { CopilotAttachedFile } from '@/pages/policies/components/CopilotComposer'
import {
  DraftAccordions,
  DraftInlineLookup,
  DraftInlineOptions,
  DraftInlineTextEdit,
  draftBodySx,
} from '@/pages/shared/components/DraftDrawer'
import { ADD_TASK_ASSIGNEES } from '@/pages/tasks/data/addTaskDraft'

const ASSIGNEE_OPTIONS = [
  CLAIM_CURRENT_USER,
  ...CLAIM_QUEUES,
  ...ADD_TASK_ASSIGNEES.filter((name) => name !== CLAIM_CURRENT_USER && !/queue/i.test(name)),
]

const RAIL_TOOLS = new Set(['notes', 'email', 'newTask'])

type FnolMessage = { id: string; role: 'user' | 'assistant'; text: string; pending?: boolean }
type LookupWhere = 'thread' | 'tally'
type FnolColumnTab = 'chat' | 'parties'

/** Outlined field with the label inside the border, including when it floats. */
const partyFieldSx = {
  '& .MuiInputLabel-root.MuiInputLabel-shrink': {
    transform: 'translate(14px, 4px) scale(0.75)',
  },
  '& .MuiOutlinedInput-input': {
    paddingTop: '18px',
    paddingBottom: '6px',
  },
} as const

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

function FnolPartyForm({
  seed,
  onSubmit,
  onCancel,
}: {
  seed: FnolPartyRole
  onSubmit: (party: { role: FnolPartyRole; name: string; contact: string }) => void
  onCancel: () => void
}) {
  const [role, setRole] = useState<FnolPartyRole>(seed === 'Insured' ? 'Claimant' : seed)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: `${layoutTokens.cardRadius}px`, p: 1.5 }}>
      <Typography sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.875rem', mb: 1 }}>
        Add party
      </Typography>
      <DraftInlineOptions options={[...FNOL_PARTY_ROLES]} selected={role} onPick={(next) => setRole(next as FnolPartyRole)} />
      <Stack spacing={1.5} sx={{ mt: 1.25 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
          sx={partyFieldSx}
          slotProps={{ input: { notched: false } }}
        />
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          label="Phone or email"
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          sx={partyFieldSx}
          slotProps={{ input: { notched: false } }}
        />
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="contained"
            disabled={!name.trim()}
            onClick={() => onSubmit({ role, name, contact })}
          >
            Add party
          </Button>
          <Button size="small" color="inherit" onClick={onCancel}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
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

function AssistantTurn({ text, pending }: { text: string; pending?: boolean }) {
  return (
    <Box sx={{ mb: 2.5, maxWidth: '100%', minWidth: 0 }}>
      <Typography variant="body2" sx={{ ...draftBodySx, lineHeight: 1.6, mb: 0.5, whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>
        {text}
      </Typography>
      {pending ? (
        <LinearProgress aria-label="Reading sources" sx={{ mt: 1.25, borderRadius: 1 }} />
      ) : (
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
      )}
    </Box>
  )
}

function PartiesList({
  parties,
  readOnly,
  onRemove,
}: {
  parties: FnolParty[]
  readOnly: boolean
  onRemove: (id: string) => void
}) {
  if (parties.length === 0) {
    return (
      <Typography sx={{ ...draftBodySx, color: 'text.secondary' }}>
        No parties yet — add one here.
      </Typography>
    )
  }

  return (
    <Box
      component="ul"
      aria-label="Parties"
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        border: 1,
        borderColor: 'divider',
        borderRadius: `${layoutTokens.cardRadius}px`,
      }}
    >
      {parties.map((party) => (
        <Stack
          key={party.id}
          component="li"
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ px: 1.5, py: 0.75, '& + &': { borderTop: 1, borderColor: 'divider' } }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.8125rem' }}>
              {party.name}
            </Typography>
            <Typography sx={{ ...draftBodySx, color: 'text.secondary', fontSize: '0.75rem' }}>{party.role}</Typography>
            <Typography sx={{ ...draftBodySx, color: 'text.secondary', fontSize: '0.75rem' }}>
              {party.contact || 'No contact'}
            </Typography>
          </Box>
          {readOnly || party.role === 'Insured' ? null : (
            <IconButton size="small" aria-label={`Remove ${party.name}`} onClick={() => onRemove(party.id)}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Stack>
      ))}
    </Box>
  )
}

export function FnolConversationPage() {
  const theme = useTheme()
  const stacked = useMediaQuery(theme.breakpoints.down('lg'), { noSsr: true })
  const navigate = useNavigate()
  const { activeTool, closeTool } = useRightTool()
  const [draft, setDraft] = useState(createFnolDraft)
  const [parties, setParties] = useState<FnolParty[]>([])
  const [messages, setMessages] = useState<FnolMessage[]>([{ id: 'opening', role: 'assistant', text: FNOL_OPENING }])
  const [mode, setMode] = useState<FnolIntakeMode>('narrative')
  const [editing, setEditing] = useState<string | null>(null)
  const [knownOpen, setKnownOpen] = useState(false)
  const [addingParty, setAddingParty] = useState(false)
  const [partySeed, setPartySeed] = useState<FnolPartyRole>('Claimant')
  const [policyLookupWhere, setPolicyLookupWhere] = useState<LookupWhere | null>(null)
  const [attachKey, setAttachKey] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [pane, setPane] = useState<'conversation' | 'tally'>('conversation')
  const [columnTab, setColumnTab] = useState<FnolColumnTab>('chat')
  const threadEnd = useRef<HTMLDivElement>(null)
  const readTimer = useRef<number | null>(null)
  const activeToolRef = useRef(activeTool)
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
    threadEnd.current?.scrollIntoView({ block: 'end' })
  }, [messages, addingParty, policyLookupWhere])

  useEffect(
    () => () => {
      if (readTimer.current != null) window.clearTimeout(readTimer.current)
    },
    [],
  )

  const pushAssistant = (text: string) => {
    setMessages((current) => [...current, { id: messageId(), role: 'assistant', text }])
  }

  const showConversation = () => {
    if (stacked) setPane('conversation')
  }

  const openPartyForm = (seed: FnolPartyRole = 'Claimant') => {
    setPartySeed(seed)
    setAddingParty(true)
    setEditing(null)
    setColumnTab('parties')
    showConversation()
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
      setMessages((current) => current.map((message) => (message.id === pendingId ? { ...message, pending: false, text } : message)))
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
    setAddingParty(false)
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
    setAddingParty(false)
    finishTurn(addFnolParty(draft, parties, input))
  }

  const removeParty = (id: string) => {
    const party = parties.find((item) => item.id === id)
    const result = removeFnolParty(draft, parties, id)
    setDraft(result.draft)
    setParties(result.parties)
    if (!party) return
    const next = buildFnolTally(result.draft, result.parties, true).attention[0]
    pushAssistant(next ? `Removed ${party.name}. ${fnolAsk(next.field, next.term)}` : `Removed ${party.name}.`)
  }

  const referDriver = () => {
    const next = referFnolDriver(draft)
    if (next === draft || !draft.driver) return
    setDraft(next)
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
    setAddingParty(false)
    setEditing(null)
    const owner = draft.assignee === CLAIM_CURRENT_USER || !draft.assignee ? 'you' : draft.assignee
    pushAssistant(`Claim ${draft.claimNumber} is submitted and assigned to ${owner}. Open it to continue handling.`)
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
    if (field === 'damage') {
      pushAssistant('What was damaged, or who was hurt?')
      showChat()
      setEditing(null)
      return
    }
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

  const textEdit = (label: string, value: string, onCommit: (next: string) => void, multiline = false) => (
    <DraftInlineTextEdit
      initialValue={value}
      label={label}
      helperText={label}
      multiline={multiline}
      confirmable={!multiline}
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
      return textEdit('State', draft.location ? fnolStateLabel(draft.location) : '', (value) => {
        const state = fnolStateFromText(value)
        if (!state) {
          setEditing(null)
          return
        }
        applyChange({ ...draft, location: state })
      })
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
            <DraftInlineOptions options={['Refer to coverage']} selected={null} onPick={referDriver} />
            {textEdit('Driver', draft.driver.name, (name) => applyChange({ ...draft, driver: { ...draft.driver!, name } }))}
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

  const partyForm =
    addingParty && !submitted ? (
      <FnolPartyForm key={partySeed} seed={partySeed} onSubmit={submitParty} onCancel={() => setAddingParty(false)} />
    ) : null

  const selectColumnTab = (next: FnolColumnTab) => {
    setColumnTab(next)
    if (next === 'parties' && parties.length === 0 && !submitted) {
      setPartySeed('Claimant')
      setAddingParty(true)
      setEditing(null)
    }
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
      {submitted ? (
        <Button variant="contained" onClick={() => navigate(`/claims/${encodeURIComponent(draft.claimNumber)}`)} sx={{ flexShrink: 0 }}>
          Open claim
        </Button>
      ) : (
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
          gridTemplateColumns: stacked ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) 360px',
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
                {submitted ? null : (
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<PersonAddOutlinedIcon sx={{ fontSize: 18 }} />}
                    onClick={() => openPartyForm()}
                    disabled={busy}
                    sx={{
                      ...draftBodySx,
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                      alignSelf: 'flex-start',
                      px: 0.75,
                      ml: -0.75,
                      color: 'text.primary',
                    }}
                  >
                    Add party
                  </Button>
                )}
                <PartiesList parties={parties} readOnly={submitted} onRemove={removeParty} />
                {partyForm}
              </Stack>
            </Box>
          ) : (
            <>
          <Box role="log" aria-live="polite" aria-relevant="additions" aria-busy={busy} sx={{ flex: '1 1 auto', minHeight: 140, overflowY: 'auto', px: `${layoutTokens.contentPaddingX}px`, py: 2.5 }}>
            {messages.map((message) =>
              message.role === 'user' ? (
                <UserTurn key={message.id} text={message.text} />
              ) : (
                <AssistantTurn key={message.id} text={message.text} pending={message.pending} />
              ),
            )}
            {policyLookupWhere === 'thread' ? <Box sx={{ maxWidth: 480, mb: 2 }}>{policyLookup()}</Box> : null}
            <Box ref={threadEnd} />
          </Box>
          <Box sx={{ flexShrink: 0, px: `${layoutTokens.contentPaddingX}px`, pt: 1, pb: 2, borderTop: 1, borderColor: 'divider' }}>
            {submitted ? (
              <Button variant="contained" onClick={() => navigate(`/claims/${encodeURIComponent(draft.claimNumber)}`)}>
                Open claim
              </Button>
            ) : (
              <Stack spacing={1.25}>
                {mode === 'caller' ? (
                  <Chip label="Caller on the phone" onDelete={() => setMode('narrative')} sx={{ alignSelf: 'flex-start' }} />
                ) : null}
                <CopilotQuickActions actions={busy ? [] : suggestions} onAction={onSuggestion} />
                {canSubmit ? (
                  <Button variant="contained" disabled={busy} onClick={submit} sx={{ alignSelf: 'flex-start' }}>
                    Submit claim
                  </Button>
                ) : null}
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
            )}
          </Box>
            </>
          )}
        </Box>

        <Box
          component="aside"
          aria-label="Running tally"
          sx={{
            minWidth: 0,
            minHeight: 0,
            overflowY: 'auto',
            display: tallyVisible ? 'block' : 'none',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ px: 2, pt: layoutTokens.policyHeaderTopPadding, pb: 1 }}>
            <Typography sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '1rem' }}>
              Running tally
            </Typography>
            <Typography sx={{ ...draftBodySx, color: 'text.secondary', fontSize: '0.8125rem' }}>
              Known facts, needs attention, and considerations update as you talk.
            </Typography>
          </Box>
          {policyLookupWhere === 'tally' ? <Box sx={{ px: 2, pb: 1.5 }}>{policyLookup()}</Box> : null}
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
  )
}

export default FnolConversationPage
