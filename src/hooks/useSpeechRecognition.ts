import { useCallback, useEffect, useRef, useState } from 'react'

type UseSpeechRecognitionOptions = {
  lang?: string
  continuous?: boolean
  onTranscript?: (transcript: string, isFinal: boolean) => void
}

export function useSpeechRecognition({
  lang = 'en-US',
  continuous = false,
  onTranscript,
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const onTranscriptRef = useRef(onTranscript)

  onTranscriptRef.current = onTranscript

  useEffect(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
      setIsSupported(false)
      return
    }

    setIsSupported(true)
    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.lang = lang

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      if (event.error !== 'aborted') {
        setError(event.error)
      }
    }

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript
      }
      const isFinal = event.results[event.results.length - 1]?.isFinal ?? false
      onTranscriptRef.current?.(transcript.trim(), isFinal)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
      recognitionRef.current = null
    }
  }, [continuous, lang])

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    try {
      setError(null)
      recognition.start()
    } catch {
      recognition.stop()
      recognition.start()
    }
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    toggleListening,
  }
}
