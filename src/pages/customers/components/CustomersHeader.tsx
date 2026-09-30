import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Button } from '@/design-system/components'
import { listPageCreateButtonSx } from '@/design-system/tokens/listPageHeader'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

export function CustomersHeader({ onAddCustomer }: { onAddCustomer: () => void }) {
  const contentPx = `${layoutTokens.contentPaddingX}px`

  return (
    <Box sx={{ bgcolor: 'background.paper', width: '100%', flexShrink: 0 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1.5}
        sx={{ px: contentPx, pt: layoutTokens.policyHeaderTopPadding, pb: 1.5 }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontFamily: figmaFontFamilyStack.heading,
            fontWeight: 600,
            fontSize: { xs: '1.25rem', md: '1.375rem' },
            lineHeight: 1.3,
            minWidth: 0,
          }}
        >
          Customers
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          aria-label="Add customer"
          onClick={onAddCustomer}
          sx={listPageCreateButtonSx}
        >
          <span className="create-btn-label">Add customer</span>
        </Button>
      </Stack>
    </Box>
  )
}
