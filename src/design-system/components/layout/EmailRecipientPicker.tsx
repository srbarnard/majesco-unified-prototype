import CheckIcon from '@mui/icons-material/Check'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { draftInputSx } from '@/pages/shared/components/DraftDrawer'
import type { EmailRecipient } from '@/pages/shared/data/emailRecipients'

type RecipientOption = { kind: 'listed'; recipient: EmailRecipient } | { kind: 'other' }

const SOMEONE_ELSE: RecipientOption = { kind: 'other' }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const optionTextSx = { fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' } as const
const helperSx = { sx: { fontFamily: figmaFontFamilyStack.body, mx: 0 } }

/**
 * Who the email goes to: a typeahead of known producers or insureds; "Someone else" always trails the
 * results and switches to a free email field for anyone not on the list.
 */
export function EmailRecipientPicker({
  role,
  recipients,
  onPick,
  onDismiss,
}: {
  role: EmailRecipient['role']
  recipients: EmailRecipient[]
  onPick: (recipient: { name?: string; email: string }) => void
  onDismiss?: () => void
}) {
  const noun = role.toLowerCase()
  const [elsewhere, setElsewhere] = useState(false)
  const [typed, setTyped] = useState('')
  const valid = EMAIL_PATTERN.test(typed.trim())

  if (elsewhere) {
    const commit = () => {
      if (valid) onPick({ email: typed.trim() })
    }
    return (
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ ...optionTextSx, display: 'block', mb: 0.75 }}>
          {`Not on the ${noun} list · enter their email`}
        </Typography>
        <TextField
          size="small"
          fullWidth
          autoFocus
          type="email"
          value={typed}
          placeholder="name@company.com"
          onChange={(event) => setTyped(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit()
            }
          }}
          helperText={`The ${noun}’s email address`}
          inputProps={{ 'aria-label': `${role} email`, inputMode: 'email', autoComplete: 'email' }}
          InputProps={{
            endAdornment: (
              <IconButton
                size="small"
                edge="end"
                aria-label={`Use this ${noun} email`}
                disabled={!valid}
                onClick={commit}
                sx={{ color: 'primary.main' }}
              >
                <CheckIcon sx={{ fontSize: 18 }} />
              </IconButton>
            ),
          }}
          FormHelperTextProps={helperSx}
          sx={draftInputSx}
        />
        <Link
          component="button"
          type="button"
          underline="hover"
          onClick={() => setElsewhere(false)}
          sx={{ ...optionTextSx, mt: 0.75 }}
        >
          {`Back to ${noun}s`}
        </Link>
      </Box>
    )
  }

  return (
    <Autocomplete<RecipientOption, false, true>
      size="small"
      disableClearable
      openOnFocus
      autoHighlight
      options={[...recipients.map((recipient) => ({ kind: 'listed' as const, recipient })), SOMEONE_ELSE]}
      filterOptions={(all, { inputValue }) => {
        const words = inputValue.toLowerCase().split(/\s+/).filter(Boolean)
        const matches = all.filter(
          (option) =>
            option.kind === 'listed' &&
            words.every((word) => `${option.recipient.name} ${option.recipient.email}`.toLowerCase().includes(word)),
        )
        return [...matches, SOMEONE_ELSE]
      }}
      getOptionLabel={(option) => (option.kind === 'listed' ? option.recipient.name : 'Someone else')}
      isOptionEqualToValue={() => false}
      onChange={(_, next) => {
        if (next.kind === 'listed') onPick({ name: next.recipient.name, email: next.recipient.email })
        else setElsewhere(true)
      }}
      onClose={(_, reason) => {
        if (reason === 'escape') onDismiss?.()
      }}
      renderOption={({ key, ...props }, option) => (
        <Box component="li" key={key} {...props} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          {option.kind === 'listed' ? (
            <>
              <PersonOutlineIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.25 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={optionTextSx}>{option.recipient.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
                  {option.recipient.email}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <PersonAddAltOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.25 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={optionTextSx}>Someone else</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
                  {`${/^[aeiou]/.test(noun) ? 'An' : 'A'} ${noun} not on the list`}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={`Search ${noun}s…`}
          autoFocus
          helperText={`Who should receive this email?`}
          inputProps={{ ...params.inputProps, 'aria-label': role }}
          FormHelperTextProps={helperSx}
          sx={draftInputSx}
        />
      )}
      slotProps={{ listbox: { sx: { fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' } } }}
    />
  )
}
