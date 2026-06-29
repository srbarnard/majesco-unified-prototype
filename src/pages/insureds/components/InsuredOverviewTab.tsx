import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import type { AppTheme } from '@/design-system/theme'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { InsuredActivityItem, InsuredDetailsRecord } from '@/pages/insureds/data/mockInsuredDetails'
import type { OverviewStat } from '@/pages/policies/data/mockOverview'
import { EntityStatGrid, entityDetailCardSx } from '@/pages/shared/components/EntityStatGrid'

const GUTTER = 3.125

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box
      sx={(theme) => ({
        ...entityDetailCardSx(theme as AppTheme),
        overflow: 'hidden',
        height: '100%',
      })}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle1" sx={{ ...headingSx, fontSize: '0.9375rem' }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Box>
  )
}

function ContactRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Box sx={{ color: 'text.secondary', mt: 0.125 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>{children}</Box>
    </Stack>
  )
}

type InsuredOverviewTabProps = {
  insured: InsuredDetailsRecord
  stats: OverviewStat[]
  recentActivity: InsuredActivityItem[]
}

export function InsuredOverviewTab({ insured, stats, recentActivity }: InsuredOverviewTabProps) {
  const theme = useTheme() as AppTheme

  return (
    <Box sx={{ width: '100%', minHeight: '100%', bgcolor: 'background.paper', pb: GUTTER }}>
      <Stack spacing={GUTTER}>
        <EntityStatGrid stats={stats} />

        <Grid container spacing={GUTTER} alignItems="stretch">
          <Grid size={{ xs: 12, md: 6 }}>
            <DetailCard title="Contact information">
              <Stack spacing={1.5}>
                <ContactRow icon={<LocationOnOutlinedIcon sx={{ fontSize: 18 }} />}>
                  <Typography variant="body2" color="text.secondary" sx={bodySx}>
                    {insured.address}
                  </Typography>
                </ContactRow>
                <ContactRow icon={<PhoneOutlinedIcon sx={{ fontSize: 18 }} />}>
                  <Typography variant="body2" color="text.secondary" sx={bodySx}>
                    {insured.phone}
                  </Typography>
                </ContactRow>
                <ContactRow icon={<EmailOutlinedIcon sx={{ fontSize: 18 }} />}>
                  <Link href={`mailto:${insured.email}`} variant="body2" underline="hover" sx={bodySx}>
                    {insured.email}
                  </Link>
                </ContactRow>
                {insured.website && (
                  <ContactRow icon={<LanguageOutlinedIcon sx={{ fontSize: 18 }} />}>
                    <Link href={`https://${insured.website}`} variant="body2" underline="hover" sx={bodySx}>
                      {insured.website}
                    </Link>
                  </ContactRow>
                )}
                <Divider sx={{ my: 0.5 }} />
                <Typography variant="caption" color="text.secondary" sx={bodySx}>
                  Account manager · {insured.accountManager}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={bodySx}>
                  Producer · {insured.producer}
                </Typography>
              </Stack>
            </DetailCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DetailCard title="Risk profile">
              <Stack spacing={1.25}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, display: 'block', mb: 0.25 }}>
                    NAICS
                  </Typography>
                  <Typography variant="body2" sx={bodySx}>
                    {insured.naics}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, display: 'block', mb: 0.25 }}>
                    Risk summary
                  </Typography>
                  <Typography variant="body2" sx={bodySx}>
                    {insured.riskProfile}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, display: 'block', mb: 0.25 }}>
                    Primary state
                  </Typography>
                  <Typography variant="body2" sx={bodySx}>
                    {insured.primaryState}
                  </Typography>
                </Box>
              </Stack>
            </DetailCard>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ ...entityDetailCardSx(theme), overflow: 'hidden' }}>
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" sx={{ ...headingSx, fontSize: '0.9375rem' }}>
                  Recent activity
                </Typography>
              </Box>
              <Stack divider={<Divider />} sx={{ px: 2, py: 0.5 }}>
                {recentActivity.map((item) => (
                  <Stack key={item.id} spacing={0.25} sx={{ py: 1.25 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
                      <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.8125rem', fontWeight: 600 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, flexShrink: 0 }}>
                        {item.timestamp}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, fontSize: '0.8125rem' }}>
                      {item.detail}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  )
}
