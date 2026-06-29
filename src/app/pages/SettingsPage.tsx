import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Card } from '@/design-system/components'

export function SettingsPage() {
  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" component="h2">
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Application preferences.
        </Typography>
      </Stack>

      <Card title="Appearance" subtitle="Theme configuration">
        <Typography variant="body2" color="text.secondary">
          Light mode is enabled for this prototype.
        </Typography>
      </Card>
    </Stack>
  )
}
