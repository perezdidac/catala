/**
 * Catalan Speech Synthesis (TTS) & Recognition (STT) Manager
 * Tailored for 5-year-old language immersion in Catalan (ca-ES).
 */

import { matchesCatalanToken } from '../data/catalanVocabulary';

// Declare Web Speech API interfaces for TS
interface IWindowSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
}

export class SpeechManager {
  private synth: SpeechSynthesis | null = null;
  private catalanVoice: SpeechSynthesisVoice | null = null;
  private recognition: IWindowSpeechRecognition | null = null;
  private isListeningActive: boolean = false;
  private onMatchCallback: ((text: string) => void) | null = null;
  private onInterimCallback: ((text: string) => void) | null = null;
  private currentTargetTokens: string[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }

      // Check SpeechRecognition
      const SpeechRecognitionClass =
        (window as unknown as { SpeechRecognition?: new () => IWindowSpeechRecognition }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => IWindowSpeechRecognition }).webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        try {
          this.recognition = new SpeechRecognitionClass();
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.recognition.lang = 'ca-ES';
          this.recognition.maxAlternatives = 5;
          this.setupRecognitionListeners();
        } catch (e) {
          console.warn('SpeechRecognition initialization error:', e);
        }
      }
    }
  }

  private loadVoices(): void {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    // Prefer explicit Catalan voice
    const caVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('ca') ||
        v.name.toLowerCase().includes('catalan') ||
        v.name.toLowerCase().includes('català')
    );

    if (caVoice) {
      this.catalanVoice = caVoice;
    } else {
      // Fallback: Spanish voice (es-ES) which handles Catalan phonotactics cleanly
      const esVoice = voices.find((v) => v.lang.toLowerCase().startsWith('es'));
      this.catalanVoice = esVoice || voices[0];
    }
  }

  private setupRecognitionListeners(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListeningActive = true;
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          this.checkSpokenResult(transcript);
          return;
        } else {
          interim += transcript;
        }
      }

      if (interim && this.onInterimCallback) {
        this.onInterimCallback(interim);
      }

      // Also check interim results for early match!
      if (interim && this.currentTargetTokens.length > 0) {
        if (matchesCatalanToken(interim, this.currentTargetTokens)) {
          this.checkSpokenResult(interim);
        }
      }
    };

    this.recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      this.isListeningActive = false;
    };

    this.recognition.onend = () => {
      this.isListeningActive = false;
    };
  }

  private checkSpokenResult(text: string): void {
    if (!this.onMatchCallback) return;

    const matched = matchesCatalanToken(text, this.currentTargetTokens);
    if (matched) {
      const cb = this.onMatchCallback;
      this.stopListening();
      cb(text);
    }
  }

  /**
   * Speak Catalan text out loud with child-friendly speed and pitch
   */
  public speak(
    text: string,
    onWord?: (word: string, charIndex: number) => void,
    onEnd?: () => void
  ): void {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.synth.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.catalanVoice) {
      utterance.voice = this.catalanVoice;
    }
    utterance.lang = 'ca-ES';
    utterance.rate = 0.88; // Gentle, clear speed for 5-year-old child comprehension
    utterance.pitch = 1.06; // Warm, friendly tone

    if (onWord) {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const spokenWord = text.substring(event.charIndex).split(/\s+/)[0] || '';
          onWord(spokenWord, event.charIndex);
        }
      };
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Activate microphone listener with target phrases
   */
  public startListening(
    targetTokens: string[],
    onMatch: (recognizedText: string) => void,
    onError?: (err: string) => void,
    onInterim?: (interim: string) => void
  ): boolean {
    if (!this.recognition) {
      if (onError) onError('Reconeixement de veu no disponible al navegador');
      return false;
    }

    this.currentTargetTokens = targetTokens;
    this.onMatchCallback = onMatch;
    this.onInterimCallback = onInterim || null;

    try {
      this.recognition.start();
      return true;
    } catch (e) {
      console.warn('Recognition start exception:', e);
      if (onError) onError('No es pot activar el micròfon');
      return false;
    }
  }

  public stopListening(): void {
    this.isListeningActive = false;
    this.currentTargetTokens = [];
    this.onMatchCallback = null;
    this.onInterimCallback = null;
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // ignore
      }
    }
  }

  /**
   * Child-friendly fallback: Tap to pronounce and simulate speaking
   */
  public triggerSpokenFallback(
    spokenPhrase: string,
    onComplete: () => void
  ): void {
    this.stopListening();
    this.speak(spokenPhrase, undefined, () => {
      onComplete();
    });
  }

  public isListening(): boolean {
    return this.isListeningActive;
  }

  public isRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  public isSynthesisSupported(): boolean {
    return this.synth !== null;
  }
}

export const speechManager = new SpeechManager();
