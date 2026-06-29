import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

export type QuoteTab = 'overview' | 'documents' | 'underwriting' | 'activity'

type QuoteTabsProps = {
  value: QuoteTab
  onChange: (tab: QuoteTab) => void
}

const tabs: { value: QuoteTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'documents', label: 'Documents' },
  { value: 'underwriting', label: 'Underwriting' },
  { value: 'activity', label: 'Activity' },
]

export function QuoteTabs({ value, onChange }: QuoteTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(_, next: QuoteTab) => onChange(next)}
      aria-label="Quote sections"
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        minHeight: 44,
        '& .MuiTabs-scrollButtons': { width: 28 },
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
