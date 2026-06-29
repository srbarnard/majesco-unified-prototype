import { Chip, StatusChip, statusChipSx, type StatusChipProps } from '@/design-system/components'
import { surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import type { QuoteStatus } from '@/pages/quotes/data/mockQuotes'

const quoteStatusToneMap: Record<QuoteStatus, StatusChipProps['status']> = {
  Quoted: 'success',
  Draft: 'info',
  'Setup in progress': 'info',
  Presented: 'warning',
  'Ready for booking': 'success',
  Referred: 'warning',
  'Rating blocked': 'error',
  'Pending issuance': 'warning',
  Issued: 'success',
}

function inferStatusTone(status: string): StatusChipProps['status'] | null {
  const normalized = status.toLowerCase()

  if (/(block|declin|reject|cancel|expir)/.test(normalized)) {
    return 'error'
  }

  if (/(issued|quoted|book|bound|active|complete|approv)/.test(normalized)) {
    return 'success'
  }

  if (/(draft|progress|setup|review|submitted)/.test(normalized)) {
    return 'info'
  }

  if (/(pending|refer|present|hold|wait)/.test(normalized)) {
    return 'warning'
  }

  return null
}

export function QuoteStatusChip({ status }: { status: QuoteStatus | string }) {
  const mappedTone = quoteStatusToneMap[status as QuoteStatus] ?? inferStatusTone(status)

  if (mappedTone) {
    return <StatusChip status={mappedTone} label={status} />
  }

  return (
    <Chip
      label={status}
      size="small"
      variant="filled"
      sx={(theme) => ({
        ...statusChipSx,
        bgcolor: surfaceSubtle(theme),
        color: 'text.secondary',
      })}
    />
  )
}
