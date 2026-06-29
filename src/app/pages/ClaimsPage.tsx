import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Card } from '@/design-system/components'

export function ClaimsPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h2">
        Claims
      </Typography>
      <Card title="Claims Processing" subtitle="Track and adjudicate open claims">
        <Typography variant="body2" color="text.secondary">
          Claims intake and processing flows will be implemented from design specs.
        </Typography>
      </Card>
    </Stack>
  )
}
