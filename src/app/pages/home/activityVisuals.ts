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
import type { RecentActivityKind } from '@/app/data/homeMock'
import { isDarkMode } from '@/design-system/theme/themeSurfaces'

export type ActivityVisual = {
  Icon: SvgIconComponent
  color: (theme: Theme) => string
  bgcolor: (theme: Theme) => string
  typeLabel: string
}

export const activityVisuals: Record<RecentActivityKind, ActivityVisual> = {
  endorsement: {
    Icon: PostAddOutlinedIcon,
    color: (theme) => theme.figmaPalette.blue[700],
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.blue[900] : theme.figmaPalette.blue[100]),
    typeLabel: 'Endorsement',
  },
  renewal: {
    Icon: AutorenewOutlinedIcon,
    color: (theme) => theme.figmaPalette.lightBlue[800],
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.lightBlue[900] : theme.figmaPalette.lightBlue[100]),
    typeLabel: 'Renewal',
  },
  task: {
    Icon: CheckCircleOutlineIcon,
    color: (theme) => theme.figmaPalette.green[700],
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.green[900] : theme.figmaPalette.green[100]),
    typeLabel: 'Task',
  },
  document: {
    Icon: DescriptionOutlinedIcon,
    color: (theme) => theme.figmaPalette.amber[800],
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.amber[900] : theme.figmaPalette.amber[100]),
    typeLabel: 'Document',
  },
  policy: {
    Icon: PolicyOutlinedIcon,
    color: (theme) => theme.figmaPalette.blue[700],
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.blue[900] : theme.figmaPalette.blue[100]),
    typeLabel: 'Policy change',
  },
  claim: {
    Icon: ReportProblemOutlinedIcon,
    color: (theme) => theme.figmaPalette.red[700],
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.red[900] : theme.figmaPalette.red[100]),
    typeLabel: 'Claim',
  },
  billing: {
    Icon: ReceiptLongOutlinedIcon,
    color: (theme) => theme.figmaPalette.deepPurple[700],
    bgcolor: (theme) =>
      isDarkMode(theme) ? theme.figmaPalette.deepPurple[900] : theme.figmaPalette.deepPurple[100],
    typeLabel: 'Billing',
  },
  quote: {
    Icon: RequestQuoteOutlinedIcon,
    color: (theme) => theme.figmaPalette.teal[700],
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.teal[900] : theme.figmaPalette.teal[100]),
    typeLabel: 'Quote',
  },
}
