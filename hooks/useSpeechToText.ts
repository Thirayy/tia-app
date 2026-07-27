// @/hooks/useSpeechToText.ts
import { useState, useEffect, useCallback } from 'react';

// Deklarasi tipe global untuk WebkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseSpeechToProps {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useSpeechToText({ onResult, onError }: UseSpeechToProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'id-ID'; // Bahasa Indonesia

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (onError) onError(event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript.trim() !== '') {
          onResult(transcript);
        }
      };

      setRecognitionInstance(recognition);
    } else {
      if (onError) onError('Browser tidak mendukung Speech Recognition.');
    }
  }, [onResult, onError, transcript]);

  const startListening = useCallback(() => {
    setTranscript('');
    if (recognitionInstance) {
      try {
        recognitionInstance.start();
      } catch (e) {
        console.error(e);
      }
    }
  }, [recognitionInstance]);

  const stopListening = useCallback(() => {
    if (recognitionInstance) {
      recognitionInstance.stop();
    }
    setIsListening(false);
  }, [recognitionInstance]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasSupport: typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  };
}