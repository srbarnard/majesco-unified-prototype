import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Box from '@mui/material/Box'
import MuiButton from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Button } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type QuoteWizardFooterProps = {
  stepIndex: number
  onBack: () => void
  onContinue: () => void
  continueLabel?: string
  continueDisabled?: boolean
  showContinue?: boolean
}

export function QuoteWizardFooter({
  stepIndex,
  onBack,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
  showContinue = true,
}: QuoteWizardFooterProps) {
  return (
    <Box
      sx={{
        px: `${layoutTokens.contentPaddingX}px`,
        py: 2,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        flexShrink: 0,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        {stepIndex > 0 ? (
          <MuiButton
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{
              textTransform: 'none',
              fontFamily: figmaFontFamilyStack.body,
              color: 'text.primary',
            }}
          >
            Back
          </MuiButton>
        ) : (
          <Box />
        )}
        {showContinue && (
          <Button variant="contained" color="primary" disabled={continueDisabled} onClick={onContinue}>
            {continueLabel}
          </Button>
        )}
      </Stack>
    </Box>
  )
}
