import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export function DashboardPage() {
  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" component="h2">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to the Majesco Unified Prototype. Use the sidebar to navigate
          between application flows.
        </Typography>
      </Stack>
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Getting started
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This project is organized with a design system layer for shared theme
          tokens and UI primitives, and an application layer for routes, layouts,
          and page flows.
        </Typography>
      </Paper>
    </Stack>
  )
}
