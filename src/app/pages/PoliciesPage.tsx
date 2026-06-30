import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router'
import { Button, Card } from '@/design-system/components'

export function PoliciesPage() {
  const navigate = useNavigate()

  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h2">
        Policies
      </Typography>
      <Card title="Policy Management" subtitle="Search, view, and manage policy records">
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Open a policy to view documents, analytics, and Copilot assistance.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ alignSelf: 'flex-start' }}
            onClick={() => navigate('/policies/01-CA-000100005-0')}
          >
            Harborline Logistics, LLC
          </Button>
        </Stack>
      </Card>
    </Stack>
  )
}
