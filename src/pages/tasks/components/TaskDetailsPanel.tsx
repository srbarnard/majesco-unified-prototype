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
  InsightCallout,
  StatusChip,
} from '@/design-system/components'
import { filterFooterButtonSx } from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import {
  TaskDetailAccordion,
  TaskDetailText,
  TaskEntityRow,
} from '@/pages/tasks/components/TaskDetailSection'
import { TaskDescriptionCard } from '@/pages/tasks/components/TaskDescriptionCard'
import { TaskPriorityIndicator } from '@/pages/tasks/components/TaskPriorityIndicator'
import { TaskStatusChip } from '@/pages/tasks/components/TaskStatusChip'
import type { TaskRecord } from '@/pages/tasks/data/mockTasks'
import { getTaskRelatedEntityRoute, getTaskRelatedSummary } from '@/pages/tasks/data/mockTasks'
import {
  getTaskDocumentChipVariant,
  getTaskSlaTone,
} from '@/pages/tasks/utils/taskDisplayUtils'

const GUTTER = layoutTokens.contentPaddingX / 8
const contentPaddingX = `${layoutTokens.contentPaddingX}px`

type TaskDetailsPanelProps = {
  task: TaskRecord
  onClose?: () => void
  onMarkComplete?: (task: TaskRecord) => void
  onRecommendationClick?: (insight: string) => void
}

function formatDueDate(dueDate: string) {
  return new Date(dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function TaskDetailsPanel({ task, onClose, onMarkComplete, onRecommendationClick }: TaskDetailsPanelProps) {
  const related = getTaskRelatedSummary(task)
  const relatedRoute = getTaskRelatedEntityRoute(task)
  const { relatedEntities } = task
  const dueLabel = formatDueDate(task.dueDate)

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', overflow: 'hidden' }}>
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
            {task.taskName}
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            spacing={0.75}
            sx={{ rowGap: 0.5 }}
          >
            <TaskPriorityIndicator priority={task.priority} />
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: figmaFontFamilyStack.body, userSelect: 'none' }}
            >
              ·
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
              Ref. {task.refNumber}
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
              {task.theme}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: figmaFontFamilyStack.body, userSelect: 'none' }}
            >
              ·
            </Typography>
            <TaskStatusChip displayStatus={task.displayStatus} />
          </Stack>
        </Box>
        {onClose && (
          <IconButton size="small" onClick={onClose} aria-label="Close task details" sx={{ mt: -0.25 }}>
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
          {task.blockingIssues && (
            <InsightCallout variant="error" title="Blocking issue">
              <TaskDetailText>{task.blockingIssues}</TaskDetailText>
            </InsightCallout>
          )}

          <TaskDescriptionCard
            description={task.description}
            copilotInsights={task.copilotInsights}
            onRecommendationClick={onRecommendationClick}
          />

          <Stack spacing={0}>
            <TaskDetailAccordion title="Next action" defaultExpanded>
              <TaskDetailText>{task.nextAction}</TaskDetailText>
            </TaskDetailAccordion>

            <TaskDetailAccordion
              title="SLA / due"
              subtitle={`${task.ageIndicator} · Due ${dueLabel}`}
            >
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
                Due {dueLabel}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mt: 0.75 }}
              >
                {task.agingDays}d open · {task.priorityReason}
              </Typography>
              <Divider sx={{ my: 1.25 }} />
              <Typography variant="subtitle2" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', mb: 0.5 }}>
                Assignment
              </Typography>
              <TaskDetailText>{task.assignedTo}</TaskDetailText>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mt: 0.5 }}
              >
                {task.team} · Assigned by {task.assigner}
              </Typography>
            </TaskDetailAccordion>

            <TaskDetailAccordion
              title="Related entities"
              subtitle={related.primary}
            >
              <Stack spacing={0.75}>
                <TaskEntityRow label="Insured" value={relatedEntities.insuredName} />
                <TaskEntityRow label="Policy #" value={relatedEntities.policyNumber} />
                <TaskEntityRow label="Quote #" value={relatedEntities.quoteNumber} />
                <TaskEntityRow label="Claim #" value={relatedEntities.claimNumber} />
                <TaskEntityRow label="Submission" value={relatedEntities.submissionId} />
                <TaskEntityRow label="Producer" value={relatedEntities.producer} />
              </Stack>
            </TaskDetailAccordion>

            {task.documents.length > 0 && (
              <TaskDetailAccordion
                title="Documents"
                subtitle={`${task.documents.length} file${task.documents.length === 1 ? '' : 's'}`}
              >
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
              </TaskDetailAccordion>
            )}

            {task.notes && (
              <TaskDetailAccordion title="Notes">
                <TaskDetailText>{task.notes}</TaskDetailText>
              </TaskDetailAccordion>
            )}
          </Stack>
        </Stack>
      </Box>

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
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 18 }} />}
              onClick={() => onMarkComplete?.(task)}
              sx={filterFooterButtonSx}
            >
              Mark complete
            </Button>
            {relatedRoute ? (
              <MuiButton
                component={RouterLink}
                to={relatedRoute.to}
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
                {relatedRoute.label}
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
            {related.primary} · {related.secondary}
          </Typography>
        </Stack>
      </Box>
    </Box>
  )
}
