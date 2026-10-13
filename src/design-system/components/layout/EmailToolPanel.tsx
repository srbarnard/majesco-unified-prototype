import CloseIcon from '@mui/icons-material/Close'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { useRightTool, type RightToolRecordContext } from '@/app/contexts/RightToolContext'
import { Button } from '@/design-system/components/Button'
import { CopilotQuickActions } from '@/design-system/components/CopilotQuickActions'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import {
  AttachedDocumentChips,
  DocumentAttachPanelContent,
  documentViewerAttachLabels,
  getAttachPanelSubtitle,
  targetLabels,
  type DocumentAttachMode,
  type DocumentAttachSentFields,
} from '@/pages/policies/components/DocumentAttachComposer'
import { copilotDrawerHeadingSx, copilotSubtitleSx } from '@/pages/policies/components/copilot/copilotDrawerStyles'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'
import {
  INSURED_DIRECTORY,
  PRODUCER_DIRECTORY,
  insuredFor,
  producerFor,
  suggestedRecipients,
  type EmailRecipient,
} from '@/pages/shared/data/emailRecipients'
import { EmailRecipientPicker } from '@/design-system/components/layout/EmailRecipientPicker'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const emptyEmailAttachMode: DocumentAttachMode = { target: 'email', documents: [] }

type EmailStarter = {
  label: string
  to: string
  subject: string
  body: string
  /** Asks who it goes to (typeahead of producers or insureds) before the form. */
  pick?: EmailRecipient['role']
}

/** The record's own producer or insured leads the list. */
function directoryFor(role: EmailRecipient['role'], recordContext: RightToolRecordContext) {
  const directory = role === 'Producer' ? PRODUCER_DIRECTORY : INSURED_DIRECTORY
  const own = role === 'Producer' ? producerFor(recordContext?.title) : insuredFor(recordContext?.title)
  return own ? [own, ...directory.filter((entry) => entry.email !== own.email)] : directory
}

type SentEmail = DocumentAttachSentFields & {
  documents: PolicyDocument[]
  wayOut: { label: string; onReturn: () => void }
}

/** Common sends for the empty Email drawer; tailored to the page's record when there is one. */
function buildStarters(recordContext: RightToolRecordContext): EmailStarter[] {
  const about = recordContext
    ? recordContext.subtitle
      ? `${recordContext.title} · ${recordContext.subtitle}`
      : recordContext.title
    : null
  const producer = producerFor(recordContext?.title)
  const greeting = (name?: string) => `Hi ${name ?? 'there'},`
  const aboutLine = about ? `A quick update on ${about}.` : 'A quick update from underwriting.'

  return [
    {
      label: 'Email the producer',
      to: '',
      subject: about ? `Update · ${about}` : 'Update from underwriting',
      body: `${greeting()}\n\n${aboutLine}\n\n\n\nBest regards`,
      pick: 'Producer',
    },
    {
      label: 'Email the insured',
      to: '',
      subject: about ? `Your policy · ${about}` : 'An update on your coverage',
      body: `${greeting()}\n\n${aboutLine}\n\n\n\nBest regards`,
      pick: 'Insured',
    },
    {
      label: 'Email for missing info',
      to: producer?.email ?? '',
      subject: about ? `Information needed · ${about}` : 'Information needed',
      body: `${greeting(producer?.name)}\n\nTo keep this moving, we still need:\n\n• \n\nCould you send it over when you have a moment?\n\nBest regards`,
    },
  ]
}

/** Email tool — starts from common sends, keeps the opener's context, and confirms after Send. */
export function EmailToolPanel() {
  const { recordContext, emailAttachMode, closeTool, setEmailAttachMode } = useRightTool()
  const attachMode = emailAttachMode?.target === 'email' ? emailAttachMode : emptyEmailAttachMode
  const hasDocuments = attachMode.documents.length > 0
  const draft = attachMode.draft
  const contextLabel = recordContext
    ? recordContext.subtitle
      ? `${recordContext.title} · ${recordContext.subtitle}`
      : recordContext.title
    : undefined
  const [starter, setStarter] = useState<EmailStarter | null>(null)
  const [recipient, setRecipient] = useState<{ name?: string; email: string } | null>(null)
  const [picking, setPicking] = useState<EmailStarter | null>(null)
  const [sent, setSent] = useState<SentEmail | null>(null)

  // A new send (another page or drawer opening Email) starts over.
  useEffect(() => {
    setStarter(null)
    setRecipient(null)
    setPicking(null)
    setSent(null)
  }, [emailAttachMode])

  const chooseStarter = (label: string) => {
    const next = buildStarters(recordContext).find((item) => item.label === label) ?? null
    if (next?.pick) {
      setPicking((current) => (current?.label === next.label ? null : next))
      return
    }
    setPicking(null)
    setRecipient(null)
    setStarter(next)
  }

  const pickRecipient = (picked: { name?: string; email: string }) => {
    setRecipient(picked)
    setStarter(picking)
    setPicking(null)
  }

  /** Drafts handed over for one send are dropped on exit; a page's registered document stays. */
  const oneShot = Boolean(attachMode.draft || attachMode.onSave || attachMode.onCancel)
  const releaseDraft = () => {
    if (oneShot) setEmailAttachMode(null)
  }

  const clearDraftAndClose = () => {
    const onCancel = sent ? undefined : attachMode.onCancel
    releaseDraft()
    if (onCancel) {
      onCancel()
    } else {
      closeTool()
    }
  }

  const handleSave = (_: DocumentAttachMode, fields: DocumentAttachSentFields) => {
    const { onSave, returnTo } = attachMode
    // Openers with their own confirmation (Submissions) take over straight away.
    if (onSave && !returnTo) {
      setEmailAttachMode(null)
      onSave(fields)
      return
    }
    onSave?.(fields)
    setSent({
      ...fields,
      documents: attachMode.documents,
      wayOut: returnTo ?? {
        label: recordContext?.kind ? `Back to ${recordContext.kind}` : 'Close',
        onReturn: closeTool,
      },
    })
  }

  const leaveConfirmation = () => {
    const wayOut = sent?.wayOut
    releaseDraft()
    wayOut?.onReturn()
  }

  const starting = !draft && !hasDocuments && !attachMode.readOnly
  const recipients = attachMode.recipients ?? suggestedRecipients(recordContext?.title)
  const starterLabels = buildStarters(recordContext).map((item) => item.label)
  const split = picking ? starterLabels.indexOf(picking.label) + 1 : starterLabels.length

  const startingIntro = (
    <Box>
      <Typography variant="subtitle1" sx={{ ...copilotSubtitleSx, lineHeight: 1.35, mb: 0.75 }}>
        Start an email
      </Typography>
      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, color: 'text.primary' }}>
        {contextLabel
          ? `Send an email about ${contextLabel}. Write it here, or start from a suggested action below.`
          : 'Send an email to a producer, an insured, or anyone else. Write it here, or start from a suggested action below.'}
      </Typography>
    </Box>
  )

  const startingShortcuts = (
    <Box>
      <Divider sx={{ mb: 2 }} />
      <CopilotQuickActions label="Suggested actions" actions={starterLabels.slice(0, split)} onAction={chooseStarter} />
      {picking?.pick ? (
        <Box sx={{ my: 1 }}>
          <EmailRecipientPicker
            key={picking.pick}
            role={picking.pick}
            recipients={directoryFor(picking.pick, recordContext)}
            onPick={pickRecipient}
            onDismiss={() => setPicking(null)}
          />
        </Box>
      ) : null}
      <CopilotQuickActions label={null} actions={starterLabels.slice(split)} onAction={chooseStarter} />
    </Box>
  )

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
        sx={{
          px: `${layoutTokens.contentPaddingX}px`,
          pt: layoutTokens.policyHeaderTopPadding,
          pb: 0.5,
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle1"
            component="h2"
            sx={{
              ...copilotDrawerHeadingSx,
              lineHeight: 1.35,
              mb: draft?.subtitle || hasDocuments || contextLabel ? 0.25 : 0,
            }}
          >
            {draft?.title ?? documentViewerAttachLabels.email ?? targetLabels.email}
          </Typography>
          {draft?.subtitle || hasDocuments || contextLabel ? (
            <Typography variant="caption" color="text.secondary" sx={bodySx}>
              {draft?.subtitle
                ? draft.subtitle
                : hasDocuments
                  ? getAttachPanelSubtitle(attachMode)
                  : contextLabel}
            </Typography>
          ) : null}
        </Box>
        <IconButton size="small" onClick={clearDraftAndClose} aria-label="Close Email" sx={{ mt: -0.25 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box
        sx={{
          px: `${layoutTokens.contentPaddingX}px`,
          pt: 0.75,
          pb: layoutTokens.contentPaddingX / 8,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: sent ? 'auto' : 'hidden',
        }}
      >
        {sent ? (
          <Stack alignItems="center" sx={{ pt: 4, pb: 2, textAlign: 'center' }}>
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
              <MarkEmailReadOutlinedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="subtitle1" sx={{ ...copilotSubtitleSx, lineHeight: 1.35 }}>
              Email sent
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, mt: 0.5, wordBreak: 'break-word' }}>
              {`Delivered to ${sent.to.trim()}`}
            </Typography>

            <Box
              sx={{
                width: '100%',
                mt: 3,
                p: 2,
                textAlign: 'left',
                border: 1,
                borderColor: 'divider',
                borderRadius: `${layoutTokens.cardRadius}px`,
              }}
            >
              <Stack spacing={1}>
                {[
                  ['To', sent.to.trim()],
                  ['Subject', sent.subject.trim()],
                ].map(([term, value]) => (
                  <Stack key={term} direction="row" spacing={1.5} alignItems="baseline">
                    <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, width: 56, flexShrink: 0 }}>
                      {term}
                    </Typography>
                    <Typography variant="body2" sx={{ ...bodySx, minWidth: 0, wordBreak: 'break-word' }}>
                      {value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              {sent.body.trim() ? (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      ...bodySx,
                      whiteSpace: 'pre-line',
                      wordBreak: 'break-word',
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {sent.body.trim().replace(/\n{2,}/g, '\n')}
                  </Typography>
                </>
              ) : null}
              {sent.documents.length > 0 ? <AttachedDocumentChips documents={sent.documents} placement="below" /> : null}
            </Box>

            <Button size="small" variant="contained" color="primary" onClick={leaveConfirmation} sx={{ mt: 3 }}>
              Close
            </Button>
          </Stack>
        ) : (
          <DocumentAttachPanelContent
            attachMode={attachMode}
            contextLabel={contextLabel}
            saveLabel={draft?.saveLabel}
            readOnly={Boolean(attachMode.readOnly)}
            recipients={recipients}
            header={starting ? startingIntro : undefined}
            afterFields={starting ? startingShortcuts : undefined}
            {...(draft
              ? {
                  initialTo: draft.to,
                  initialSubject: draft.subject,
                  initialBody: draft.body,
                }
              : starter
                ? {
                    initialTo: recipient?.email ?? starter.to,
                    initialSubject: starter.subject,
                    initialBody: recipient?.name
                      ? starter.body.replace(/^Hi there,/, `Hi ${recipient.name},`)
                      : starter.body,
                  }
                : {})}
            onCancel={clearDraftAndClose}
            onSave={handleSave}
          />
        )}
      </Box>
    </Box>
  )
}
