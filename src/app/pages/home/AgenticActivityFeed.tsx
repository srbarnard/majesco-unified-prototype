import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router'
import { agenticActivityMock } from '@/app/data/homeMock'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'

export function AgenticActivityFeed() {
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
          Recent activity
        </Typography>
        <Typography
          component={Link}
          to="/activity"
          variant="body2"
          color="primary"
          sx={{
            fontFamily: figmaFontFamilyStack.body,
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          View all
        </Typography>
      </Stack>

      <Stack spacing={0} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
        {agenticActivityMock.map((item) => (
          <Stack
            key={item.id}
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
              py: 1.5,
              px: 0.5,
              cursor: 'pointer',
              borderRadius: 1,
              '&:hover': { bgcolor: (theme) => surfaceMuted(theme) },
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${item.accentColor}14`,
                color: item.accentColor,
                fontFamily: figmaFontFamilyStack.heading,
                fontWeight: 600,
                fontSize: '0.8125rem',
                flexShrink: 0,
              }}
            >
              {item.agentInitials}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
                {item.agentName} · {item.headline}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body, mt: 0.25 }}>
                {item.description}
              </Typography>
            </Box>
            <ChevronRightIcon fontSize="small" color="action" />
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}
