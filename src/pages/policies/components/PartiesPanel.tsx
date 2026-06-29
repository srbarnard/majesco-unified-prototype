import CloseIcon from '@mui/icons-material/Close'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { layoutTokens } from '@/design-system/tokens/layout'
import { policyPartiesMock } from '@/pages/policies/data/mockPolicyDetails'

type PartiesPanelProps = {
  onClose?: () => void
}

function PartyDetails({
  address,
  email,
  phone,
}: {
  address?: string
  email?: string
  phone?: string
}) {
  return (
    <Stack spacing={1.25} sx={{ pt: 0.5 }}>
      {address && (
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <LocationOnOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.25 }} />
          <Typography variant="body2" color="text.secondary">
            {address}
          </Typography>
        </Stack>
      )}
      {email && (
        <Stack direction="row" spacing={1} alignItems="center">
          <EmailOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Link href={`mailto:${email}`} variant="body2" underline="hover">
            {email}
          </Link>
        </Stack>
      )}
      {phone && (
        <Stack direction="row" spacing={1} alignItems="center">
          <PhoneOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {phone}
          </Typography>
        </Stack>
      )}
      <Link component="button" variant="body2" underline="hover" sx={{ textAlign: 'left', mt: 0.5 }}>
        View profile
      </Link>
    </Stack>
  )
}

export function PartiesPanel({ onClose }: PartiesPanelProps) {
  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, pt: layoutTokens.policyHeaderTopPadding, pb: 1, borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Parties
        </Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose} aria-label="Close parties panel">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {policyPartiesMock.map((party) => (
          <Accordion
            key={party.id}
            defaultExpanded={party.defaultExpanded}
            disableGutters
            elevation={0}
            sx={{
              '&:before': { display: 'none' },
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  {party.role}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {party.name}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
              <PartyDetails address={party.address} email={party.email} phone={party.phone} />
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  )
}
