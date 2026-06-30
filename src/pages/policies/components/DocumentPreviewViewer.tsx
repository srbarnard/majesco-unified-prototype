import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
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
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'
import { getDocumentPreviewContent } from '@/pages/policies/data/documentPreviewData'

type DocumentPreviewViewerProps = {
  document: PolicyDocument
  onClose?: () => void
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

export function DocumentPreviewViewer({ document, onClose }: DocumentPreviewViewerProps) {
  const preview = getDocumentPreviewContent(document)
  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(100)

  const canGoBack = page > 1
  const canGoForward = page < preview.pageCount

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{
          px: 2,
          pt: layoutTokens.policyHeaderTopPadding,
          pb: 1.25,
          bgcolor: (theme) => surfaceMuted(theme),
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ ...headingSx, fontSize: '0.9375rem', lineHeight: 1.35 }}
          >
            {document.fileName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={bodySx}>
            {document.kind} · {preview.pageCount} page{preview.pageCount === 1 ? '' : 's'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.25} alignItems="center" flexShrink={0}>
          <IconButton size="small" aria-label={`Download ${document.fileName}`}>
            <DownloadOutlinedIcon fontSize="small" />
          </IconButton>
          {onClose && (
            <IconButton size="small" onClick={onClose} aria-label="Close preview">
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Stack>

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
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          bgcolor: (theme) => surfaceSubtle(theme),
          p: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 520,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease',
          }}
        >
          {preview.previewType === 'spreadsheet' ? (
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: `${layoutTokens.cardRadius}px`,
                border: 1,
                borderColor: 'divider',
                overflow: 'hidden',
                boxShadow: (theme) => (theme.palette.mode === 'dark' ? 'none' : layoutTokens.cardShadow),
              }}
            >
              <Box sx={{ px: 2, py: 1.25, borderBottom: 1, borderColor: 'divider', bgcolor: (t) => surfaceMuted(t) }}>
                <Typography variant="caption" sx={{ ...headingSx, fontSize: '0.75rem' }}>
                  Sheet1
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
                  {['A', 'B', 'C', 'D'].map((col) => (
                    <Box
                      key={col}
                      sx={{
                        flex: 1,
                        px: 1,
                        py: 0.5,
                        bgcolor: (t) => surfaceMuted(t),
                        borderRadius: 0.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ ...headingSx, fontSize: '0.6875rem' }}>
                        {col}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                {preview.extractedText.split('\n').slice(0, 5).map((line, index) => (
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
                bgcolor: 'background.paper',
                borderRadius: `${layoutTokens.cardRadius}px`,
                border: 1,
                borderColor: 'divider',
                minHeight: 480,
                boxShadow: (theme) => (theme.palette.mode === 'dark' ? 'none' : layoutTokens.cardShadow),
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  p: 3,
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
                ) : (
                  <>
                    <Typography variant="subtitle2" sx={{ ...headingSx, mb: 2, fontSize: '1rem' }}>
                      {document.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        ...bodySx,
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                        color: 'text.primary',
                      }}
                    >
                      {preview.extractedText}
                    </Typography>
                  </>
                )}
              </Box>
              <Box
                sx={{
                  px: 3,
                  py: 1,
                  borderTop: 1,
                  borderColor: 'divider',
                  bgcolor: (t) => surfaceMuted(t),
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={bodySx}>
                  Page {page} · Mock preview for prototype
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
