import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Card } from '@/design-system/components'

export function CustomersPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h2">
        Customers
      </Typography>
      <Card title="Customer Directory" subtitle="Manage customer profiles and relationships">
        <Typography variant="body2" color="text.secondary">
          Customer 360 views and search will be added from Figma wireframes.
        </Typography>
      </Card>
    </Stack>
  )
}
