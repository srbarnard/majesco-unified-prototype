import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import type { SecondaryPanel } from '@/app/contexts/SidebarContext'

export type NavItem = {
  label: string
  path?: string
  icon?: SvgIconComponent
  copilotIcon?: boolean
  panel?: SecondaryPanel
  matchPaths?: string[]
  hidden?: boolean
}

export type MoreMenuItem = {
  label: string
  path: string
  icon?: SvgIconComponent
  copilotIcon?: boolean
}

export const appShellNavItems: NavItem[] = [
  { label: 'Home', path: '/', icon: HomeOutlinedIcon },
  { label: 'Activity', icon: NotificationsNoneOutlinedIcon, panel: 'activity' },
  { label: 'Favorites', icon: StarBorderOutlinedIcon, panel: 'favorites' },
  { label: 'Tasks', path: '/tasks', icon: TaskAltOutlinedIcon },
  { label: 'Quotes', path: '/quotes', icon: RequestQuoteOutlinedIcon },
  { label: 'Submissions', path: '/submissions', icon: RequestQuoteOutlinedIcon, hidden: true },
  { label: 'Policies', path: '/policies', icon: PolicyOutlinedIcon, matchPaths: ['/policies'] },
  { label: 'Copilot Studio', path: '/copilot-studio', copilotIcon: true },
]

export const moreMenuItems: MoreMenuItem[] = [
  { label: 'Insureds', path: '/insureds', icon: GroupsOutlinedIcon },
  { label: 'Producers', path: '/producers', icon: BadgeOutlinedIcon },
  { label: 'Sub producers', path: '/sub-producers', icon: BadgeOutlinedIcon },
]

export const visibleAppShellNavItems = appShellNavItems.filter((item) => !item.hidden)

/** Legacy nav items used by dashboard-style pages. */
export const primaryNavItems = visibleAppShellNavItems
