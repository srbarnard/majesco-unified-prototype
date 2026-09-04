import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import ChecklistRtlOutlinedIcon from '@mui/icons-material/ChecklistRtlOutlined'
import FormatQuoteOutlinedIcon from '@mui/icons-material/FormatQuoteOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined'
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined'
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import type { ComponentType } from 'react'
import type { SecondaryPanel } from '@/app/contexts/SidebarContext'
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
  { label: 'Copilot Studio', path: '/copilot-studio', copilotIcon: true },
]

export const moreMenuItems: MoreMenuItem[] = [
  { label: 'Customers', path: '/customers', icon: BusinessOutlinedIcon },
  { label: 'Insureds', path: '/insureds', icon: GroupsOutlinedIcon },
  { label: 'Producers', path: '/producers', icon: BadgeOutlinedIcon },
  { label: 'Sub producers', path: '/sub-producers', icon: BadgeOutlinedIcon },
]

export const visibleAppShellNavItems = appShellNavItems.filter((item) => !item.hidden)

/** Legacy nav items used by dashboard-style pages. */
export const primaryNavItems = visibleAppShellNavItems
