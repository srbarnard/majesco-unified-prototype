import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableFooter from '@mui/material/TableFooter'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import type { AppTheme } from '@/design-system/theme'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { OverviewStat } from '@/pages/policies/data/mockOverview'
import type { QuoteCoverageLine, QuoteDetailsRecord } from '@/pages/quotes/data/mockQuoteDetails'
import { EntityStatGrid, entityDetailCardSx } from '@/pages/shared/components/EntityStatGrid'
import { tableInteractionSx } from '@/design-system/components'

const GUTTER = 3.125

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const tableHeadCellSx = {
  ...headingSx,
  fontSize: '0.75rem',
  py: 1.5,
  border: 0,
  bgcolor: (theme: AppTheme) => surfaceMuted(theme),
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
      <Box sx={{ px: 2, pt: 1.5, pb: 0 }}>
        <Typography variant="subtitle1" sx={{ ...headingSx, fontSize: '0.9375rem' }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ px: 2, pb: 2, pt: 0.75 }}>{children}</Box>
    </Box>
  )
}

const tableBodyCellSx = {
  ...bodySx,
  py: 1.5,
  fontSize: '0.8125rem',
} as const

function parsePremium(value: string) {
  return Number(value.replace(/[^0-9.-]/g, '')) || 0
}

function formatPremiumTotal(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function CoverageLinesTable({ lines, totalPremium }: { lines: QuoteCoverageLine[]; totalPremium: string }) {
  const premiumTotal = formatPremiumTotal(lines.reduce((sum, line) => sum + parsePremium(line.premium), 0))

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 520, ...tableInteractionSx }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...tableHeadCellSx, pl: 2 }}>Coverage line</TableCell>
            <TableCell sx={tableHeadCellSx}>Limit</TableCell>
            <TableCell sx={tableHeadCellSx}>Deductible</TableCell>
            <TableCell sx={{ ...tableHeadCellSx, pr: 2 }}>Premium</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lines.map((line) => (
            <TableRow key={line.id}>
              <TableCell sx={{ ...tableBodyCellSx, pl: 2, fontWeight: 500 }}>{line.line}</TableCell>
              <TableCell sx={tableBodyCellSx}>{line.limit}</TableCell>
              <TableCell sx={tableBodyCellSx}>{line.deductible}</TableCell>
              <TableCell sx={{ ...tableBodyCellSx, pr: 2, fontWeight: 600 }}>{line.premium}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} sx={{ ...tableHeadCellSx, pl: 2, fontWeight: 600, borderBottom: 0 }}>
              Total
            </TableCell>
            <TableCell sx={{ ...tableHeadCellSx, pr: 2, fontWeight: 600, borderBottom: 0 }}>
              {premiumTotal || totalPremium}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Box>
  )
}

type QuoteOverviewTabProps = {
  quote: QuoteDetailsRecord
  stats: OverviewStat[]
}

export function QuoteOverviewTab({ quote, stats }: QuoteOverviewTabProps) {
  const theme = useTheme() as AppTheme

  return (
    <Box sx={{ width: '100%', minHeight: '100%', bgcolor: 'background.paper', pb: GUTTER }}>
      <Stack spacing={GUTTER}>
        <EntityStatGrid stats={stats} />

        <Grid container spacing={GUTTER} alignItems="stretch">
          <Grid size={{ xs: 12, md: 5 }}>
            <DetailCard title="Quote summary">
              <Stack spacing={1.25}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={bodySx}>
                    Product
                  </Typography>
                  <Typography variant="body2" sx={bodySx}>
                    {quote.product}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={bodySx}>
                    Term
                  </Typography>
                  <Typography variant="body2" sx={bodySx}>
                    {quote.effectiveDate} – {quote.expirationDate}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={bodySx}>
                    Version
                  </Typography>
                  <Typography variant="body2" sx={bodySx}>
                    {quote.version}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={bodySx}>
                    Underwriter
                  </Typography>
                  <Typography variant="body2" sx={bodySx}>
                    {quote.underwriter}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={bodySx}>
                    Submitted
                  </Typography>
                  <Typography variant="body2" sx={bodySx}>
                    {quote.submissionDate}
                  </Typography>
                </Box>
              </Stack>
            </DetailCard>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ ...entityDetailCardSx(theme), overflow: 'hidden', height: '100%' }}>
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" sx={{ ...headingSx, fontSize: '0.9375rem' }}>
                  Coverage breakdown
                </Typography>
              </Box>
              <Box sx={{ px: 2, pb: 2, pt: 0.5 }}>
                <CoverageLinesTable lines={quote.coverageLines} totalPremium={quote.premium} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  )
}
