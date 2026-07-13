import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined'
import ZoomOutOutlinedIcon from '@mui/icons-material/ZoomOutOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { surfaceMuted, surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { DocumentBrandedPage } from '@/pages/policies/components/DocumentBrandedPage'
import { DocumentViewerHoverActions, type DocumentViewerAction } from '@/pages/policies/components/DocumentViewerHoverActions'
import { getDocumentPreviewContent } from '@/pages/policies/data/documentPreviewData'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'

type DocumentViewerCanvasProps = {
  document: PolicyDocument
  onAction?: (action: DocumentViewerAction) => void
}

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

function PreviewTypeIcon({ previewType }: { previewType: 'pdf' | 'image' | 'spreadsheet' }) {
  if (previewType === 'image') return <ImageOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
  if (previewType === 'spreadsheet') return <GridOnOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
  return <DescriptionOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
}

export function DocumentViewerCanvas({ document, onAction }: DocumentViewerCanvasProps) {
  const preview = getDocumentPreviewContent(document)
  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [hovered, setHovered] = useState(false)

  const canGoBack = page > 1
  const canGoForward = page < preview.pageCount

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={1}
        sx={{
          px: 2,
          py: 0.75,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <IconButton
          size="small"
          disabled={!canGoBack}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          aria-label="Previous page"
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <Typography variant="caption" color="text.secondary" sx={bodySx}>
          Page {page} of {preview.pageCount}
        </Typography>
        <IconButton
          size="small"
          disabled={!canGoForward}
          onClick={() => setPage((current) => Math.min(preview.pageCount, current + 1))}
          aria-label="Next page"
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1 }} />
        <IconButton
          size="small"
          disabled={zoom <= 75}
          onClick={() => setZoom((current) => Math.max(75, current - 25))}
          aria-label="Zoom out"
        >
          <ZoomOutOutlinedIcon fontSize="small" />
        </IconButton>
        <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, minWidth: 40, textAlign: 'center' }}>
          {zoom}%
        </Typography>
        <IconButton
          size="small"
          disabled={zoom >= 150}
          onClick={() => setZoom((current) => Math.min(150, current + 25))}
          aria-label="Zoom in"
        >
          <ZoomInOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          bgcolor: (theme) => surfaceSubtle(theme),
          p: { xs: 2, md: 3 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 720,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease',
            overflow: 'visible',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {preview.previewType === 'spreadsheet' ? (
            <Box
              sx={{
                position: 'relative',
                bgcolor: 'background.paper',
                borderRadius: `${layoutTokens.cardRadius}px`,
                border: 1,
                borderColor: 'divider',
                overflow: 'visible',
                boxShadow: (theme) => (theme.palette.mode === 'dark' ? 'none' : layoutTokens.cardShadow),
              }}
            >
              <DocumentViewerHoverActions visible={hovered} onAction={onAction} />
              <Box sx={{ px: 2, py: 1.25, borderBottom: 1, borderColor: 'divider', bgcolor: (t) => surfaceMuted(t) }}>
                <Typography variant="caption" sx={{ ...headingSx, fontSize: '0.75rem' }}>
                  Sheet1
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {preview.extractedText.split('\n').slice(0, 8).map((line, index) => (
                  <Typography
                    key={line}
                    variant="body2"
                    sx={{ ...bodySx, fontSize: '0.8125rem', mb: 0.75, fontFamily: 'monospace' }}
                  >
                    {index + 1}. {line}
                  </Typography>
                ))}
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                position: 'relative',
                bgcolor: 'background.paper',
                borderRadius: `${layoutTokens.cardRadius}px`,
                border: 1,
                borderColor: 'divider',
                minHeight: { xs: 420, md: 640 },
                boxShadow: (theme) => (theme.palette.mode === 'dark' ? 'none' : '0 1px 4px rgba(0, 0, 0, 0.1)'),
                display: 'flex',
                flexDirection: 'column',
                overflow: 'visible',
              }}
            >
              <DocumentViewerHoverActions visible={hovered} onAction={onAction} />
              <Box
                sx={{
                  flex: 1,
                  p: { xs: 2.5, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: preview.previewType === 'image' ? 'center' : 'stretch',
                  justifyContent: preview.previewType === 'image' ? 'center' : 'flex-start',
                }}
              >
                {preview.previewType === 'image' ? (
                  <Stack spacing={1} alignItems="center">
                    <PreviewTypeIcon previewType="image" />
                    <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, textAlign: 'center' }}>
                      Image preview
                    </Typography>
                  </Stack>
                ) : preview.brandedLayout ? (
                  <DocumentBrandedPage
                    layout={preview.brandedLayout}
                    page={page}
                    pageCount={preview.pageCount}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      ...bodySx,
                      lineHeight: 1.75,
                      whiteSpace: 'pre-wrap',
                      color: 'text.primary',
                      fontSize: '0.875rem',
                    }}
                  >
                    {preview.extractedText}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
