import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

export type PolicyTab = 'overview' | 'documents' | 'analytics' | 'communications'

type PolicyTabsProps = {
  value: PolicyTab
  onChange: (tab: PolicyTab) => void
}

const tabs: { value: PolicyTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'documents', label: 'Documents' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'communications', label: 'Communications' },
]

export function PolicyTabs({ value, onChange }: PolicyTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(_, next: PolicyTab) => onChange(next)}
      aria-label="Policy sections"
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
      {tabs.map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </Tabs>
  )
}
