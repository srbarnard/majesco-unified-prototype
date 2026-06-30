import SearchIcon from '@mui/icons-material/Search'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { analyticsFilterInputSx } from '@/design-system/components/analytics/analyticsStyles'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type StudioSearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export function StudioSearchField({ value, onChange, placeholder }: StudioSearchFieldProps) {
  return (
    <TextField
      fullWidth
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            </InputAdornment>
          ),
        },
      }}
      sx={(theme) => ({
        ...analyticsFilterInputSx(theme),
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          fontFamily: figmaFontFamilyStack.body,
        },
      })}
    />
  )
}
