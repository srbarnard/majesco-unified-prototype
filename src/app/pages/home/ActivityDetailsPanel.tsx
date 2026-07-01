import CloseIcon from '@mui/icons-material/Close'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import MuiButton from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router'
import type { RecentActivityItem } from '@/app/data/homeMock'
import { activityVisuals } from '@/app/pages/home/activityVisuals'
import { Button, StatusChip } from '@/design-system/components'
import { filterFooterButtonSx } from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import {
  TaskDetailAccordion,
  TaskDetailText,
  TaskEntityRow,
} from '@/pages/tasks/components/TaskDetailSection'
import { TaskDescriptionCard } from '@/pages/tasks/components/TaskDescriptionCard'

const GUTTER = layoutTokens.contentPaddingX / 8
const contentPaddingX = `${layoutTokens.contentPaddingX}px`

type ActivityDetailsPanelProps = {
  activity: RecentActivityItem
  onClose?: () => void
  onRecommendationClick?: (insight: string) => void
}

function getFieldsSectionTitle(kind: RecentActivityItem['kind']): string {
  switch (kind) {
    case 'endorsement':
      return 'Endorsement details'
    case 'renewal':
      return 'Renewal terms'
    case 'task':
      return 'Task summary'
    case 'document':
      return 'Document details'
    case 'policy':
      return 'Change details'
    case 'claim':
      return 'Claim details'
    case 'billing':
      return 'Invoice details'
    case 'quote':
      return 'Quote details'
    default:
      return 'Details'
  }
}

function getActivityFooterCaption(activity: RecentActivityItem) {
  if (activity.policyNumber) {
    return `${activity.insuredName} · ${activity.policyNumber}`
  }
  if (activity.quoteNumber) {
    return `${activity.insuredName} · ${activity.quoteNumber}`
  }
  if (activity.claimNumber) {
    return `${activity.insuredName} · ${activity.claimNumber}`
  }
  return activity.insuredName
}

export function ActivityDetailsPanel({ activity, onClose, onRecommendationClick }: ActivityDetailsPanelProps) {
  const { typeLabel } = activityVisuals[activity.kind]
  const fieldsTitle = getFieldsSectionTitle(activity.kind)
  const footerCaption = getActivityFooterCaption(activity)
  const hasFooterLinks = Boolean(activity.primaryLink || activity.secondaryLink)

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
        sx={{
          px: contentPaddingX,
          pt: layoutTokens.policyHeaderTopPadding,
          pb: GUTTER,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h5" component="h2" sx={{ lineHeight: 1.35, mb: 0.5 }}>
            {activity.label}
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            spacing={0.75}
            sx={{ rowGap: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
              Ref. {activity.referenceId}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: figmaFontFamilyStack.body, userSelect: 'none' }}
            >
              ·
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
              {typeLabel}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: figmaFontFamilyStack.body, userSelect: 'none' }}
            >
              ·
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
              {activity.timestamp}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: figmaFontFamilyStack.body, userSelect: 'none' }}
            >
              ·
            </Typography>
            <StatusChip label={activity.status} status={activity.statusVariant} />
          </Stack>
        </Box>
        {onClose && (
          <IconButton size="small" onClick={onClose} aria-label="Close activity details" sx={{ mt: -0.25 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <Box
        sx={{
          px: contentPaddingX,
          pt: GUTTER,
          pb: GUTTER,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        <Stack spacing={GUTTER}>
          <TaskDescriptionCard
            description={activity.summary}
            copilotInsights={activity.insights}
            onRecommendationClick={onRecommendationClick}
          />

          <Stack spacing={0}>
            <TaskDetailAccordion title={fieldsTitle} defaultExpanded>
              <Stack spacing={0.75}>
                {activity.fields.map((field) => (
                  <TaskEntityRow key={field.label} label={field.label} value={field.value} />
                ))}
              </Stack>
            </TaskDetailAccordion>

            <TaskDetailAccordion title="Related entities" subtitle={activity.insuredName}>
              <Stack spacing={0.75}>
                <TaskEntityRow label="Insured" value={activity.insuredName} />
                <TaskEntityRow label="Policy #" value={activity.policyNumber ?? null} />
                <TaskEntityRow label="Quote #" value={activity.quoteNumber ?? null} />
                <TaskEntityRow label="Claim #" value={activity.claimNumber ?? null} />
              </Stack>
            </TaskDetailAccordion>

            <TaskDetailAccordion title="Activity" subtitle={activity.performedBy}>
              <TaskDetailText>{activity.detail}</TaskDetailText>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mt: 0.75 }}
              >
                Performed by {activity.performedBy}
              </Typography>
            </TaskDetailAccordion>
          </Stack>
        </Stack>
      </Box>

      {hasFooterLinks && (
        <Box
          sx={{
            px: contentPaddingX,
            py: GUTTER,
            bgcolor: 'background.paper',
            flexShrink: 0,
          }}
        >
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1.5} alignItems="stretch">
              {activity.primaryLink ? (
                <MuiButton
                  component={RouterLink}
                  to={activity.primaryLink.to}
                  variant="contained"
                  color="primary"
                  fullWidth
                  disableElevation
                  startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 18 }} />}
                  sx={filterFooterButtonSx}
                >
                  {activity.primaryLink.label}
                </MuiButton>
              ) : activity.secondaryLink ? (
                <Button variant="contained" color="primary" fullWidth disabled sx={filterFooterButtonSx}>
                  No primary action
                </Button>
              ) : null}
              {activity.secondaryLink ? (
                <MuiButton
                  component={RouterLink}
                  to={activity.secondaryLink.to}
                  variant="outlined"
                  color="primary"
                  fullWidth
                  disableElevation
                  startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    ...filterFooterButtonSx,
                    borderWidth: 2,
                    '&:hover': { borderWidth: 2 },
                  }}
                >
                  {activity.secondaryLink.label}
                </MuiButton>
              ) : (
                <Button variant="outlined" color="primary" disabled fullWidth sx={filterFooterButtonSx}>
                  No link
                </Button>
              )}
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: figmaFontFamilyStack.body, textAlign: 'center', lineHeight: 1.4 }}
            >
              {footerCaption}
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  )
}
