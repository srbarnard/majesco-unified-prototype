import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { Button } from '@/design-system/components'
import { filterFooterButtonSx } from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { ClaimRecord } from '@/pages/claims/data/claimsStore'

export function DiscardClaimDialog({
  claim,
  onClose,
  onConfirm,
}: {
  claim: ClaimRecord | null
  onClose: () => void
  onConfirm: (claim: ClaimRecord) => void
}) {
  return (
    <Dialog open={claim != null} onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
      <DialogTitle sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '1.125rem', pb: 1 }}>
        Discard draft claim?
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', lineHeight: 1.5 }}
        >
          {claim ? `${claim.claimNumber} · ${claim.insured} will be removed from Claims. This can't be undone.` : null}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
        <Button variant="outlined" color="inherit" onClick={onClose} sx={filterFooterButtonSx}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => claim && onConfirm(claim)}
          sx={{ ...filterFooterButtonSx, fontWeight: 600 }}
        >
          Discard
        </Button>
      </DialogActions>
    </Dialog>
  )
}
