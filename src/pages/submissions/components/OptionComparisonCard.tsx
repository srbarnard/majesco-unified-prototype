import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { CopilotQuickActions } from '@/design-system/components'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { copilotSectionHeadingSx } from '@/pages/policies/components/copilot/copilotDrawerStyles'
import {
  COPILOT_REVEAL_ACTIONS_ATTR,
  COPILOT_REVEAL_ATTR,
} from '@/pages/policies/components/copilot/copilotReveal'
import { buildStructureCompareWhyDiffer } from '@/pages/submissions/data/producerRequestEmail'
import type { PremiumEstimate } from '@/pages/submissions/data/mockSubmissions'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

/** Horizontal padding for data columns (~12px). First column uses pl: 0 to align with section copy. */
const cellPadSx = {
  px: 1.5,
  py: 0.75,
  verticalAlign: 'top' as const,
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.8125rem',
  lineHeight: 1.45,
  fontWeight: 400,
}

const rowLabelSx = {
  ...cellPadSx,
  pl: 0,
  pr: 1.5,
  textAlign: 'left' as const,
  color: 'text.secondary',
  fontWeight: 500,
  whiteSpace: 'nowrap' as const,
}

const EMAIL_QUOTE_ACTION = 'Email quote options'
const DECLINE_ACTION = 'Email decline to quote'

export type OptionComparisonCardProps = {
  options: PremiumEstimate[]
  recommendedLabel: PremiumEstimate['label'] | null
  includedLabels: PremiumEstimate['label'][]
  onEmailSelected: () => void
  onDeclineToQuote: () => void
}

function formatPremium(range: string) {
  return range.replace(/\s*-\s*/g, '–')
}

function stanceLabel(label: PremiumEstimate['label']) {
  if (label === 'Optimized') return 'Leaner terms'
  if (label === 'Balanced') return 'Std deductibles'
  return 'More load'
}

function fitLabel(label: PremiumEstimate['label']) {
  if (label === 'Optimized') return 'Tight for file'
  if (label === 'Balanced') return 'Best fit'
  return 'More limit'
}

/** Display-only option comparison — plain table reply, not a card. */
export function OptionComparisonCard({
  options,
  recommendedLabel,
  includedLabels,
  onEmailSelected,
  onDeclineToQuote,
}: OptionComparisonCardProps) {
  const compared = options.filter((option) => includedLabels.includes(option.label))
  const canCompare = compared.length >= 2

  const recommendedAmongCompared =
    compared.find((option) => option.label === recommendedLabel) ?? compared[0] ?? null

  const whyDiffer =
    canCompare && recommendedAmongCompared
      ? buildStructureCompareWhyDiffer(recommendedAmongCompared, compared)
      : []

  const followUpActions = [
    ...(compared.length > 0 ? [EMAIL_QUOTE_ACTION] : []),
    DECLINE_ACTION,
  ]

  return (
    <Box {...{ [COPILOT_REVEAL_ATTR]: '' }} sx={{ minWidth: 0 }}>
      {!canCompare ? (
        <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, mb: 1.5 }}>
          Select at least two options to compare.
        </Typography>
      ) : (
        <>
          <Box
            sx={{
              width: '100%',
              overflowX: 'auto',
              mb: 1.5,
              bgcolor: 'transparent',
            }}
          >
            <Box
              component="table"
              sx={{
                borderCollapse: 'collapse',
                tableLayout: 'auto',
                width: 'max-content',
                minWidth: '100%',
              }}
            >
              <Box component="thead">
                <Box component="tr">
                  <Box
                    component="th"
                    scope="col"
                    sx={{
                      ...rowLabelSx,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  {compared.map((option) => {
                    const isRecommended = option.label === recommendedLabel
                    return (
                      <Box
                        component="th"
                        scope="col"
                        key={option.label}
                        sx={{
                          ...cellPadSx,
                          textAlign: 'left',
                          color: 'text.secondary',
                          fontWeight: 500,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {option.label}
                        {isRecommended ? '*' : ''}
                      </Box>
                    )
                  })}
                </Box>
              </Box>
              <Box component="tbody">
                <CompareRow label="Premium">
                  {compared.map((option) => (
                    <Box
                      component="td"
                      key={option.label}
                      sx={{
                        ...cellPadSx,
                        color: 'text.primary',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatPremium(option.range)}
                    </Box>
                  ))}
                </CompareRow>
                <CompareRow label="Stance">
                  {compared.map((option) => (
                    <Box
                      component="td"
                      key={option.label}
                      sx={{ ...cellPadSx, color: 'text.primary', whiteSpace: 'nowrap' }}
                    >
                      {stanceLabel(option.label)}
                    </Box>
                  ))}
                </CompareRow>
                <CompareRow label="Fit">
                  {compared.map((option) => (
                    <Box
                      component="td"
                      key={option.label}
                      sx={{ ...cellPadSx, color: 'text.primary', whiteSpace: 'nowrap' }}
                    >
                      {fitLabel(option.label)}
                    </Box>
                  ))}
                </CompareRow>
                <CompareRow label="Package">
                  {compared.map((option) => (
                    <Box
                      component="td"
                      key={option.label}
                      sx={{ ...cellPadSx, color: 'text.primary', whiteSpace: 'nowrap' }}
                    >
                      yes
                    </Box>
                  ))}
                </CompareRow>
              </Box>
            </Box>
          </Box>

          {whyDiffer.length > 0 ? (
            <>
              <Typography variant="body2" sx={{ ...copilotSectionHeadingSx, mb: 1 }}>
                Why they differ
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2 }}>
                {whyDiffer.map((line) => (
                  <Typography
                    component="li"
                    variant="body2"
                    color="text.primary"
                    key={line}
                    sx={{ ...bodySx, mb: 0.5 }}
                  >
                    {line}
                  </Typography>
                ))}
              </Box>
            </>
          ) : null}
        </>
      )}

      <Stack {...{ [COPILOT_REVEAL_ACTIONS_ATTR]: '' }} sx={{ ml: -1 }}>
        <CopilotQuickActions
          label={null}
          actions={followUpActions}
          onAction={(action) => {
            if (action === DECLINE_ACTION) {
              onDeclineToQuote()
              return
            }
            if (action === EMAIL_QUOTE_ACTION) {
              onEmailSelected()
            }
          }}
        />
      </Stack>
    </Box>
  )
}

function CompareRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <Box component="tr">
      <Box component="th" scope="row" sx={rowLabelSx}>
        {label}
      </Box>
      {children}
    </Box>
  )
}
