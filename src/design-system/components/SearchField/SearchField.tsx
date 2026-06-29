import SearchIcon from '@mui/icons-material/Search'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { TextFieldProps } from '@mui/material/TextField'
import { useCallback } from 'react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { VoiceInputButton } from './VoiceInputButton'

export type SearchFieldProps = Omit<TextFieldProps, 'variant'> & {
  onSearchChange?: (value: string) => void
  /** Enable Web Speech API microphone input. */
  enableVoice?: boolean
  /** Extra icons rendered before the voice button (e.g. add/create). */
  endActions?: React.ReactNode
}

/** Themed search input with optional voice transcription. */
export function SearchField({
  placeholder = 'Search…',
  onSearchChange,
  onChange,
  enableVoice = false,
  endActions,
  value,
  slotProps,
  sx,
  fullWidth,
  ...props
}: SearchFieldProps) {
  const handleTranscript = useCallback(
    (transcript: string, isFinal: boolean) => {
      if (isFinal && transcript) {
        onSearchChange?.(transcript)
      }
    },
    [onSearchChange],
  )

  const { isListening, isSupported, error, toggleListening } = useSpeechRecognition({
    onTranscript: enableVoice ? handleTranscript : undefined,
  })

  const inputSlotProps = slotProps?.input
  const inputSx = typeof inputSlotProps === 'object' && inputSlotProps && 'sx' in inputSlotProps
    ? inputSlotProps.sx
    : undefined

  return (
    <Box
      sx={{
        width: fullWidth ? '100%' : undefined,
        flex: fullWidth ? 1 : undefined,
        minWidth: fullWidth ? 0 : undefined,
      }}
    >
      <TextField
        size="small"
        placeholder={isListening && enableVoice ? 'Listening…' : placeholder}
        value={value}
        fullWidth={fullWidth}
        onChange={(event) => {
          onChange?.(event)
          onSearchChange?.(event.target.value)
        }}
        slotProps={{
          ...slotProps,
          input: {
            ...(typeof inputSlotProps === 'object' ? inputSlotProps : {}),
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: (enableVoice || endActions) ? (
              <InputAdornment position="end">
                <Stack direction="row" spacing={0.25} alignItems="center">
                  {endActions}
                  {enableVoice && (
                    <VoiceInputButton
                      isListening={isListening}
                      isSupported={isSupported}
                      error={error}
                      onToggle={toggleListening}
                    />
                  )}
                </Stack>
              </InputAdornment>
            ) : undefined,
            sx: {
              bgcolor: 'background.paper',
              minHeight: 40,
              py: 0.25,
              pl: 1.25,
              pr: 0.75,
              ...(inputSx as object),
            },
          },
        }}
        sx={{ minWidth: 220, ...sx }}
        {...props}
      />
      {isListening && enableVoice && (
        <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block', pl: 0.5 }}>
          Listening…
        </Typography>
      )}
    </Box>
  )
}
