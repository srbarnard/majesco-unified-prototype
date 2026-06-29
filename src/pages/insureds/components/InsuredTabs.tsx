import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

export type InsuredTab = 'overview' | 'policies' | 'claims' | 'documents' | 'activity'

type InsuredTabsProps = {
  value: InsuredTab
  onChange: (tab: InsuredTab) => void
}

const tabs: { value: InsuredTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'policies', label: 'Policies' },
  { value: 'claims', label: 'Claims' },
  { value: 'documents', label: 'Documents' },
  { value: 'activity', label: 'Activity' },
]

export function InsuredTabs({ value, onChange }: InsuredTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(_, next: InsuredTab) => onChange(next)}
      aria-label="Insured sections"
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
