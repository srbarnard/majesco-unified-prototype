import Typography from '@mui/material/Typography'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type HomeGreetingSectionProps = {
  greeting: string
}

export function HomeGreetingSection({ greeting }: HomeGreetingSectionProps) {
  return (
    <Typography
      variant="h5"
      component="h1"
      sx={{
        fontFamily: figmaFontFamilyStack.heading,
        fontWeight: 600,
        fontSize: { xs: '1.25rem', md: '1.375rem' },
        lineHeight: 1.3,
      }}
    >
      {greeting}, Chris
    </Typography>
  )
}
