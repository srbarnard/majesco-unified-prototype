import Typography from '@mui/material/Typography'
import { Card } from '@/design-system/components'

type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Card title={title}>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Card>
  )
}
