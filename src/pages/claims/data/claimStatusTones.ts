import type { StatusChipProps } from '@/design-system/components'
import type { ClaimStatus } from '@/pages/claims/data/claimsStore'

export const CLAIM_STATUS_TONES: Record<ClaimStatus, StatusChipProps['status']> = {
  Draft: 'default',
  Reported: 'info',
  Open: 'success',
  'In review': 'info',
  'Coverage referral': 'warning',
  Closed: 'default',
}
