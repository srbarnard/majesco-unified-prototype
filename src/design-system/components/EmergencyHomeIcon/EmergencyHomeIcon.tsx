import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'

/** Material Symbol emergency_home — diamond with exclamation mark. */
const OUTLINE_PATH =
  'M449.5-85Q435-91 423-102L102-423q-11-12-17-26.5T79-480q0-16 6-31t17-26l321-321q12-12 26.5-17.5T480-881q16 0 31 5.5t26 17.5l321 321q12 11 17.5 26t5.5 31q0 16-5.5 30.5T858-423L537-102q-11 11-26 17t-31 6q-16 0-30.5-6Zm30.5-74 321-321-321-321-321 321 321 321Zm-40-281h80v-240h-80v240Zm68.5 108.5Q520-343 520-360t-11.5-28.5Q497-400 480-400t-28.5 11.5Q440-377 440-360t11.5 28.5Q463-320 480-320t28.5-11.5Z'

const DIAMOND_FILL_PATH =
  'M449.5-85Q435-91 423-102L102-423q-11-12-17-26.5T79-480q0-16 6-31t17-26l321-321q12-12 26.5-17.5T480-881q16 0 31 5.5t26 17.5l321 321q12 11 17.5 26t5.5 31q0 16-5.5 30.5T858-423L537-102q-11 11-26 17t-31 6q-16 0-30.5-6Z'

const EXCLAMATION_BAR_PATH = 'M440-665h80v-240h-80v240Z'
const EXCLAMATION_DOT_PATH =
  'M480-343q-17 0-28.5-11.5T440-383q0-17 11.5-28.5T480-423q17 0 28.5 11.5T520-383q0 17-11.5 28.5T480-343Z'

export type EmergencyHomeIconProps = SvgIconProps & {
  active?: boolean
}

export function EmergencyHomeIcon({ active = false, sx, ...props }: EmergencyHomeIconProps) {
  if (active) {
    return (
      <SvgIcon viewBox="0 -960 960 960" sx={[{ color: 'warning.main' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]} {...props}>
        <path d={DIAMOND_FILL_PATH} fill="currentColor" />
        <path d={EXCLAMATION_BAR_PATH} fill="#fff" />
        <path d={EXCLAMATION_DOT_PATH} fill="#fff" />
      </SvgIcon>
    )
  }

  return (
    <SvgIcon viewBox="0 -960 960 960" sx={sx} {...props}>
      <path d={OUTLINE_PATH} />
    </SvgIcon>
  )
}
