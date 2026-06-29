import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Button } from '@/design-system/components'

type FilterPanelProps = {
  onClose?: () => void
}

const filterFields = ['Policy term', 'Transactions', 'Claims', 'Emails'] as const

export function FilterPanel({ onClose }: FilterPanelProps) {
  const [excludeVoided, setExcludeVoided] = useState(true)

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Filter
        </Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose} aria-label="Close filter panel">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <Stack spacing={2.5} sx={{ px: 2, py: 2.5, flexGrow: 1, overflowY: 'auto' }}>
        {filterFields.map((field) => (
          <FormControl key={field} fullWidth size="small">
            <InputLabel>{field}</InputLabel>
            <Select label={field} defaultValue="">
              <MenuItem value="">
                <em>Select</em>
              </MenuItem>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="current">Current term</MenuItem>
            </Select>
          </FormControl>
        ))}

        <FormControlLabel
          control={
            <Switch
              checked={excludeVoided}
              onChange={(event) => setExcludeVoided(event.target.checked)}
              color="primary"
            />
          }
          label="Exclude voided transactions"
          sx={{ ml: 0 }}
        />
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        sx={{ px: 2, py: 2, borderTop: 1, borderColor: 'divider' }}
      >
        <Button variant="text" color="inherit" sx={{ textTransform: 'none' }}>
          Clear all
        </Button>
        <Button variant="contained" color="primary" sx={{ textTransform: 'none' }}>
          Apply filters
        </Button>
      </Stack>
    </Box>
  )
}
