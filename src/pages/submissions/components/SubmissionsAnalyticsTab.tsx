import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { layoutTokens } from '@/design-system/tokens/layout'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { submissionsMock } from '@/pages/submissions/data/mockSubmissions'

export function SubmissionsAnalyticsTab() {
  const blocked = submissionsMock.filter((row) => row.status === 'Blocked').length
  const ready = submissionsMock.filter((row) => row.status === 'Ready').length

  return (
    <Stack spacing={2} sx={{ py: 1 }}>
      <Typography
        variant="h6"
        sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '1.125rem' }}
      >
        Submissions analytics
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        {[
          { label: 'Ready', value: ready },
          { label: 'Blocked', value: blocked },
          { label: 'In queue', value: submissionsMock.filter((r) => r.assignedTo === 'Underwriting Queue').length },
        ].map((card) => (
          <Box
            key={card.label}
            sx={(theme) => ({
              flex: 1,
              px: 2,
              py: 2,
              borderRadius: `${layoutTokens.cardRadius}px`,
              bgcolor: surfaceMuted(theme),
            })}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mb: 0.5 }}
            >
              {card.label}
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}
            >
              {card.value}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  )
}
