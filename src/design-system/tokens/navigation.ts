import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import type { SvgIconComponent } from '@mui/icons-material'

export type NavItem = {
  label: string
  path: string
  icon: SvgIconComponent
}

export const primaryNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: DashboardOutlinedIcon,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: SettingsOutlinedIcon,
  },
]
