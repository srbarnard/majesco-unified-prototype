import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { Button } from '@/design-system/components'
import { filterFooterButtonSx } from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { QuoteWizardFormField } from '@/pages/quotes/components/wizard/QuoteWizardFormField'
import type { SubmissionListRecord } from '@/pages/submissions/data/mockSubmissions'

type DiscardSubmissionDialogProps = {
  open: boolean
  submissions: SubmissionListRecord[]
  onClose: () => void
  onConfirm: (reason: string) => void
}

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

export function DiscardSubmissionDialog({
  open,
  submissions,
  onClose,
  onConfirm,
}: DiscardSubmissionDialogProps) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (open) setReason('')
  }, [open])

  const count = submissions.length
  const primary = submissions[0]
  const canConfirm = Boolean(reason.trim() && count > 0)

  const heading =
    count > 1 ? `Discard ${count} submissions?` : 'Discard submission?'

  const description =
    count > 1
      ? `These submissions will be removed from the queue. Enter a reason to continue.`
      : primary
        ? `${primary.submissionNumber} · ${primary.insuredName} will be removed from the queue. Enter a reason to continue.`
        : 'This submission will be removed from the queue. Enter a reason to continue.'

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm(reason.trim())
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: figmaFontFamilyStack.heading,
          fontWeight: 600,
          fontSize: '1.125rem',
          pb: 1,
        }}
      >
        {heading}
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ ...bodySx, fontSize: '0.8125rem', lineHeight: 1.5, mb: 2 }}
        >
          {description}
        </Typography>
        <QuoteWizardFormField
          label="Reason"
          value={reason}
          onChange={setReason}
          placeholder="Why is this being discarded?"
          multiline
          minRows={3}
          fullWidth
          autoFocus
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
        <Button variant="outlined" color="inherit" onClick={onClose} sx={filterFooterButtonSx}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={!canConfirm}
          onClick={handleConfirm}
          sx={{ ...filterFooterButtonSx, fontWeight: 600 }}
        >
          Discard
        </Button>
      </DialogActions>
    </Dialog>
  )
}
