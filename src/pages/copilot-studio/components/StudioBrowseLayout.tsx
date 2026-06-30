import Box from '@mui/material/Box'
import type { ReactNode } from 'react'
import { CopilotComposer, type ComposerSelectorOption } from '@/pages/policies/components/CopilotComposer'
import { layoutTokens } from '@/design-system/tokens/layout'

const contentPx = `${layoutTokens.contentPaddingX}px`
const composerMaxWidth = 720

type StudioBrowseLayoutProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  composerPlaceholder: string
  selectorValue?: string
  selectorOptions?: ComposerSelectorOption[]
  onSelectorChange?: (value: string) => void
  children: ReactNode
}

export function StudioBrowseLayout({
  searchQuery,
  onSearchChange,
  composerPlaceholder,
  selectorValue,
  selectorOptions,
  onSelectorChange,
  children,
}: StudioBrowseLayoutProps) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.35,
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(13,148,136,0.12) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(37,99,235,0.1) 0%, transparent 40%)',
        }}
      />

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: contentPx,
          py: 2,
          position: 'relative',
        }}
      >
        {children}
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          px: contentPx,
          pb: 2,
          pt: 1,
          position: 'relative',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ maxWidth: composerMaxWidth, mx: 'auto', width: '100%' }}>
          <CopilotComposer
            padded={false}
            minRows={2}
            placeholder={composerPlaceholder}
            value={searchQuery}
            onChange={onSearchChange}
            clearOnSubmit={false}
            showDisclaimer={false}
            selectorValue={selectorValue}
            selectorOptions={selectorOptions}
            onSelectorChange={onSelectorChange}
          />
        </Box>
      </Box>
    </Box>
  )
}
