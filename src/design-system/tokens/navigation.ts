import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined'
import ChecklistRtlOutlinedIcon from '@mui/icons-material/ChecklistRtlOutlined'
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined'
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined'
import FormatQuoteOutlinedIcon from '@mui/icons-material/FormatQuoteOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined'
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined'
import SensorOccupiedOutlinedIcon from '@mui/icons-material/SensorOccupiedOutlined'
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined'
import SwitchAccountOutlinedIcon from '@mui/icons-material/SwitchAccountOutlined'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import type { ComponentType } from 'react'
import type { SecondaryPanel } from '@/app/contexts/SidebarContext'
import { DemographyOutlinedIcon } from '@/design-system/icons/DemographyOutlined'
import { SearchActivityOutlinedIcon } from '@/design-system/icons/SearchActivityOutlined'

export type NavIcon = ComponentType<SvgIconProps>

export type NavItem = {
  label: string
  path?: string
  icon?: NavIcon
  copilotIcon?: boolean
  panel?: SecondaryPanel
  matchPaths?: string[]
  hidden?: boolean
}

export type MoreMenuItem = {
  label: string
  path: string
  icon?: NavIcon
  copilotIcon?: boolean
}

export const appShellNavItems: NavItem[] = [
  { label: 'Home', path: '/', icon: HomeOutlinedIcon },
  { label: 'Activity', icon: SearchActivityOutlinedIcon, panel: 'activity' },
  { label: 'Favorites', icon: StarBorderOutlinedIcon, panel: 'favorites' },
  { label: 'Tasks', path: '/tasks', icon: ChecklistRtlOutlinedIcon },
  { label: 'Submissions', path: '/submissions', icon: MoveToInboxOutlinedIcon },
  { label: 'Quotes', path: '/quotes', icon: FormatQuoteOutlinedIcon },
  { label: 'Policies', path: '/policies', icon: PolicyOutlinedIcon, matchPaths: ['/policies'] },
  { label: 'Claims', path: '/claims', icon: ContentPasteOutlinedIcon },
  { label: 'Studio', path: '/copilot-studio', copilotIcon: true },
]

export const moreMenuItems: MoreMenuItem[] = [
  { label: 'Customers', path: '/customers', icon: SensorOccupiedOutlinedIcon },
  { label: 'Insureds', path: '/insureds', icon: DemographyOutlinedIcon },
  { label: 'Producers', path: '/producers', icon: AccountBoxOutlinedIcon },
  { label: 'Sub producers', path: '/sub-producers', icon: SwitchAccountOutlinedIcon },
]

export const visibleAppShellNavItems = appShellNavItems.filter((item) => !item.hidden)

/** FNOL rail. Home is the dashboard; Claims is the list. Activity and Favorites are panels. */
export const claimsOnlyShellNavItems: NavItem[] = [
  { label: 'Home', path: '/', icon: HomeOutlinedIcon },
  { label: 'Activity', icon: HistoryOutlinedIcon, panel: 'activity' },
  { label: 'Favorites', icon: StarBorderOutlinedIcon, panel: 'favorites' },
  { label: 'Tasks', path: '/tasks', icon: ChecklistRtlOutlinedIcon },
  { label: 'Claims', path: '/claims', icon: FileCopyOutlinedIcon },
]

/** Legacy nav items used by dashboard-style pages. */
export const primaryNavItems = visibleAppShellNavItems
