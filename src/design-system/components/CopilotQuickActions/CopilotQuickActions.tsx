import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { getFigmaColors } from '@/design-system/tokens/figma-colors'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

export type CopilotQuickActionsProps = {
  actions: string[]
  onAction?: (action: string) => void
  /** Section label above the list. Pass `null` to hide. */
  label?: ReactNode | null
  /** Optional start icon for the first action only (e.g. send). */
  firstActionIcon?: ReactNode
}

/**
 * Follow-up prompts styled for continued engagement — text + corner arrow,
 * not pill chips. Inspired by conversational suggestion lists (e.g. Grok).
 */
export function CopilotQuickActions({
  actions,
  onAction,
  label = 'Suggested actions',
  firstActionIcon,
}: CopilotQuickActionsProps) {
  if (actions.length === 0) return null

  return (
    <Stack spacing={0.25} sx={{ width: '100%' }}>
      {label != null && (
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{
            fontFamily: figmaFontFamilyStack.body,
            fontWeight: 600,
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
      )}
      <Stack spacing={0.125} alignItems="stretch" sx={{ width: '100%' }}>
        {actions.map((action, index) => (
          <Button
            key={action}
            fullWidth
            size="small"
            variant="text"
            disableRipple
            startIcon={
              index === 0 && firstActionIcon ? (
                firstActionIcon
              ) : (
                <SubdirectoryArrowRightIcon sx={{ fontSize: '18px !important' }} />
              )
            }
            onClick={() => onAction?.(action)}
            sx={(theme) => ({
              justifyContent: 'flex-start',
              textAlign: 'left',
              textTransform: 'none',
              fontFamily: figmaFontFamilyStack.body,
              fontWeight: 400,
              fontSize: '0.875rem',
              lineHeight: 1.45,
              letterSpacing: 0,
              color: 'text.primary',
              px: 1,
              py: 0.875,
              minHeight: 0,
              borderRadius: 1.5,
              border: 'none',
              boxShadow: 'none',
              transition: 'background-color 0.15s ease, color 0.15s ease',
              '& .MuiButton-startIcon': {
                marginRight: 1,
                marginLeft: 0,
                color: 'text.secondary',
                transition: 'color 0.15s ease',
              },
              '&:hover': {
                // Mode-aware primary wash — avoid accentSubtle (near-white) in dark mode.
                bgcolor: getFigmaColors(theme.palette.mode).primary.hover,
                color: 'primary.main',
                boxShadow: 'none',
                '& .MuiButton-startIcon': {
                  color: 'primary.main',
                },
              },
              '&:active': {
                bgcolor: getFigmaColors(theme.palette.mode).primary.selected,
              },
            })}
          >
            {action}
          </Button>
        ))}
      </Stack>
    </Stack>
  )
}
