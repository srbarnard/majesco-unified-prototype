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

/** Chat / drawer body content swap — short fade + slight vertical move. */
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
 * Docked side panel motion. The shell width and the panel use the MUI drawer
 * duration and easing so the main content and the panel finish together.
 * The panel is pinned to the content edge and clipped by the shell, so a
 * separate translate cannot trail the content and open a gap.
 * Pair with `useAnimatedPanelPresence`.
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

  const edgeBorder =
    side === 'right'
      ? { borderLeft: (theme: Theme) => `1px solid ${theme.palette.divider}` }
      : { borderRight: (theme: Theme) => `1px solid ${theme.palette.divider}` }

  const shellSx: SxProps<Theme> = {
    width: entered ? width : 0,
    minWidth: 0,
    overflow: 'hidden',
    flexShrink: 0,
    alignSelf: 'stretch',
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    // Pin the panel to the content edge. The outer edge clips as the shell
    // width eases, so the drawer cannot sit past the content and leave a gap.
    alignItems: side === 'right' ? 'flex-start' : 'flex-end',
    bgcolor: 'background.paper',
    ...edgeBorder,
    ...(reducedMotion ? {} : { transition: `width ${durationMs}ms ${easing}` }),
  }

  const innerSx: SxProps<Theme> = {
    width,
    flexShrink: 0,
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transform: 'none',
    opacity: reducedMotion || entered ? 1 : panelFadeFrom,
    ...(reducedMotion
      ? {}
      : {
          transition: `opacity ${durationMs}ms ${easing}`,
          willChange: 'opacity',
          backfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'antialiased',
        }),
  }

  return { shellSx, innerSx }
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
 * Bottom sheet show/hide — same entered-driven CSS transform pattern as docked panels.
 * Resting transform follows `entered`, so the sheet stays visible even if the
 * transition is skipped (iOS) or WAAPI never attaches (Modal ref timing).
 */
export function bottomSheetMotionSx(options: {
  entered: boolean
  reducedMotion?: boolean
}): SxProps<Theme> {
  const { entered, reducedMotion = false } = options
  const { enterMs, exitMs, enterEasing, exitEasing, panelFadeFrom } = drawerMotion
  const durationMs = entered ? enterMs : exitMs
  const easing = entered ? enterEasing : exitEasing
  const opacityMs = Math.round(durationMs * 0.9)
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

  return {
    ...paper,
    width: '100%',
    maxWidth: '100%',
    outline: 'none',
    transform: entered ? 'translate3d(0, 0, 0)' : 'translate3d(0, 100%, 0)',
    opacity: entered ? 1 : panelFadeFrom,
    transition: `transform ${durationMs}ms ${easing}, opacity ${opacityMs}ms ${easing}`,
    willChange: 'transform, opacity',
    WebkitFontSmoothing: 'antialiased',
  }
}

/** One-shot entrance motion for in-panel confirmations — ease-out, no bounce, never loops. */
export const entranceMotion = {
  enterMs: 220,
  staggerMs: 40,
  offsetPx: 6,
  easing: 'cubic-bezier(0, 0, 0.2, 1)',
  flashMs: 1200,
} as const

/** Fade + short slide down (e.g. a banner appearing under a subtitle). */
export function fadeSlideDownSx(delayMs = 0): CSSObject {
  const { enterMs, easing, offsetPx } = entranceMotion
  return {
    [motionSafe]: {
      animation: `entranceFadeSlideDown ${enterMs}ms ${easing} ${delayMs}ms both`,
      '@keyframes entranceFadeSlideDown': {
        from: { opacity: 0, transform: `translateY(-${offsetPx}px)` },
        to: { opacity: 1, transform: 'none' },
      },
    },
  }
}

export function fadeInSx(delayMs = 0): CSSObject {
  const { enterMs, easing } = entranceMotion
  return {
    [motionSafe]: {
      animation: `entranceFadeIn ${enterMs}ms ${easing} ${delayMs}ms both`,
      '@keyframes entranceFadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
    },
  }
}

/** Tint overlay that fades out; an inset shadow so opaque backgrounds (e.g. pinned grid cells) are untouched. */
export function highlightFlashSx(color: string): CSSObject {
  const { flashMs, easing } = entranceMotion
  return {
    [motionSafe]: {
      animation: `entranceHighlightFlash ${flashMs}ms ${easing}`,
      '@keyframes entranceHighlightFlash': {
        from: { boxShadow: `inset 0 0 0 100vmax ${color}` },
        to: { boxShadow: 'inset 0 0 0 100vmax transparent' },
      },
    },
  }
}

/** Backdrop fade paired with bottom sheet presence. */
export function bottomSheetBackdropMotionSx(options: {
  entered: boolean
  reducedMotion?: boolean
}): SxProps<Theme> {
  const { entered, reducedMotion = false } = options
  const durationMs = entered
    ? backdropTransitionDuration.enter
    : backdropTransitionDuration.exit
  const easing = entered ? drawerMotion.enterEasing : drawerMotion.exitEasing

  if (reducedMotion) {
    return { opacity: 1 }
  }

  return {
    opacity: entered ? 1 : 0,
    transition: `opacity ${durationMs}ms ${easing}`,
  }
}
