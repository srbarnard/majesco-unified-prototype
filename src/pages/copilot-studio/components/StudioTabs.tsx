import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { StudioTab } from '@/pages/copilot-studio/data/mockCopilotStudio'

type StudioTabsProps = {
  value: StudioTab
  onChange: (tab: StudioTab) => void
}

export function StudioTabs({ value, onChange }: StudioTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(_, next: StudioTab) => onChange(next)}
      aria-label="Copilot Studio sections"
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
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
          gap: 0.75,
        },
        '& .Mui-selected': {
          color: 'primary.main',
          fontWeight: 600,
        },
        '& .MuiTab-iconWrapper': {
          marginRight: 0,
        },
      }}
    >
      <Tab icon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Chat" value="chat" />
      <Tab icon={<PsychologyOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Prompts" value="prompts" />
      <Tab icon={<SmartToyOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Agents" value="agents" />
      <Tab icon={<BarChartOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Insights" value="insights" />
    </Tabs>
  )
}
