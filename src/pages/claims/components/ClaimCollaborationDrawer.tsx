import AddIcon from '@mui/icons-material/Add'
import ChecklistIcon from '@mui/icons-material/Checklist'
import CloseIcon from '@mui/icons-material/Close'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import SearchIcon from '@mui/icons-material/Search'
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import {
  featureNameById,
  type ClaimDetailModel,
  type ClaimParty,
  type CollabDocument,
  type CollabEmail,
  type CollabNote,
  type CollabTask,
} from '@/pages/claims/data/claimDetailCatalog'
import { sc } from '@/pages/claims/data/sentenceCase'
import { figmaBorderRadius } from '@/design-system/tokens/figma-border-radius'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { layoutTokens } from '@/design-system/tokens/layout'

export type CollabKind = 'tasks' | 'notes' | 'emails' | 'documents' | 'parties'

const cardSx = { border: 1, borderColor: 'divider', borderRadius: `${figmaBorderRadius.borderRadius}px`, p: 1.5 } as const

function countLabel(kind: CollabKind, tasks: CollabTask[], notes: CollabNote[], emails: CollabEmail[], documents: CollabDocument[]) {
  if (kind === 'tasks') return tasks.filter((task) => task.status !== 'Completed').length
  if (kind === 'notes') return notes.length
  if (kind === 'emails') return emails.length
  if (kind === 'documents') return documents.length
  return 0
}

export function ClaimCollaborationDrawer({
  open,
  kind,
  featureId,
  detail,
  onClose,
  onKind,
  onClearFeature,
}: {
  open: boolean
  kind: CollabKind
  featureId: string | null
  detail: ClaimDetailModel
  onClose: () => void
  onKind: (kind: CollabKind) => void
  onClearFeature: () => void
}) {
  const [tasks, setTasks] = useState(detail.tasks)
  const [notes, setNotes] = useState(detail.notes)
  const [emails, setEmails] = useState(detail.emails)
  const [documents, setDocuments] = useState(detail.documents)
  const [query, setQuery] = useState('')
  const [taskView, setTaskView] = useState<'pending' | 'completed' | 'all'>('pending')
  const [emailView, setEmailView] = useState<'all' | 'inbox' | 'sent'>('all')
  const [selected, setSelected] = useState<string[]>([])
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const [draftTo, setDraftTo] = useState('')

  const scoped = <T extends { featureId?: string | null }>(rows: T[]) =>
    featureId ? rows.filter((row) => row.featureId === featureId) : rows

  const q = query.trim().toLowerCase()
  const matches = (parts: Array<string | number | undefined>) => !q || parts.join(' ').toLowerCase().includes(q)

  const visibleTasks = useMemo(() => {
    const rows = scoped(tasks).filter((task) =>
      matches([task.description, task.status, task.assignedTo, task.dueLabel, ...task.tags, featureNameById(detail, task.featureId)]),
    )
    if (taskView === 'pending') return rows.filter((task) => task.status !== 'Completed')
    if (taskView === 'completed') return rows.filter((task) => task.status === 'Completed')
    return rows
  }, [tasks, taskView, query, featureId, detail])

  const visibleNotes = scoped(notes).filter((note) =>
    matches([note.text, note.author, note.date, ...note.tags, featureNameById(detail, note.featureId)]),
  )
  const visibleEmails = emails.filter((email) => {
    if (featureId) {
      const feature = detail.features.find((item) => item.id === featureId)
      if (feature && !email.featureLabel.toLowerCase().includes(feature.displayName.split(' - ')[1]?.toLowerCase() ?? '___')) return false
    }
    if (emailView === 'inbox' && email.direction !== 'Inbound') return false
    if (emailView === 'sent' && email.direction !== 'Outbound') return false
    return matches([email.subject, email.sender, email.recipients, email.preview, email.featureLabel, ...email.tags])
  })
  const visibleDocuments = scoped(documents).filter((document) =>
    matches([document.name, document.type, document.uploadedBy, document.date, featureNameById(detail, document.featureId)]),
  )

  const resetDraft = () => {
    setAdding(false)
    setDraft('')
    setDraftTo('')
  }

  const saveDraft = () => {
    const text = draft.trim()
    if (!text && kind !== 'documents') return
    if (kind === 'tasks' && text) {
      setTasks((current) => [
        {
          id: `task-${Date.now()}`,
          status: 'Open',
          description: text,
          assignedTo: detail.owner,
          dueLabel: 'No due date',
          tags: ['Claim'],
          featureId,
        },
        ...current,
      ])
    }
    if (kind === 'notes' && text) {
      setNotes((current) => [
        { id: `note-${Date.now()}`, author: detail.owner, date: 'Just now', text, tags: ['Claim'], featureId },
        ...current,
      ])
    }
    if (kind === 'emails' && text) {
      setEmails((current) => [
        {
          id: `email-${Date.now()}`,
          subject: text,
          sender: detail.owner,
          recipients: draftTo.trim() || detail.insured,
          timestamp: 'Just now',
          direction: 'Outbound',
          featureLabel: featureId ? featureNameById(detail, featureId) : 'Claim level',
          preview: draftTo.trim() ? `To ${draftTo.trim()}` : 'Sent from the claim.',
          status: 'Sent',
          tags: ['Claim'],
          attachmentCount: 0,
        },
        ...current,
      ])
    }
    if (kind === 'documents' && text) {
      setDocuments((current) => [
        {
          id: `doc-${Date.now()}`,
          name: text,
          type: 'Document',
          uploadedBy: detail.owner,
          date: 'Just now',
          tags: ['Claim'],
          featureId,
        },
        ...current,
      ])
    }
    resetDraft()
  }

  const toggleSelected = (id: string) =>
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))

  const completeSelected = () => {
    setTasks((current) => current.map((task) => (selected.includes(task.id) ? { ...task, status: 'Completed' } : task)))
    setSelected([])
  }

  const title =
    kind === 'parties' ? 'Parties' : `Collaboration - ${kind === 'emails' ? 'Email' : kind === 'tasks' ? 'Tasks' : kind === 'notes' ? 'Notes' : 'Documents'}`

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 520 },
            right: { lg: `${layoutTokens.toolRailWidth}px` },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="h2" sx={{ flex: 1, fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '1rem' }}>
          {title}
        </Typography>
        <IconButton aria-label="Close collaboration" onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
      {kind !== 'parties' ? (
        <Tabs
          value={kind}
          onChange={(_, next: CollabKind) => {
            onKind(next)
            setQuery('')
            setSelected([])
            resetDraft()
          }}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { minWidth: 0, px: 0.5, minHeight: 48 } }}
        >
          <Tab value="tasks" icon={<ChecklistIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Tasks (${countLabel('tasks', tasks, notes, emails, documents)})`} />
          <Tab value="notes" icon={<StickyNote2OutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Notes (${countLabel('notes', tasks, notes, emails, documents)})`} />
          <Tab value="emails" icon={<MailOutlineIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Email (${countLabel('emails', tasks, notes, emails, documents)})`} />
          <Tab value="documents" icon={<DescriptionOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Documents (${countLabel('documents', tasks, notes, emails, documents)})`} />
        </Tabs>
      ) : null}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1.5 }}>
        {kind === 'parties' ? (
          <PartyList parties={detail.parties} />
        ) : (
          <Stack spacing={1.5}>
            <TextField
              size="small"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              aria-label={`Search ${kind}`}
              slotProps={{ input: { startAdornment: <SearchIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} /> } }}
            />
            {featureId ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2">Showing {featureNameById(detail, featureId)} only</Typography>
                <Button size="small" onClick={onClearFeature}>
                  Show whole claim
                </Button>
              </Stack>
            ) : null}
            {kind === 'tasks' ? (
              <TextField select size="small" label="Showing" value={taskView} onChange={(event) => setTaskView(event.target.value as typeof taskView)}>
                <MenuItem value="pending">Pending tasks</MenuItem>
                <MenuItem value="completed">Completed tasks</MenuItem>
                <MenuItem value="all">All tasks</MenuItem>
              </TextField>
            ) : null}
            {kind === 'emails' ? (
              <TextField select size="small" label="Showing" value={emailView} onChange={(event) => setEmailView(event.target.value as typeof emailView)}>
                <MenuItem value="all">All email</MenuItem>
                <MenuItem value="inbox">Inbox</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
              </TextField>
            ) : null}
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              {kind === 'tasks' && selected.length > 0 ? (
                <Button size="small" onClick={completeSelected}>
                  Mark as complete
                </Button>
              ) : null}
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setAdding((open) => !open)}>
                {kind === 'tasks' ? 'Create task' : kind === 'notes' ? 'Add note' : kind === 'emails' ? 'New email' : 'Attach documents'}
              </Button>
            </Stack>
            {adding ? (
              <Stack spacing={1} sx={cardSx}>
                {kind === 'emails' ? (
                  <TextField size="small" label="To" value={draftTo} onChange={(event) => setDraftTo(event.target.value)} />
                ) : null}
                <TextField
                  size="small"
                  label={kind === 'emails' ? 'Subject' : kind === 'documents' ? 'Document name' : kind === 'tasks' ? 'Task name' : 'Note'}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  multiline={kind === 'notes'}
                  minRows={kind === 'notes' ? 3 : 1}
                />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" onClick={resetDraft}>
                    Cancel
                  </Button>
                  <Button size="small" variant="contained" onClick={saveDraft} disabled={!draft.trim()}>
                    Save
                  </Button>
                </Stack>
              </Stack>
            ) : null}
            {kind === 'tasks'
              ? visibleTasks.map((task) => (
                  <RecordCard
                    key={task.id}
                    title={task.description}
                    meta={`${task.assignedTo} · Date due ${task.dueLabel}`}
                    status={task.status}
                    tags={[...task.tags.map(sc), featureNameById(detail, task.featureId)]}
                    checked={selected.includes(task.id)}
                    onCheck={() => toggleSelected(task.id)}
                  />
                ))
              : null}
            {kind === 'notes'
              ? visibleNotes.map((note) => (
                  <RecordCard
                    key={note.id}
                    title={note.text}
                    meta={`${note.author} · ${note.date}`}
                    tags={[...note.tags.map(sc), featureNameById(detail, note.featureId)]}
                  />
                ))
              : null}
            {kind === 'emails'
              ? visibleEmails.map((email) => (
                  <RecordCard
                    key={email.id}
                    title={email.subject}
                    meta={`To: ${email.recipients} · ${email.timestamp}`}
                    body={`From ${email.sender}. ${email.preview}`}
                    status={sc(email.status)}
                    tags={[...email.tags.map(sc), email.featureLabel]}
                  />
                ))
              : null}
            {kind === 'documents'
              ? visibleDocuments.map((document) => (
                  <RecordCard
                    key={document.id}
                    title={document.name}
                    meta={`${document.uploadedBy} · ${document.date}`}
                    body={sc(document.type)}
                    tags={[...document.tags.map(sc), featureNameById(detail, document.featureId)]}
                  />
                ))
              : null}
            {kind === 'tasks' && visibleTasks.length === 0 ? <Empty /> : null}
            {kind === 'notes' && visibleNotes.length === 0 ? <Empty /> : null}
            {kind === 'emails' && visibleEmails.length === 0 ? <Empty /> : null}
            {kind === 'documents' && visibleDocuments.length === 0 ? <Empty /> : null}
          </Stack>
        )}
      </Box>
    </Drawer>
  )
}

function RecordCard({
  title,
  meta,
  body,
  status,
  tags,
  checked,
  onCheck,
}: {
  title: string
  meta: string
  body?: string
  status?: string
  tags: string[]
  checked?: boolean
  onCheck?: () => void
}) {
  return (
    <Box sx={{ ...cardSx, display: 'flex', gap: 1 }}>
      {onCheck ? <Checkbox size="small" checked={checked} onChange={onCheck} inputProps={{ 'aria-label': `Select ${title}` }} sx={{ p: 0.25 }} /> : null}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {status ? <Chip size="small" label={status} variant="outlined" /> : null}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {meta}
        </Typography>
        {body ? (
          <Typography variant="body2" sx={{ mt: 0.75 }}>
            {body}
          </Typography>
        ) : null}
        <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
          {tags.filter((tag) => tag && tag !== 'Claim level').map((tag) => (
            <Chip key={tag} size="small" label={tag} variant="outlined" />
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

function PartyList({ parties }: { parties: ClaimParty[] }) {
  if (parties.length === 0) return <Empty />
  return (
    <Stack spacing={1}>
      {parties.map((party) => (
        <Box key={`${party.name}-${party.role}-${party.feature}`} sx={cardSx}>
          <Stack direction="row" spacing={1} alignItems="center">
            <GroupsOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {party.name}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {`${sc(party.role)} · ${sc(party.type)} · ${party.contact}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {party.feature}
          </Typography>
        </Box>
      ))}
    </Stack>
  )
}

function Empty() {
  return (
    <Typography variant="body2" color="text.secondary">
      Nothing in this view yet.
    </Typography>
  )
}
