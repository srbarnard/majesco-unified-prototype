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
import { CopilotInsightBox, StatusChip } from '@/design-system/components'
import { filterFooterButtonSx } from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import {
  TaskDetailSection,
  TaskDetailText,
  TaskEntityRow,
} from '@/pages/tasks/components/TaskDetailSection'

type ActivityDetailsPanelProps = {
  activity: RecentActivityItem
  onClose?: () => void
}

function ActivityTypeAvatar({ activity }: { activity: RecentActivityItem }) {
  const { Icon, color, bgcolor } = activityVisuals[activity.kind]

  return (
    <Box
      sx={(theme) => ({
        width: 40,
        height: 40,
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        bgcolor: bgcolor(theme),
        color: color(theme),
      })}
    >
      <Icon sx={{ fontSize: 22 }} />
    </Box>
  )
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

export function ActivityDetailsPanel({ activity, onClose }: ActivityDetailsPanelProps) {
  const { typeLabel } = activityVisuals[activity.kind]
  const fieldsTitle = getFieldsSectionTitle(activity.kind)

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
        spacing={1.5}
        sx={{
          px: 2,
          pt: layoutTokens.policyHeaderTopPadding,
          pb: 1.5,
          bgcolor: (theme) => surfaceMuted(theme),
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
          <ActivityTypeAvatar activity={activity} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontFamily: figmaFontFamilyStack.body,
                fontWeight: 400,
                fontSize: '0.9375rem',
                lineHeight: 1.35,
                mb: 0.5,
              }}
            >
              {activity.label}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
              Ref. {activity.referenceId} · {typeLabel} · {activity.timestamp}
            </Typography>
          </Box>
        </Stack>
        {onClose && (
          <IconButton size="small" onClick={onClose} aria-label="Close activity details" sx={{ mt: -0.25 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <Stack spacing={2} sx={{ px: 2, py: 2, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <StatusChip label={activity.status} status={activity.statusVariant} />
        </Stack>

        <TaskDetailSection title="Summary" card>
          <TaskDetailText>{activity.summary}</TaskDetailText>
        </TaskDetailSection>

        <TaskDetailSection title={fieldsTitle} card>
          <Stack spacing={0.75}>
            {activity.fields.map((field) => (
              <TaskEntityRow key={field.label} label={field.label} value={field.value} />
            ))}
          </Stack>
        </TaskDetailSection>

        <TaskDetailSection title="Related entities" card>
          <Stack spacing={0.75}>
            <TaskEntityRow label="Insured" value={activity.insuredName} />
            <TaskEntityRow label="Policy #" value={activity.policyNumber} />
            <TaskEntityRow label="Quote #" value={activity.quoteNumber} />
            <TaskEntityRow label="Claim #" value={activity.claimNumber} />
          </Stack>
        </TaskDetailSection>

        <TaskDetailSection title="Activity" card>
          <TaskDetailText>{activity.detail}</TaskDetailText>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mt: 0.75 }}
          >
            Performed by {activity.performedBy}
          </Typography>
        </TaskDetailSection>

        {activity.insights.length > 0 && (
          <CopilotInsightBox title="Copilot insights">
            <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.25 }}>
              {activity.insights.map((insight) => (
                <Typography
                  key={insight}
                  component="li"
                  variant="body2"
                  sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', lineHeight: 1.5 }}
                >
                  {insight}
                </Typography>
              ))}
            </Stack>
          </CopilotInsightBox>
        )}
      </Stack>

      {(activity.primaryLink || activity.secondaryLink) && (
        <Stack
          spacing={1}
          sx={{
            px: 2,
            py: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: (theme) => surfaceMuted(theme),
            flexShrink: 0,
          }}
        >
          {activity.primaryLink && (
            <MuiButton
              component={RouterLink}
              to={activity.primaryLink.to}
              variant="contained"
              color="primary"
              fullWidth
              disableElevation
              startIcon={<OpenInNewOutlinedIcon />}
              sx={filterFooterButtonSx}
            >
              {activity.primaryLink.label}
            </MuiButton>
          )}
          {activity.secondaryLink && (
            <MuiButton
              component={RouterLink}
              to={activity.secondaryLink.to}
              variant="outlined"
              color="inherit"
              fullWidth
              disableElevation
              startIcon={<OpenInNewOutlinedIcon />}
              sx={filterFooterButtonSx}
            >
              {activity.secondaryLink.label}
            </MuiButton>
          )}
        </Stack>
      )}
    </Box>
  )
}
