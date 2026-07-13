import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type {
  BrandedDocumentLayout,
  BrandedHighlightTone,
} from '@/pages/policies/data/documentPreviewData'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

function highlightSx(tone: BrandedHighlightTone) {
  return (theme: { palette: { primary: { main: string }; warning: { main: string } } }) => {
    if (tone === 'primary') {
      return {
        bgcolor: alpha(theme.palette.primary.main, 0.14),
        color: 'primary.main',
        fontWeight: 600,
        px: 0.375,
        borderRadius: 0.5,
      }
    }
    if (tone === 'warning') {
      return {
        bgcolor: alpha(theme.palette.warning.main, 0.18),
        color: 'warning.dark',
        fontWeight: 600,
        px: 0.375,
        borderRadius: 0.5,
      }
    }
    return {}
  }
}

type DocumentBrandedPageProps = {
  layout: BrandedDocumentLayout
  page: number
  pageCount: number
}

export function DocumentBrandedPage({ layout, page, pageCount }: DocumentBrandedPageProps) {
  return (
    <>
      <Box
        sx={(theme) => ({
          px: 3,
          py: 1.75,
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.900',
          color: 'common.white',
        })}
      >
        <Typography
          sx={{
            ...headingSx,
            fontSize: '0.6875rem',
            letterSpacing: '0.14em',
            lineHeight: 1.2,
          }}
        >
          {layout.issuer}
        </Typography>
        {layout.issuerSubtitle && (
          <Typography sx={{ ...bodySx, fontSize: '0.6875rem', opacity: 0.78, mt: 0.25 }}>
            {layout.issuerSubtitle}
          </Typography>
        )}
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 4 }, pt: 3, pb: 2 }}>
        <Typography
          align="center"
          sx={{
            ...headingSx,
            fontSize: '1.125rem',
            letterSpacing: '0.06em',
            mb: 2.5,
          }}
        >
          {layout.title}
        </Typography>

        {(layout.preparedFor || layout.policyTerm) && (
          <Stack spacing={0.5} sx={{ mb: 2.5 }}>
            {layout.preparedFor && (
              <Typography sx={{ ...bodySx, fontSize: '0.8125rem' }}>
                <Box component="span" sx={{ fontWeight: 600 }}>
                  Prepared for:
                </Box>{' '}
                {layout.preparedFor}
              </Typography>
            )}
            {layout.policyTerm && (
              <Typography sx={{ ...bodySx, fontSize: '0.8125rem', color: 'text.secondary' }}>
                Policy term: {layout.policyTerm}
              </Typography>
            )}
          </Stack>
        )}

        <Divider sx={{ mb: 2.5 }} />

        <Stack spacing={2.25}>
          {layout.sections.map((section) => (
            <Box key={section.heading ?? section.segments[0]?.text.slice(0, 24)}>
              {section.heading && (
                <Typography sx={{ ...headingSx, fontSize: '0.8125rem', mb: 0.75 }}>
                  {section.heading}
                </Typography>
              )}
              <Typography
                component="div"
                sx={{ ...bodySx, fontSize: '0.8125rem', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}
              >
                {section.segments.map((segment, index) =>
                  segment.highlight ? (
                    <Box
                      key={`${segment.text}-${index}`}
                      component="span"
                      sx={highlightSx(segment.highlight)}
                    >
                      {segment.text}
                    </Box>
                  ) : (
                    <span key={`${segment.text}-${index}`}>{segment.text}</span>
                  ),
                )}
              </Typography>
            </Box>
          ))}
        </Stack>

        {layout.footerLines && layout.footerLines.length > 0 && (
          <>
            <Divider sx={{ my: 2.5 }} />
            <Stack spacing={0.375}>
              {layout.footerLines.map((line) => (
                <Typography key={line} sx={{ ...bodySx, fontSize: '0.75rem', color: 'text.secondary' }}>
                  {line}
                </Typography>
              ))}
            </Stack>
          </>
        )}
      </Box>

      <Box
        sx={(theme) => ({
          mt: 'auto',
          px: 3,
          py: 1,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
        })}
      >
        <Typography variant="caption" color="text.secondary" sx={bodySx}>
          Page {page} of {pageCount} · {layout.issuer}
        </Typography>
      </Box>
    </>
  )
}
