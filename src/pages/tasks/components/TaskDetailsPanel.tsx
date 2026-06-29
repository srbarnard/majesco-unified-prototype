import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MuiButton from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router'
import {
  Button,
  CopilotIcon,
  CopilotInsightBox,
  InsightCallout,
  StatusChip,
} from '@/design-system/components'
import { filterFooterButtonSx } from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import {
  TaskDetailSection,
  TaskDetailText,
  TaskEntityRow,
} from '@/pages/tasks/components/TaskDetailSection'
import { TaskStatusChip } from '@/pages/tasks/components/TaskStatusChip'
import type { TaskRecord } from '@/pages/tasks/data/mockTasks'
import { getTaskRelatedEntityRoute, getTaskRelatedSummary } from '@/pages/tasks/data/mockTasks'
import {
  getTaskDocumentChipVariant,
  getTaskPriorityChipVariant,
  getTaskSlaTone,
} from '@/pages/tasks/utils/taskDisplayUtils'

type TaskDetailsPanelProps = {
  task: TaskRecord
  onClose?: () => void
  onMarkComplete?: (task: TaskRecord) => void
  onAskCopilot?: (task: TaskRecord) => void
}

export function TaskDetailsPanel({ task, onClose, onMarkComplete, onAskCopilot }: TaskDetailsPanelProps) {
  const related = getTaskRelatedSummary(task)
  const relatedRoute = getTaskRelatedEntityRoute(task)
  const { relatedEntities } = task

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', overflow: 'hidden' }}>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
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
            {task.taskName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
            Ref. {task.refNumber} · {task.theme}
          </Typography>
        </Box>
        {onClose && (
          <IconButton size="small" onClick={onClose} aria-label="Close task details" sx={{ mt: -0.25 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <Stack spacing={2} sx={{ px: 2, py: 2, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <TaskStatusChip displayStatus={task.displayStatus} />
          <StatusChip label={task.priority} status={getTaskPriorityChipVariant(task.priority)} />
        </Stack>

        <TaskDetailSection title="Description" card>
          <TaskDetailText>{task.description}</TaskDetailText>
        </TaskDetailSection>

        <TaskDetailSection title="Next action" card>
          <TaskDetailText>{task.nextAction}</TaskDetailText>
        </TaskDetailSection>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Box sx={{ flex: 1 }}>
            <TaskDetailSection title="SLA / due" card>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: figmaFontFamilyStack.body,
                  fontSize: '0.875rem',
                  lineHeight: 1.55,
                  color: getTaskSlaTone(task),
                  fontWeight: task.isPastDue ? 600 : 400,
                }}
              >
                {task.ageIndicator}
                {' · '}
                Due{' '}
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mt: 0.5 }}
              >
                {task.agingDays}d open · {task.priorityReason}
              </Typography>
            </TaskDetailSection>
          </Box>
          <Box sx={{ flex: 1 }}>
            <TaskDetailSection title="Assignment" card>
              <TaskDetailText>{task.assignedTo}</TaskDetailText>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mt: 0.5 }}
              >
                {task.team} · Assigned by {task.assigner}
              </Typography>
            </TaskDetailSection>
          </Box>
        </Stack>

        <TaskDetailSection title="Related entities" card>
          <Stack spacing={0.75}>
            <TaskEntityRow label="Insured" value={relatedEntities.insuredName} />
            <TaskEntityRow label="Policy #" value={relatedEntities.policyNumber} />
            <TaskEntityRow label="Quote #" value={relatedEntities.quoteNumber} />
            <TaskEntityRow label="Claim #" value={relatedEntities.claimNumber} />
            <TaskEntityRow label="Submission" value={relatedEntities.submissionId} />
            <TaskEntityRow label="Producer" value={relatedEntities.producer} />
          </Stack>
        </TaskDetailSection>

        {task.copilotInsights.length > 0 && (
          <CopilotInsightBox title="Copilot recommendations">
            <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.25 }}>
              {task.copilotInsights.map((insight) => (
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

        {task.documents.length > 0 && (
          <TaskDetailSection title="Documents" card>
            <Stack spacing={0.75} divider={<Divider flexItem />}>
              {task.documents.map((doc) => (
                <Stack key={doc.name} direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                  <Typography variant="body2" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', flex: 1 }}>
                    {doc.name}
                    {doc.required ? '' : ' (optional)'}
                  </Typography>
                  <StatusChip label={doc.status} status={getTaskDocumentChipVariant(doc.status)} />
                </Stack>
              ))}
            </Stack>
          </TaskDetailSection>
        )}

        {task.blockingIssues && (
          <InsightCallout variant="error" title="Blocking issue">
            <TaskDetailText>{task.blockingIssues}</TaskDetailText>
          </InsightCallout>
        )}

        {task.notes && (
          <TaskDetailSection title="Notes" card>
            <TaskDetailText>{task.notes}</TaskDetailText>
          </TaskDetailSection>
        )}
      </Stack>

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
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<CheckCircleOutlineIcon />}
          onClick={() => onMarkComplete?.(task)}
          sx={filterFooterButtonSx}
        >
          Mark complete
        </Button>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            startIcon={<CopilotIcon size={16} />}
            onClick={() => onAskCopilot?.(task)}
            sx={{ ...filterFooterButtonSx, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
          >
            Ask Copilot
          </Button>
          {relatedRoute ? (
            <MuiButton
              component={RouterLink}
              to={relatedRoute.to}
              variant="outlined"
              color="inherit"
              fullWidth
              disableElevation
              startIcon={<OpenInNewOutlinedIcon />}
              sx={filterFooterButtonSx}
            >
              {relatedRoute.label}
            </MuiButton>
          ) : (
            <Button variant="outlined" color="inherit" fullWidth disabled sx={filterFooterButtonSx}>
              No linked record
            </Button>
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body, textAlign: 'center' }}>
          {related.primary} · {related.secondary}
        </Typography>
      </Stack>
    </Box>
  )
}
