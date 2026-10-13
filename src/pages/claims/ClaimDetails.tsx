import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router'
import { useRightToolDispatch } from '@/app/contexts/RightToolContext'
import { useRegisterRightToolRecordContext } from '@/app/hooks/useRightToolRegistration'
import { Button, CopilotIcon, StatusChip } from '@/design-system/components'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { layoutTokens } from '@/design-system/tokens/layout'
import { focusClaimInDrawer } from '@/pages/claims/data/claimDrawerStore'
import { CLAIM_STATUS_TONES } from '@/pages/claims/data/claimStatusTones'
import { useClaim } from '@/pages/claims/data/claimsStore'
import { formatLossDate } from '@/pages/claims/data/createClaimDraft'
import { insuredIdFromName } from '@/pages/shared/insuredId'

const bodySx = { fontFamily: figmaFontFamilyStack.body, fontSize: '0.875rem' } as const
const labelSx = { fontFamily: figmaFontFamilyStack.body, fontSize: '0.75rem', color: 'text.secondary', mb: 0.25 } as const
const sectionTitleSx = { fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '1rem', mb: 1.5 } as const

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={labelSx}>{label}</Typography>
      <Typography component="div" sx={bodySx}>
        {children}
      </Typography>
    </Box>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: `${layoutTokens.cardRadius}px`, p: 2.5 }}>
      <Typography component="h2" sx={sectionTitleSx}>
        {title}
      </Typography>
      {children}
    </Box>
  )
}

export function ClaimDetails() {
  const { claimNumber } = useParams<{ claimNumber: string }>()
  const navigate = useNavigate()
  const { openTool } = useRightToolDispatch()
  const claim = useClaim(claimNumber ? decodeURIComponent(claimNumber) : null)
  useRegisterRightToolRecordContext(
    claim ? { title: claim.insured, subtitle: claim.claimNumber, kind: 'claim' } : null,
    [claim?.insured, claim?.claimNumber],
  )
  const contentPx = `${layoutTokens.contentPaddingX}px`

  if (!claim) {
    return (
      <Box sx={{ px: contentPx, pt: layoutTokens.policyHeaderTopPadding }}>
        <Typography sx={bodySx}>Claim {claimNumber} was not found.</Typography>
        <Link component={RouterLink} to="/claims" sx={bodySx}>
          Back to Claims
        </Link>
      </Box>
    )
  }

  const openInDrawer = () => {
    focusClaimInDrawer(claim)
    openTool('newClaim')
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, height: '100%', overflow: 'auto', bgcolor: 'background.paper' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1.5}
        sx={{ px: contentPx, pt: layoutTokens.policyHeaderTopPadding, pb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <IconButton size="small" aria-label="Back to Claims" onClick={() => navigate('/claims')}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Typography
                variant="h5"
                component="h1"
                sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: { xs: '1.25rem', md: '1.375rem' } }}
              >
                {claim.claimNumber}
              </Typography>
              <StatusChip status={CLAIM_STATUS_TONES[claim.status]} label={claim.status} />
            </Stack>
            <Typography sx={{ ...bodySx, color: 'text.secondary' }}>
              <Link component={RouterLink} to={`/insureds/${encodeURIComponent(insuredIdFromName(claim.insured))}`} underline="hover">
                {claim.insured}
              </Link>
              {` · ${claim.product}`}
            </Typography>
          </Box>
        </Stack>
        <Button variant="outlined" color="primary" startIcon={<CopilotIcon size={18} />} onClick={openInDrawer}>
          Ask assistant
        </Button>
      </Stack>

      <Stack spacing={2} sx={{ px: contentPx, pb: contentPx, maxWidth: 960 }}>
        <Section title="Loss">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 2, mb: 2 }}>
            <Fact label="Date of loss">{claim.dateOfLoss ? formatLossDate(claim.dateOfLoss) : '—'}</Fact>
            <Fact label="Location">{claim.location ?? '—'}</Fact>
            <Fact label="Policy">{claim.policyNumber ?? 'Not matched yet'}</Fact>
          </Box>
          <Fact label="What happened">{claim.description ?? 'Not described yet'}</Fact>
        </Section>
        <Section title="Handling">
          <Fact label="Assignee">{claim.assignee}</Fact>
        </Section>
        <Section title={`Notes (${claim.notes.length})`}>
          {claim.notes.length === 0 ? (
            <Typography sx={{ ...bodySx, color: 'text.secondary' }}>No notes yet.</Typography>
          ) : (
            <Stack spacing={1.5}>
              {claim.notes.map((note) => (
                <Fact key={note.id} label={note.at}>
                  {note.text}
                </Fact>
              ))}
            </Stack>
          )}
        </Section>
        <Section title={`Tasks (${claim.tasks.length})`}>
          {claim.tasks.length === 0 ? (
            <Typography sx={{ ...bodySx, color: 'text.secondary' }}>No tasks yet.</Typography>
          ) : (
            <Stack spacing={1.5}>
              {claim.tasks.map((task) => (
                <Fact key={task.id} label={`${task.assignee} · Due ${task.dueLabel}`}>
                  {task.title}
                </Fact>
              ))}
            </Stack>
          )}
        </Section>
      </Stack>
    </Box>
  )
}

export default ClaimDetails
