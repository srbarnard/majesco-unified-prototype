import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined'
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import type { Theme } from '@mui/material/styles'
import type { StatusChipProps } from '@/design-system/components'
import type { RecentActivityKind } from '@/app/data/homeMock'
import { isDarkMode } from '@/design-system/theme/themeSurfaces'

export type ActivityVisual = {
  Icon: SvgIconComponent
  color: (theme: Theme) => string
  bgcolor: (theme: Theme) => string
  typeLabel: string
}

function activityIconColor(theme: Theme, lightColor: string) {
  return isDarkMode(theme) ? theme.palette.text.secondary : lightColor
}

export const activityVisuals: Record<RecentActivityKind, ActivityVisual> = {
  endorsement: {
    Icon: PostAddOutlinedIcon,
    color: (theme) => activityIconColor(theme, theme.figmaPalette.blue[700]),
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.blue[900] : theme.figmaPalette.blue[100]),
    typeLabel: 'Endorsement',
  },
  renewal: {
    Icon: AutorenewOutlinedIcon,
    color: (theme) => activityIconColor(theme, theme.figmaPalette.lightBlue[800]),
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.lightBlue[900] : theme.figmaPalette.lightBlue[100]),
    typeLabel: 'Renewal',
  },
  task: {
    Icon: CheckCircleOutlineIcon,
    color: (theme) => activityIconColor(theme, theme.figmaPalette.green[700]),
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.green[900] : theme.figmaPalette.green[100]),
    typeLabel: 'Task',
  },
  document: {
    Icon: DescriptionOutlinedIcon,
    color: (theme) => activityIconColor(theme, theme.figmaPalette.amber[800]),
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.amber[900] : theme.figmaPalette.amber[100]),
    typeLabel: 'Document',
  },
  policy: {
    Icon: PolicyOutlinedIcon,
    color: (theme) => activityIconColor(theme, theme.figmaPalette.blue[700]),
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.blue[900] : theme.figmaPalette.blue[100]),
    typeLabel: 'Policy change',
  },
  claim: {
    Icon: ReportProblemOutlinedIcon,
    color: (theme) => activityIconColor(theme, theme.figmaPalette.red[700]),
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.red[900] : theme.figmaPalette.red[100]),
    typeLabel: 'Claim',
  },
  billing: {
    Icon: ReceiptLongOutlinedIcon,
    color: (theme) => activityIconColor(theme, theme.figmaPalette.deepPurple[700]),
    bgcolor: (theme) =>
      isDarkMode(theme) ? theme.figmaPalette.deepPurple[900] : theme.figmaPalette.deepPurple[100],
    typeLabel: 'Billing',
  },
  quote: {
    Icon: RequestQuoteOutlinedIcon,
    color: (theme) => activityIconColor(theme, theme.figmaPalette.teal[700]),
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.teal[900] : theme.figmaPalette.teal[100]),
    typeLabel: 'Quote',
  },
}

export function getActivityTypeChipStatus(kind: RecentActivityKind): StatusChipProps['status'] {
  switch (kind) {
    case 'renewal':
      return 'info'
    case 'quote':
      return 'info'
    case 'claim':
      return 'error'
    case 'endorsement':
      return 'info'
    case 'task':
      return 'success'
    case 'document':
      return 'warning'
    case 'policy':
      return 'info'
    case 'billing':
      return 'default'
    default:
      return 'default'
  }
}
