import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

export type PoliciesListTab = 'all' | 'analytics'

type PoliciesListTabsProps = {
  value: PoliciesListTab
  onChange: (tab: PoliciesListTab) => void
}

export function PoliciesListTabs({ value, onChange }: PoliciesListTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(_, next: PoliciesListTab) => onChange(next)}
      aria-label="Policies sections"
      sx={{
        minHeight: 44,
        '& .MuiTabs-scrollButtons': {
          width: 28,
        },
        '& .MuiTabs-indicator': {
          height: 3,
          borderRadius: '3px 3px 0 0',
          bgcolor: 'primary.main',
        },
        '& .MuiTab-root': {
          minHeight: 44,
          minWidth: 'auto',
          px: { xs: 1.25, md: 1.75 },
          py: 0.875,
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          fontFamily: figmaFontFamilyStack.heading,
          color: 'text.secondary',
          transition: 'color 0.2s ease',
        },
        '& .Mui-selected': {
          color: 'primary.main',
          fontWeight: 600,
        },
      }}
    >
      <Tab label="All Policies" value="all" />
      <Tab label="Analytics" value="analytics" />
    </Tabs>
  )
}
