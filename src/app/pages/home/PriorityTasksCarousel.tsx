import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { priorityTasksMock, type PriorityTaskCard } from '@/app/data/homeMock'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

const CARD_WIDTH = 272
const CARD_GAP = 12

const priorityColors = {
  High: '#DC2626',
  Medium: '#EA580C',
  Low: '#16A34A',
} as const

function TaskCard({ task }: { task: PriorityTaskCard }) {
  return (
    <Box
      data-task-card
      sx={{
        width: CARD_WIDTH,
        flex: `0 0 ${CARD_WIDTH}px`,
        p: 2,
        borderRadius: 2,
        bgcolor: (theme) => theme.figmaPalette.grey[50],
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, mb: 0.5 }}
      >
        {task.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body, mb: 0.25 }}>
        {task.account}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mb: 1.5 }}>
        Policy #: {task.policyNumber}
      </Typography>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: priorityColors[task.priority],
            }}
          />
          <Typography variant="caption" sx={{ fontFamily: figmaFontFamilyStack.body }}>
            {task.priority}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <AccessTimeOutlinedIcon
            sx={{ fontSize: 14, color: task.isPastDue ? 'error.main' : 'text.secondary' }}
          />
          <Typography
            variant="caption"
            sx={{
              fontFamily: figmaFontFamilyStack.body,
              color: task.isPastDue ? 'error.main' : 'text.secondary',
            }}
          >
            {task.dueLabel}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  )
}

export function PriorityTasksCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const isAdjustingScroll = useRef(false)

  const loopedTasks = useMemo(
    () => [
      ...priorityTasksMock.map((task) => ({ ...task, id: `${task.id}-clone-prev` })),
      ...priorityTasksMock,
      ...priorityTasksMock.map((task) => ({ ...task, id: `${task.id}-clone-next` })),
    ],
    [],
  )

  const setWidth = priorityTasksMock.length * (CARD_WIDTH + CARD_GAP)

  const normalizeScroll = useCallback(() => {
    const node = scrollerRef.current
    if (!node || isAdjustingScroll.current) return

    if (node.scrollLeft < setWidth * 0.5) {
      isAdjustingScroll.current = true
      node.scrollLeft += setWidth
      isAdjustingScroll.current = false
    } else if (node.scrollLeft > setWidth * 1.5) {
      isAdjustingScroll.current = true
      node.scrollLeft -= setWidth
      isAdjustingScroll.current = false
    }
  }, [setWidth])

  useEffect(() => {
    const node = scrollerRef.current
    if (!node) return
    node.scrollLeft = setWidth
  }, [setWidth])

  const scroll = (direction: 'left' | 'right') => {
    const node = scrollerRef.current
    if (!node) return
    node.scrollBy({ left: direction === 'left' ? -(CARD_WIDTH + CARD_GAP) : CARD_WIDTH + CARD_GAP, behavior: 'smooth' })
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography variant="subtitle1" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
            Your priority tasks
          </Typography>
          <IconButton size="small" aria-label="Previous tasks" onClick={() => scroll('left')}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="Next tasks" onClick={() => scroll('right')}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <Box
        ref={scrollerRef}
        onScroll={normalizeScroll}
        sx={{
          display: 'flex',
          gap: `${CARD_GAP}px`,
          overflowX: 'auto',
          pb: 0.5,
          scrollSnapType: 'x proximity',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          '& [data-task-card]': {
            scrollSnapAlign: 'start',
          },
        }}
      >
        {loopedTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </Box>
    </Box>
  )
}
