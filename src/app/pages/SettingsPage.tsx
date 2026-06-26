import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export function SettingsPage() {
  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" component="h2">
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure application preferences and environment options.
        </Typography>
      </Stack>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Settings content will live here as flows are added to the prototype.
        </Typography>
      </Paper>
    </Stack>
  )
}
