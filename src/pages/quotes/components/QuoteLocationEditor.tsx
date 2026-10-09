import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { CustomerAddressEditor } from '@/pages/customers/components/CustomerAddressEditor'
import { formatAddress, type CustomerAddress } from '@/pages/customers/data/createCustomerDraft'
import {
  QUOTE_LOCATION_TYPES,
  isAddressComplete,
  type QuoteLocation,
  type QuoteLocationType,
} from '@/pages/quotes/data/createQuoteDraft'
import { DraftInlineOptions, draftBodySx } from '@/pages/shared/components/DraftDrawer'

/** Address lookup + type, with explicit ✓ save and ✕ cancel. */
export function QuoteLocationEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: QuoteLocation | null
  onSave: (location: { address: CustomerAddress; type: QuoteLocationType | null }) => void
  onCancel: () => void
}) {
  const [address, setAddress] = useState<CustomerAddress | null>(initial?.address ?? null)
  const [type, setType] = useState<QuoteLocationType | null>(initial?.type ?? null)
  return (
    <Stack spacing={1.25}>
      {address ? (
        <Typography variant="body2" sx={{ ...draftBodySx, fontSize: '0.8125rem' }}>
          {formatAddress(address)}
        </Typography>
      ) : null}
      <CustomerAddressEditor
        value={address && isAddressComplete(address) ? address : null}
        onSelect={setAddress}
        onDone={() => undefined}
        onDismiss={onCancel}
      />
      <DraftInlineOptions
        options={QUOTE_LOCATION_TYPES.filter((option) => option !== 'Primary' || initial?.type === 'Primary')}
        selected={type}
        onPick={(next) => setType(QUOTE_LOCATION_TYPES.find((option) => option === next) ?? null)}
      />
      <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
        <IconButton size="small" aria-label="Cancel location" onClick={onCancel}>
          <CloseIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          color="primary"
          aria-label="Save location"
          disabled={!address || !isAddressComplete(address)}
          onClick={() => address && isAddressComplete(address) && onSave({ address, type })}
        >
          <CheckIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  )
}
