import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

export type TasksTab = 'all' | 'team' | 'analytics'

type TasksTabsProps = {
  value: TasksTab
  onChange: (tab: TasksTab) => void
}

export function TasksTabs({ value, onChange }: TasksTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(_, next: TasksTab) => onChange(next)}
      aria-label="Tasks sections"
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
      <Tab label="All tasks" value="all" />
      <Tab label="Team structure" value="team" />
      <Tab label="Analytics" value="analytics" />
    </Tabs>
  )
}
