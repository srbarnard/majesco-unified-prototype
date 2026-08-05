import type { CSSObject } from '@mui/material/styles'
import type { SxProps, Theme } from '@mui/material/styles'

export const motionTokens = {
  durationMs: 250,
  durationFastMs: 200,
  /** General UI easing — buttons, cards, etc. */
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  buttonPressScale: 0.97,
  cardHoverTranslateY: -4,
  cardHoverScale: 1.02,
} as const

/** Copilot / drawer body content swap — short fade + slight vertical move. */
export const copilotContentMotion = {
  exitMs: 160,
  enterMs: 220,
  offsetPx: 8,
  /** Ease-out on exit; slightly quicker ease-in on enter. */
  exitEasing: 'cubic-bezier(0, 0, 0.2, 1)',
  enterEasing: 'cubic-bezier(0.42, 0, 1, 1)',
  easing: 'cubic-bezier(0.42, 0, 1, 1)',
} as const

/**
 * Docked / modal drawer show-hide motion.
 * Soft ease-out both ways — quick start, gentle decelerate (Linear/Notion feel).
 */
export const drawerMotion = {
  enterMs: 300,
  exitMs: 300,
  /** Soft ease-out: starts promptly, settles without a hard stop. */
  enterEasing: 'cubic-bezier(0.32, 0.72, 0, 1)',
  exitEasing: 'cubic-bezier(0.32, 0.72, 0, 1)',
  /** Fallback for non-MUI panel keyframes / shared curves. */
  easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
  /** Legacy keyframe travel distance. */
  panelOffsetPx: 48,
  /** Subtle fade so the slide doesn’t feel like a hard cut. */
  panelFadeFrom: 0.96,
  /** Mobile/tablet bottom sheet height as viewport fraction */
  bottomSheetHeightVh: 90,
  bottomSheetTopRadiusPx: 16,
} as const

const motionSafe = '@media (prefers-reduced-motion: no-preference)'

export const drawerTransitionDuration = {
  enter: drawerMotion.enterMs,
  exit: drawerMotion.exitMs,
} as const

export const drawerTransitionEasing = {
  enter: drawerMotion.enterEasing,
  exit: drawerMotion.exitEasing,
} as const

/** Backdrop fades slightly quicker than the panel slide — soft, not laggy. */
export const backdropTransitionDuration = {
  enter: Math.round(drawerMotion.enterMs * 0.85),
  exit: Math.round(drawerMotion.exitMs * 0.85),
} as const

/**
 * Direct slotProps version for MUI Drawer / SwipeableDrawer.
 *
 * @example
 * <Drawer
 *   transitionDuration={drawerTransitionDuration}
 *   slotProps={getDrawerTransitionSlotProps(prefersReducedMotion)}
 * />
 */
export function getDrawerTransitionSlotProps(
  reducedMotion = false,
  options?: { direction?: 'left' | 'right' | 'up' | 'down' },
) {
  const direction = options?.direction

  if (reducedMotion) {
    return {
      transition: {
        timeout: 0,
        ...(direction ? { direction } : {}),
      },
      backdrop: { transitionDuration: 0 },
    } as const
  }

  return {
    transition: {
      easing: drawerTransitionEasing,
      timeout: drawerTransitionDuration,
      ...(direction ? { direction } : {}),
    },
    backdrop: {
      transitionDuration: backdropTransitionDuration,
    },
  } as const
}

/** Subtle scale-down on press — for MUI theme overrides. */
export const buttonPressStyles: CSSObject = {
  transition: `transform ${motionTokens.durationFastMs}ms ${motionTokens.easing}, background-color 0.15s ease`,
  [motionSafe]: {
    '&:active': {
      transform: `scale(${motionTokens.buttonPressScale})`,
    },
  },
}

/** Nav rail / sidebar list items — press scale, ripple-friendly, smooth state changes. */
export const navItemInteractionStyles: CSSObject = {
  overflow: 'hidden',
  transition: `transform ${motionTokens.durationFastMs}ms ${motionTokens.easing}, background-color 0.18s ease, color 0.15s ease`,
  [motionSafe]: {
    '&:active': {
      transform: `scale(${motionTokens.buttonPressScale})`,
    },
  },
  '& .MuiTouchRipple-child': {
    opacity: 0.18,
  },
}

/** Animated left-edge indicator for active nav items. */
export const navItemActiveIndicatorStyles: CSSObject = {
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '50%',
    width: 3,
    height: 0,
    opacity: 0,
    transform: 'translateY(-50%)',
    borderRadius: '0 2px 2px 0',
    bgcolor: 'primary.main',
    transition: `height ${motionTokens.durationFastMs}ms ${motionTokens.easing}, opacity 0.18s ease`,
  },
  '&[data-nav-active="true"]::before, &.Mui-selected::before': {
    height: '55%',
    opacity: 1,
  },
}

export function panelSlideInFromRightSx(): SxProps<Theme> {
  const { enterMs, enterEasing, panelOffsetPx, panelFadeFrom } = drawerMotion
  return {
    [motionSafe]: {
      animation: `panelSlideInRight ${enterMs}ms ${enterEasing} both`,
      '@keyframes panelSlideInRight': {
        from: {
          transform: `translateX(${panelOffsetPx}px)`,
          opacity: panelFadeFrom,
        },
        to: {
          transform: 'translateX(0)',
          opacity: 1,
        },
      },
    },
  }
}

export function panelSlideInFromLeftSx(): SxProps<Theme> {
  const { enterMs, enterEasing, panelOffsetPx, panelFadeFrom } = drawerMotion
  return {
    [motionSafe]: {
      animation: `panelSlideInLeft ${enterMs}ms ${enterEasing} both`,
      '@keyframes panelSlideInLeft': {
        from: {
          transform: `translateX(-${panelOffsetPx}px)`,
          opacity: panelFadeFrom,
        },
        to: {
          transform: 'translateX(0)',
          opacity: 1,
        },
      },
    },
  }
}

type DockedPanelSide = 'left' | 'right'

/**
 * Docked side panel motion: transform + subtle opacity only (GPU-friendly).
 * Shell keeps a stable width while mounted; pair with `useAnimatedPanelPresence`.
 */
export function dockedPanelMotionSx(options: {
  side: DockedPanelSide
  entered: boolean
  width: number
  reducedMotion?: boolean
}): { shellSx: SxProps<Theme>; innerSx: SxProps<Theme> } {
  const { side, entered, width, reducedMotion = false } = options
  const { enterMs, exitMs, enterEasing, exitEasing, panelFadeFrom } = drawerMotion
  const durationMs = entered ? enterMs : exitMs
  const easing = entered ? enterEasing : exitEasing
  const hiddenX = side === 'right' ? '100%' : '-100%'
  const opacityMs = Math.round(durationMs * 0.9)

  const edgeBorder =
    side === 'right'
      ? { borderLeft: (theme: Theme) => `1px solid ${theme.palette.divider}` }
      : { borderRight: (theme: Theme) => `1px solid ${theme.palette.divider}` }

  const shellSx: SxProps<Theme> = {
    width,
    overflow: 'hidden',
    flexShrink: 0,
    alignSelf: 'stretch',
    height: '100%',
    minHeight: 0,
    bgcolor: 'background.paper',
    ...edgeBorder,
  }

  if (reducedMotion) {
    return {
      shellSx,
      innerSx: {
        width,
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transform: 'none',
        opacity: 1,
      },
    }
  }

  return {
    shellSx,
    innerSx: {
      width,
      height: '100%',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transform: entered ? 'translateX(0)' : `translateX(${hiddenX})`,
      opacity: entered ? 1 : panelFadeFrom,
      transition: `transform ${durationMs}ms ${easing}, opacity ${opacityMs}ms ${easing}`,
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden',
      WebkitFontSmoothing: 'antialiased',
    },
  }
}

/** Bottom sheet paper — rounded top, fixed viewport height, elevation shadow. */
export function bottomSheetPaperSx(): SxProps<Theme> {
  const { bottomSheetHeightVh, bottomSheetTopRadiusPx } = drawerMotion
  return {
    height: `${bottomSheetHeightVh}vh`,
    maxHeight: `${bottomSheetHeightVh}dvh`,
    borderTopLeftRadius: bottomSheetTopRadiusPx,
    borderTopRightRadius: bottomSheetTopRadiusPx,
    overflow: 'hidden',
    boxShadow: (theme) => theme.shadows[16],
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
  }
}

/**
 * Mobile bottom sheet motion via CSS keyframes (not transitions).
 * iOS Chrome/WebKit often skips transform transitions when the "from" frame
 * never paints; keyframes always interpolate from their `from` keyframe.
 */
export function bottomSheetMotionSx(options: {
  phase: 'enter' | 'exit'
  reducedMotion?: boolean
}): SxProps<Theme> {
  const { phase, reducedMotion = false } = options
  const { enterMs, exitMs, enterEasing, exitEasing, panelFadeFrom } = drawerMotion
  const paper = bottomSheetPaperSx()

  if (reducedMotion) {
    return {
      ...paper,
      width: '100%',
      maxWidth: '100%',
      outline: 'none',
      transform: 'translate3d(0, 0, 0)',
      opacity: 1,
    }
  }

  const isEnter = phase === 'enter'
  const durationMs = isEnter ? enterMs : exitMs
  const easing = isEnter ? enterEasing : exitEasing
  const animationName = isEnter ? 'majescoBottomSheetIn' : 'majescoBottomSheetOut'

  return {
    ...paper,
    width: '100%',
    maxWidth: '100%',
    outline: 'none',
    transform: isEnter ? 'translate3d(0, 0, 0)' : 'translate3d(0, 100%, 0)',
    opacity: isEnter ? 1 : panelFadeFrom,
    animation: `${animationName} ${durationMs}ms ${easing} both`,
    '@keyframes majescoBottomSheetIn': {
      from: {
        transform: 'translate3d(0, 100%, 0)',
        opacity: panelFadeFrom,
      },
      to: {
        transform: 'translate3d(0, 0, 0)',
        opacity: 1,
      },
    },
    '@keyframes majescoBottomSheetOut': {
      from: {
        transform: 'translate3d(0, 0, 0)',
        opacity: 1,
      },
      to: {
        transform: 'translate3d(0, 100%, 0)',
        opacity: panelFadeFrom,
      },
    },
  }
}

/** Backdrop fade paired with bottom sheet keyframe phases. */
export function bottomSheetBackdropMotionSx(options: {
  phase: 'enter' | 'exit'
  reducedMotion?: boolean
}): SxProps<Theme> {
  const { phase, reducedMotion = false } = options
  const durationMs =
    phase === 'enter' ? backdropTransitionDuration.enter : backdropTransitionDuration.exit
  const easing = phase === 'enter' ? drawerMotion.enterEasing : drawerMotion.exitEasing

  if (reducedMotion) {
    return { opacity: 1 }
  }

  const animationName =
    phase === 'enter' ? 'majescoBottomSheetBackdropIn' : 'majescoBottomSheetBackdropOut'

  return {
    opacity: phase === 'enter' ? 1 : 0,
    animation: `${animationName} ${durationMs}ms ${easing} both`,
    '@keyframes majescoBottomSheetBackdropIn': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    '@keyframes majescoBottomSheetBackdropOut': {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
  }
}
