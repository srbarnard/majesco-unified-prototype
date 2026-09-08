import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { priorityTasksMock, type PriorityTaskCard } from '@/app/data/homeMock'
import {
  getAnalyticsSurfaceToneStyles,
  type AnalyticsSurfaceTone,
} from '@/design-system/components/analytics/AnalyticsSurfaceCard'
import type { AppTheme } from '@/design-system/theme'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { motionTokens } from '@/design-system/tokens/motion'
import { surfaceMuted, surfaceSubtle } from '@/design-system/theme/themeSurfaces'

const motionSafe = '@media (prefers-reduced-motion: no-preference)'

const CARD_GAP = 12
const PEEK_PX = 32
const VISIBLE_CARD_COUNT = 4
const MIN_CARD_WIDTH = 200
const RAIL_WIDTH = 4
const CARD_INNER_PADDING = 16

function getTaskRailTone(priority: PriorityTaskCard['priority'], isPastDue: boolean): AnalyticsSurfaceTone {
  if (isPastDue || priority === 'High') return 'error'
  if (priority === 'Medium') return 'warning'
  if (priority === 'Low') return 'info'
  return 'neutral'
}

function TaskCard({
  task,
  cardWidth,
  onOpen,
}: {
  task: PriorityTaskCard
  cardWidth: number
  onOpen: (task: PriorityTaskCard) => void
}) {
  const theme = useTheme() as AppTheme
  const isPastDue = Boolean(task.isPastDue)
  const railTone = getTaskRailTone(task.priority, isPastDue)
  const railColor = getAnalyticsSurfaceToneStyles(railTone, theme).accent

  return (
    <Box
      component="button"
      type="button"
      data-task-card
      onClick={() => onOpen(task)}
      sx={(t) => ({
        width: cardWidth,
        flex: `0 0 ${cardWidth}px`,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: `${layoutTokens.cardRadius}px`,
        bgcolor: surfaceMuted(t),
        border: 'none',
        boxShadow: 'none',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        p: 0,
        pl: `${RAIL_WIDTH + CARD_INNER_PADDING}px`,
        pr: `${CARD_INNER_PADDING}px`,
        pt: `${CARD_INNER_PADDING}px`,
        pb: `${CARD_INNER_PADDING}px`,
        transition: `background-color 0.15s ease, transform ${motionTokens.durationFastMs}ms ${motionTokens.easing}`,
        '& [data-task-title]': { transition: 'color 0.15s ease' },
        '&:hover': {
          '& [data-task-title]': { color: 'primary.main' },
          bgcolor: surfaceSubtle(t),
        },
        [motionSafe]: {
          '&:hover': {
            transform: `translateY(${motionTokens.cardHoverTranslateY}px) scale(${motionTokens.cardHoverScale})`,
            zIndex: 1,
          },
        },
        '&:focus-visible': {
          outline: 2,
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      })}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: RAIL_WIDTH,
          bgcolor: railColor,
          borderRadius: '2px 0 0 2px',
        }}
      />

      <Typography
        data-task-title
        variant="subtitle2"
        sx={{
          fontFamily: figmaFontFamilyStack.heading,
          fontWeight: 600,
          fontSize: '0.8125rem',
          lineHeight: 1.4,
          color: 'text.primary',
          mb: 0.75,
        }}
      >
        {task.title}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontFamily: figmaFontFamilyStack.body,
          display: 'block',
          mb: 0.25,
        }}
      >
        {task.account}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mb: 1.25 }}
      >
        Policy # {task.policyNumber}
      </Typography>

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: getAnalyticsSurfaceToneStyles(railTone, theme).value,
            }}
          />
          <Typography variant="caption" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.6875rem', color: 'text.secondary' }}>
            {task.priority}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <AccessTimeOutlinedIcon
            sx={{ fontSize: 14, color: isPastDue ? 'error.main' : 'text.secondary' }}
          />
          <Typography
            variant="caption"
            sx={{
              fontFamily: figmaFontFamilyStack.body,
              fontSize: '0.6875rem',
              fontWeight: isPastDue ? 600 : 400,
              color: isPastDue ? 'error.main' : 'text.secondary',
            }}
          >
            {task.dueLabel}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  )
}

function useCarouselWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const update = () => {
      const next = node.getBoundingClientRect().width
      if (next > 0) setWidth(next)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const cardWidth = useMemo(() => {
    if (width <= 0) return MIN_CARD_WIDTH
    const gaps = CARD_GAP * (VISIBLE_CARD_COUNT - 1)
    const next = (width - PEEK_PX - gaps) / VISIBLE_CARD_COUNT
    return Math.max(MIN_CARD_WIDTH, Math.floor(next))
  }, [width])

  return { ref, cardWidth }
}

type PriorityTasksCarouselProps = {
  onTaskOpen?: (task: PriorityTaskCard) => void
}

export function PriorityTasksCarousel({ onTaskOpen }: PriorityTasksCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const isAdjustingScroll = useRef(false)
  const { ref: containerRef, cardWidth } = useCarouselWidth()

  const taskCount = priorityTasksMock.length
  const cardStep = cardWidth + CARD_GAP
  const setWidth = taskCount * cardStep

  const loopedTasks = useMemo(
    () => [
      ...priorityTasksMock.map((task) => ({ ...task, id: `${task.id}-clone-prev` })),
      ...priorityTasksMock,
      ...priorityTasksMock.map((task) => ({ ...task, id: `${task.id}-clone-next` })),
    ],
    [],
  )

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
    if (!node || setWidth <= 0) return
    node.scrollLeft = setWidth
  }, [setWidth])

  const scroll = (direction: 'left' | 'right') => {
    const node = scrollerRef.current
    if (!node) return
    node.scrollBy({
      left: direction === 'left' ? -cardStep : cardStep,
      behavior: 'smooth',
    })
  }

  const handleOpen = useCallback(
    (task: PriorityTaskCard) => {
      onTaskOpen?.(task)
    },
    [onTaskOpen],
  )

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography variant="subtitle1" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
            Priority tasks
          </Typography>
          <IconButton size="small" aria-label="Previous tasks" onClick={() => scroll('left')}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="Next tasks" onClick={() => scroll('right')}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Typography
          component={Link}
          to="/tasks"
          variant="body2"
          color="primary"
          sx={{
            fontFamily: figmaFontFamilyStack.body,
            textDecoration: 'none',
            fontSize: '0.8125rem',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          View all
        </Typography>
      </Stack>

      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          overflow: 'hidden',
          my: -0.5,
          py: 0.5,
        }}
      >
        <Box
          ref={scrollerRef}
          onScroll={normalizeScroll}
          sx={{
            display: 'flex',
            gap: `${CARD_GAP}px`,
            overflowX: 'auto',
            overflowY: 'visible',
            pt: 0.5,
            pb: 1.5,
            scrollSnapType: 'x proximity',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            '& [data-task-card]': {
              scrollSnapAlign: 'start',
            },
          }}
        >
          {loopedTasks.map((task) => (
            <TaskCard key={task.id} task={task} cardWidth={cardWidth} onOpen={handleOpen} />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
