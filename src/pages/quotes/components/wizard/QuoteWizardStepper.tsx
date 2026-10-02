import CheckIcon from '@mui/icons-material/Check'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { keyframes } from '@mui/material/styles'
import { useEffect, useRef, useState } from 'react'
import { isDarkMode } from '@/design-system/theme/themeSurfaces'
import { QUOTE_WIZARD_STEPS } from '@/pages/quotes/data/quoteWizardTypes'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { motionTokens } from '@/design-system/tokens/motion'

type QuoteWizardStepperProps = {
  activeStep: number
  onStepClick?: (step: number) => void
  compact?: boolean
}

const STEP_LINE_MS = 520
const STEP_POP_MS = 650
/** Fire the arrive pop as the line visually reaches the next step (ease-out finishes softly after). */
const STEP_ARRIVE_AT_MS = Math.round(STEP_LINE_MS * 0.78)
const ELASTIC_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
const motionSafe = '@media (prefers-reduced-motion: no-preference)'

/** Elastic settle after the progress line connects — mirrors Chat confidence hover feel. */
const stepArrivePop = keyframes`
  0% { transform: scale(1); }
  18% { transform: scale(1.48); }
  40% { transform: scale(0.92); }
  62% { transform: scale(1.16); }
  82% { transform: scale(0.98); }
  100% { transform: scale(1); }
`

const stepHoverBounce = keyframes`
  0% { transform: scale(1); }
  45% { transform: scale(1.42); }
  62% { transform: scale(1.12); }
  78% { transform: scale(1.26); }
  90% { transform: scale(1.18); }
  100% { transform: scale(1.2); }
`

export function QuoteWizardStepper({ activeStep, onStepClick, compact = false }: QuoteWizardStepperProps) {
  const prevActiveStep = useRef(activeStep)
  const popClearTimerRef = useRef<number | null>(null)
  const [poppingIndex, setPoppingIndex] = useState<number | null>(null)
  const indicatorSize = compact ? 24 : 28
  /** Room for elastic scale (~1.48 peak) so edge circles aren’t clipped by the scrollport. */
  const scalePadPx = Math.ceil(indicatorSize * 0.3) + 4

  useEffect(() => {
    if (activeStep > prevActiveStep.current) {
      const arrivingIndex = activeStep
      const lineTimer = window.setTimeout(() => {
        setPoppingIndex(arrivingIndex)
        if (popClearTimerRef.current) window.clearTimeout(popClearTimerRef.current)
        popClearTimerRef.current = window.setTimeout(() => {
          setPoppingIndex(null)
          popClearTimerRef.current = null
        }, STEP_POP_MS)
      }, STEP_ARRIVE_AT_MS)
      prevActiveStep.current = activeStep
      return () => {
        window.clearTimeout(lineTimer)
        if (popClearTimerRef.current) {
          window.clearTimeout(popClearTimerRef.current)
          popClearTimerRef.current = null
        }
      }
    }
    prevActiveStep.current = activeStep
  }, [activeStep])

  return (
    <Box
      className="quote-wizard-stepper"
      sx={{
        flex: compact ? 1 : undefined,
        minWidth: 0,
        py: `${scalePadPx}px`,
        my: compact ? `-${scalePadPx}px` : 0,
        // Compact lives in the header: keep overflow visible so edge scales aren’t clipped.
        // Non-compact can scroll horizontally on narrow viewports.
        overflowX: compact ? 'visible' : 'auto',
        overflowY: 'visible',
        px: compact ? `${scalePadPx}px` : `${layoutTokens.contentPaddingX}px`,
        ...(compact
          ? {}
          : {
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
        sx={{
          minWidth: compact ? 480 : 720,
          overflow: 'visible',
        }}
      >
        {QUOTE_WIZARD_STEPS.map((step, index) => {
          const completed = index < activeStep
          const active = index === activeStep
          const clickable = index <= activeStep
          const isPopping = poppingIndex === index

          return (
            <Stack
              key={step.id}
              direction="row"
              alignItems="center"
              sx={{ flex: index < QUOTE_WIZARD_STEPS.length - 1 ? 1 : '0 0 auto', overflow: 'visible' }}
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
                  overflow: 'visible',
                  '@media (hover: hover)': clickable
                    ? {
                        [motionSafe]: {
                          '&:hover .quote-step-indicator': {
                            animation: `${stepHoverBounce} 0.65s ${ELASTIC_EASE} forwards`,
                          },
                        },
                      }
                    : undefined,
                }}
              >
                <Box
                  sx={{
                    width: indicatorSize,
                    height: indicatorSize,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    overflow: 'visible',
                  }}
                >
                  <Box
                    className="quote-step-indicator"
                    sx={(theme) => ({
                      width: indicatorSize,
                      height: indicatorSize,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
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
                      transform: 'scale(1)',
                      transformOrigin: 'center',
                      willChange: 'transform',
                      transition: `transform 0.5s ${ELASTIC_EASE}, background-color ${motionTokens.durationMs}ms ${motionTokens.easing}, color ${motionTokens.durationMs}ms ${motionTokens.easing}`,
                      [motionSafe]: isPopping
                        ? {
                            animation: `${stepArrivePop} ${STEP_POP_MS}ms ${ELASTIC_EASE} both`,
                          }
                        : undefined,
                    })}
                  >
                    {completed ? <CheckIcon sx={{ fontSize: compact ? 14 : 16 }} /> : index + 1}
                  </Box>
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
                    transition: `color ${motionTokens.durationMs}ms ${motionTokens.easing}`,
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
                    bgcolor: theme.palette.divider,
                    overflow: 'hidden',
                    position: 'relative',
                  })}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'primary.main',
                      borderRadius: 'inherit',
                      transformOrigin: 'left center',
                      transform: index < activeStep ? 'scaleX(1)' : 'scaleX(0)',
                      [motionSafe]: {
                        transition: `transform ${STEP_LINE_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
                      },
                    }}
                  />
                </Box>
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
}

export function QuoteWizardPageHeader({
  activeStep,
  onStepClick,
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
        overflow: 'visible',
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
      <Box sx={{ flex: 1, minWidth: 0, px: { xs: 1.5, md: 3, lg: 4 }, overflow: 'visible' }}>
        <QuoteWizardStepper activeStep={activeStep} onStepClick={onStepClick} compact />
      </Box>
    </Stack>
  )
}
