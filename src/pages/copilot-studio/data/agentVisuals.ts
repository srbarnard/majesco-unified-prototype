import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined'
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import type { Theme } from '@mui/material/styles'
import type { StudioAgentCategory } from '@/pages/copilot-studio/data/mockCopilotStudio'
import { isDarkMode } from '@/design-system/theme/themeSurfaces'

export type AgentVisual = {
  Icon: SvgIconComponent
  color: (theme: Theme) => string
  bgcolor: (theme: Theme) => string
}

const categoryVisuals: Record<StudioAgentCategory, AgentVisual> = {
  'P&C Policy': {
    Icon: PolicyOutlinedIcon,
    color: (theme) => theme.figmaPalette.blue[700],
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.blue[900] : theme.figmaPalette.blue[100]),
  },
  'P&C Billing': {
    Icon: ReceiptLongOutlinedIcon,
    color: (theme) => theme.figmaPalette.deepPurple[700],
    bgcolor: (theme) =>
      isDarkMode(theme) ? theme.figmaPalette.deepPurple[900] : theme.figmaPalette.deepPurple[100],
  },
  'P&C Claims': {
    Icon: ReportProblemOutlinedIcon,
    color: (theme) => theme.figmaPalette.red[700],
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.red[900] : theme.figmaPalette.red[100]),
  },
}

const kindVisuals: Record<string, AgentVisual> = {
  quote: {
    Icon: RequestQuoteOutlinedIcon,
    color: (theme) => theme.figmaPalette.teal[700],
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.teal[900] : theme.figmaPalette.teal[100]),
  },
  document: {
    Icon: DescriptionOutlinedIcon,
    color: (theme) => theme.figmaPalette.amber[800],
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.amber[900] : theme.figmaPalette.amber[100]),
  },
  payment: {
    Icon: PaymentsOutlinedIcon,
    color: (theme) => theme.figmaPalette.lightBlue[800],
    bgcolor: (theme) =>
      isDarkMode(theme) ? theme.figmaPalette.lightBlue[900] : theme.figmaPalette.lightBlue[100],
  },
  renewal: {
    Icon: AutorenewOutlinedIcon,
    color: (theme) => theme.figmaPalette.green[700],
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.green[900] : theme.figmaPalette.green[100]),
  },
  triage: {
    Icon: PsychologyOutlinedIcon,
    color: (theme) => theme.figmaPalette.purple[700],
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.purple[900] : theme.figmaPalette.purple[100]),
  },
  certificate: {
    Icon: VerifiedOutlinedIcon,
    color: (theme) => theme.figmaPalette.indigo[700],
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.indigo[900] : theme.figmaPalette.indigo[100]),
  },
  cancellation: {
    Icon: CancelOutlinedIcon,
    color: (theme) => theme.figmaPalette.orange[800],
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.orange[900] : theme.figmaPalette.orange[100]),
  },
  underwriting: {
    Icon: FactCheckOutlinedIcon,
    color: (theme) => theme.figmaPalette.cyan[800],
    bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.cyan[900] : theme.figmaPalette.cyan[100]),
  },
  litigation: {
    Icon: GavelOutlinedIcon,
    color: (theme) => theme.figmaPalette.deepOrange[700],
    bgcolor: (theme) =>
      isDarkMode(theme) ? theme.figmaPalette.deepOrange[900] : theme.figmaPalette.deepOrange[100],
  },
  fleet: {
    Icon: LocalShippingOutlinedIcon,
    color: (theme) => theme.figmaPalette.blueGrey[700],
    bgcolor: (theme) =>
      isDarkMode(theme) ? theme.figmaPalette.blueGrey[900] : theme.figmaPalette.blueGrey[100],
  },
}

export function getAgentVisual(category: StudioAgentCategory, kind: string): AgentVisual {
  return kindVisuals[kind] ?? categoryVisuals[category]
}
