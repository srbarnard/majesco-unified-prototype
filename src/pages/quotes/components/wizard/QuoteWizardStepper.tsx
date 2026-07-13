import CheckIcon from '@mui/icons-material/Check'
import Box from '@mui/material/Box'
import MuiButton from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { CopilotIcon } from '@/design-system/components'
import { getPanelToggleButtonStyles, isDarkMode } from '@/design-system/theme/themeSurfaces'
import { QUOTE_WIZARD_STEPS } from '@/pages/quotes/data/quoteWizardTypes'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type QuoteWizardStepperProps = {
  activeStep: number
  onStepClick?: (step: number) => void
  compact?: boolean
}

export function QuoteWizardStepper({ activeStep, onStepClick, compact = false }: QuoteWizardStepperProps) {
  return (
    <Box
      sx={{
        flex: compact ? 1 : undefined,
        minWidth: 0,
        overflowX: 'auto',
        ...(compact
          ? {}
          : {
              px: `${layoutTokens.contentPaddingX}px`,
              py: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }),
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0}
        sx={{ minWidth: compact ? 480 : 720 }}
      >
        {QUOTE_WIZARD_STEPS.map((step, index) => {
          const completed = index < activeStep
          const active = index === activeStep
          const clickable = index <= activeStep

          return (
            <Stack
              key={step.id}
              direction="row"
              alignItems="center"
              sx={{ flex: index < QUOTE_WIZARD_STEPS.length - 1 ? 1 : '0 0 auto' }}
            >
              <Stack
                component={clickable ? 'button' : 'div'}
                type={clickable ? 'button' : undefined}
                direction="row"
                alignItems="center"
                spacing={compact ? 0.75 : 1}
                onClick={clickable ? () => onStepClick?.(index) : undefined}
                sx={{
                  border: 0,
                  bgcolor: 'transparent',
                  cursor: clickable ? 'pointer' : 'default',
                  p: 0,
                  textAlign: 'left',
                }}
              >
                <Box
                  sx={(theme) => ({
                    width: compact ? 24 : 28,
                    height: compact ? 24 : 28,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    fontFamily: figmaFontFamilyStack.heading,
                    fontWeight: 600,
                    fontSize: compact ? '0.75rem' : '0.8125rem',
                    bgcolor:
                      completed || active
                        ? 'primary.main'
                        : isDarkMode(theme)
                          ? theme.figmaPalette.grey[800]
                          : theme.figmaPalette.grey[100],
                    color:
                      completed || active
                        ? 'primary.contrastText'
                        : isDarkMode(theme)
                          ? theme.figmaPalette.grey[400]
                          : theme.figmaPalette.grey[600],
                    border: 'none',
                  })}
                >
                  {completed ? <CheckIcon sx={{ fontSize: compact ? 14 : 16 }} /> : index + 1}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: figmaFontFamilyStack.body,
                    fontWeight: active ? 600 : 400,
                    fontSize: compact ? '0.75rem' : '0.875rem',
                    color: active ? 'primary.main' : completed ? 'text.primary' : 'text.secondary',
                    whiteSpace: 'nowrap',
                    display: { xs: active ? 'block' : 'none', lg: 'block' },
                  }}
                >
                  {step.label}
                </Typography>
              </Stack>
              {index < QUOTE_WIZARD_STEPS.length - 1 && (
                <Box
                  sx={(theme) => ({
                    flex: 1,
                    height: 2,
                    mx: compact ? 0.75 : 1,
                    minWidth: compact ? 16 : 24,
                    borderRadius: 1,
                    bgcolor: index < activeStep ? 'primary.main' : theme.palette.divider,
                  })}
                />
              )}
            </Stack>
          )
        })}
      </Stack>
    </Box>
  )
}

type QuoteWizardPageHeaderProps = {
  activeStep: number
  onStepClick?: (step: number) => void
  copilotOpen: boolean
  onToggleCopilot: () => void
}

function PanelToggleButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon: ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <MuiButton
      size="small"
      variant="text"
      disableRipple
      startIcon={icon}
      onClick={onClick}
      sx={(theme) => ({
        ...getPanelToggleButtonStyles(theme, active),
        fontFamily: figmaFontFamilyStack.body,
        flexShrink: 0,
        '& .MuiButton-startIcon': {
          marginRight: { xs: 0, sm: 0.75 },
          overflow: 'visible',
          color: 'inherit',
        },
        '& .panel-toggle-label': {
          display: { xs: 'none', sm: 'inline' },
        },
      })}
    >
      <span className="panel-toggle-label">{label}</span>
    </MuiButton>
  )
}

export function QuoteWizardPageHeader({
  activeStep,
  onStepClick,
  copilotOpen,
  onToggleCopilot,
}: QuoteWizardPageHeaderProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={{ xs: 1.5, lg: 2 }}
      sx={{
        px: `${layoutTokens.contentPaddingX}px`,
        pt: layoutTokens.policyHeaderTopPadding,
        pb: 1.5,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        flexShrink: 0,
        minWidth: 0,
      }}
    >
      <Typography
        variant="h5"
        component="h1"
        sx={{
          fontFamily: figmaFontFamilyStack.heading,
          fontWeight: 600,
          fontSize: { xs: '1.25rem', md: '1.375rem' },
          lineHeight: 1.3,
          flexShrink: 0,
        }}
      >
        New quote
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <QuoteWizardStepper activeStep={activeStep} onStepClick={onStepClick} compact />
      </Box>
      <PanelToggleButton
        label="Copilot"
        icon={<CopilotIcon size={18} active={copilotOpen} />}
        active={copilotOpen}
        onClick={onToggleCopilot}
      />
    </Stack>
  )
}
