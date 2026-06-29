import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Button, Card, DataTable, StatusChip } from '@/design-system/components'

type ActivityRow = {
  id: string
  reference: string
  customer: string
  type: string
  status: 'success' | 'warning' | 'error' | 'info'
  updated: string
}

const stats = [
  { label: 'Active Policies', value: '12,847', change: '+4.2%' },
  { label: 'Open Claims', value: '326', change: '-1.8%' },
  { label: 'Pending Tasks', value: '58', change: '+12 today' },
  { label: 'Premium MTD', value: '$4.2M', change: '+6.1%' },
]

const activityRows: ActivityRow[] = [
  {
    id: '1',
    reference: 'POL-2026-10482',
    customer: 'Acme Insurance Co.',
    type: 'Policy',
    status: 'success',
    updated: '2 min ago',
  },
  {
    id: '2',
    reference: 'CLM-2026-00931',
    customer: 'Riverdale Mutual',
    type: 'Claim',
    status: 'warning',
    updated: '18 min ago',
  },
  {
    id: '3',
    reference: 'POL-2026-10479',
    customer: 'Summit Life Group',
    type: 'Policy',
    status: 'info',
    updated: '1 hr ago',
  },
  {
    id: '4',
    reference: 'CLM-2026-00928',
    customer: 'Harbor Health',
    type: 'Claim',
    status: 'error',
    updated: '3 hr ago',
  },
]

export function DashboardPage() {
  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" component="h2" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Overview of policies, claims, and operational activity.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="primary">
            Export
          </Button>
          <Button variant="contained" color="primary">
            New Policy
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card title={stat.label}>
              <Typography variant="h4" component="p" fontWeight={600}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {stat.change}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card
        title="Recent Activity"
        subtitle="Latest policy and claim updates across your book of business"
        headerAction={
          <Button size="small" variant="text" color="primary">
            View all
          </Button>
        }
      >
        <DataTable<ActivityRow>
          columns={[
            { id: 'reference', label: 'Reference' },
            { id: 'customer', label: 'Customer' },
            { id: 'type', label: 'Type' },
            {
              id: 'status',
              label: 'Status',
              render: (row) => (
                <StatusChip
                  status={row.status}
                  label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                />
              ),
            },
            { id: 'updated', label: 'Updated', align: 'right' },
          ]}
          rows={activityRows}
          getRowId={(row) => row.id}
        />
      </Card>
    </Stack>
  )
}
