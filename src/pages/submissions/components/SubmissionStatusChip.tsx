import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { StatusChip } from '@/design-system/components'
import type { SubmissionStatus } from '@/pages/submissions/data/mockSubmissions'

export function SubmissionStatusChip({ status }: { status: SubmissionStatus }) {
  if (status === 'Ready') {
    return (
      <StatusChip
        status="success"
        label="Ready"
        icon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />}
      />
    )
  }

  return (
    <StatusChip
      status="error"
      label="Blocked"
      icon={<BlockIcon sx={{ fontSize: '16px !important' }} />}
    />
  )
}
