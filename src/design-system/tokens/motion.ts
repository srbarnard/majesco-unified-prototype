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

/** Drawer / panel slide — smooth ease-in-out on open and close. */
export const drawerMotion = {
  enterMs: 320,
  exitMs: 260,
  /** Standard Material ease-in-out — smooth accel + decel, no overshoot */
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  panelOffsetPx: 16,
  panelFadeFrom: 0.9,
} as const

const motionSafe = '@media (prefers-reduced-motion: no-preference)'

export const drawerTransitionDuration = {
  enter: drawerMotion.enterMs,
  exit: drawerMotion.exitMs,
} as const

export const drawerTransitionEasing = {
  enter: drawerMotion.easing,
  exit: drawerMotion.easing,
} as const

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
  const { enterMs, easing, panelOffsetPx, panelFadeFrom } = drawerMotion
  return {
    [motionSafe]: {
      animation: `panelSlideInRight ${enterMs}ms ${easing} both`,
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
  const { enterMs, easing, panelOffsetPx, panelFadeFrom } = drawerMotion
  return {
    [motionSafe]: {
      animation: `panelSlideInLeft ${enterMs}ms ${easing} both`,
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
