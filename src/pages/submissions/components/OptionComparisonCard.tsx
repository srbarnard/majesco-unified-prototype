import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CopilotQuickActions } from '@/design-system/components'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import {
  COPILOT_REVEAL_ACTIONS_ATTR,
  COPILOT_REVEAL_ATTR,
} from '@/pages/policies/components/copilot/copilotReveal'
import type { PremiumEstimate } from '@/pages/submissions/data/mockSubmissions'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const compareTextSx = { ...bodySx, fontSize: '0.8125rem', lineHeight: 1.5, minWidth: 0 } as const

/** Same row as the create-customer review list: 120px label, then one column per option. */
function compareRowSx(columns: number) {
  return {
    display: 'grid',
    gridTemplateColumns: `120px repeat(${columns}, minmax(0, 1fr))`,
    columnGap: 1.5,
    alignItems: 'baseline',
    px: 1.5,
    py: 1,
    borderRadius: '5px',
  } as const
}

const OPTION_ORDER: PremiumEstimate['label'][] = ['Optimized', 'Balanced', 'Conservative']

const COMPARE_ROWS: { label: string; value: (option: PremiumEstimate) => string }[] = [
  { label: 'Premium', value: (option) => formatPremium(option.range) },
  { label: 'Stance', value: (option) => stanceLabel(option.label) },
  { label: 'Fit', value: (option) => fitLabel(option.label) },
]

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
  const compared = options
    .filter((option) => includedLabels.includes(option.label))
    .sort((a, b) => OPTION_ORDER.indexOf(a.label) - OPTION_ORDER.indexOf(b.label))
  const canCompare = compared.length >= 2

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
        <Box sx={{ mb: 2, borderRadius: 1, overflow: 'hidden' }}>
          <Box sx={{ ...compareRowSx(compared.length), py: 0.5 }}>
            <Box />
            {compared.map((option) => (
              <Box key={option.label} sx={{ ...compareTextSx, color: 'text.secondary', fontWeight: 500 }}>
                {option.label}
                {option.label === recommendedLabel ? '*' : ''}
              </Box>
            ))}
          </Box>
          {COMPARE_ROWS.map((row, index) => (
            <Box
              key={row.label}
              sx={{
                ...compareRowSx(compared.length),
                bgcolor: index % 2 === 0 ? 'action.hover' : 'background.paper',
              }}
            >
              <Box sx={{ ...compareTextSx, color: 'text.secondary' }}>{row.label}</Box>
              {compared.map((option) => (
                <Box key={option.label} sx={{ ...compareTextSx, color: 'text.primary' }}>
                  {row.value(option)}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
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
