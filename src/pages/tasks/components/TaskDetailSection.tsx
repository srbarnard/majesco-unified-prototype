import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { isDarkMode, surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

const sectionTitleSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
  fontSize: '0.8125rem',
  color: 'text.secondary',
  letterSpacing: '0.01em',
} as const

const accordionTitleSx = {
  ...sectionTitleSx,
  color: 'text.primary',
} as const

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.875rem',
  lineHeight: 1.55,
  color: 'text.primary',
} as const

const accordionSx = {
  '&:before': { display: 'none' },
  border: 'none',
  borderBottom: 1,
  borderColor: 'divider',
  borderRadius: 0,
  bgcolor: 'transparent',
  boxShadow: 'none',
} as const

type TaskDetailSectionProps = {
  title: string
  children: ReactNode
  /** When true, wraps content in a subtle card (quote-flow section pattern). */
  card?: boolean
}

/** Flat section with title — optional card wrapper for legacy panels. */
export function TaskDetailSection({ title, children, card = false }: TaskDetailSectionProps) {
  const content = (
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={sectionTitleSx}>
        {title}
      </Typography>
      {children}
    </Stack>
  )

  if (!card) {
    return content
  }

  return (
    <Box
      sx={(theme) => ({
        borderRadius: `${layoutTokens.cardRadius}px`,
        border: 1,
        borderColor: 'divider',
        bgcolor: isDarkMode(theme) ? surfaceMuted(theme) : 'background.paper',
        boxShadow: isDarkMode(theme) ? 'none' : layoutTokens.cardShadow,
        px: 2,
        py: 1.5,
      })}
    >
      {content}
    </Box>
  )
}

type TaskDetailAccordionProps = {
  title: string
  children: ReactNode
  defaultExpanded?: boolean
  subtitle?: string
}

/** Collapsible drawer section — matches parties panel accordion pattern. */
export function TaskDetailAccordion({
  title,
  children,
  defaultExpanded = false,
  subtitle,
}: TaskDetailAccordionProps) {
  return (
    <Accordion defaultExpanded={defaultExpanded} disableGutters elevation={0} sx={accordionSx}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ fontSize: 20, color: 'text.secondary' }} />}
        sx={{
          px: 0,
          minHeight: 44,
          '& .MuiAccordionSummary-content': { my: 1 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={accordionTitleSx}>
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mt: 0.25 }}
              noWrap
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pt: 0, pb: 1.5 }}>{children}</AccordionDetails>
    </Accordion>
  )
}

export function TaskDetailText({ children }: { children: ReactNode }) {
  return (
    <Typography variant="body2" sx={bodySx}>
      {children}
    </Typography>
  )
}

export function TaskEntityRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="baseline">
      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body, minWidth: 96 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', textAlign: 'right', flex: 1 }}
      >
        {value}
      </Typography>
    </Stack>
  )
}
