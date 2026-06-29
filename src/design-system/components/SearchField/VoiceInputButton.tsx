import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { keyframes } from '@mui/material/styles'

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 93, 191, 0.45); }
  70% { box-shadow: 0 0 0 8px rgba(0, 93, 191, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 93, 191, 0); }
`

type VoiceInputButtonProps = {
  isListening: boolean
  isSupported: boolean
  error: string | null
  onToggle: () => void
  disabled?: boolean
}

export function VoiceInputButton({
  isListening,
  isSupported,
  error,
  onToggle,
  disabled,
}: VoiceInputButtonProps) {
  if (!isSupported) return null

  const label = isListening
    ? 'Stop listening'
    : error
      ? `Voice input unavailable (${error})`
      : 'Voice search'

  return (
    <Tooltip title={label}>
      <span>
        <IconButton
          size="small"
          onClick={onToggle}
          disabled={disabled}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          aria-pressed={isListening}
          sx={{
            color: isListening ? 'primary.main' : 'action.active',
            animation: isListening ? `${pulse} 1.4s ease-in-out infinite` : 'none',
          }}
        >
          {isListening ? (
            <StopCircleOutlinedIcon fontSize="small" />
          ) : (
            <MicNoneOutlinedIcon fontSize="small" />
          )}
        </IconButton>
      </span>
    </Tooltip>
  )
}
