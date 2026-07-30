type VoiceEngineEvents = {
  onResult: (text: string) => void;
  onEnd: () => void;
  onError: (error: string) => void;
  onSpeakStart: () => void;
  onSpeakEnd: () => void;
  onListeningStart: () => void;
  onListeningEnd: () => void;
};

export class VoiceEngine {
  private recognition: any | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private events: Partial<VoiceEngineEvents> = {};
  private _isListening = false;
  private _isSpeaking = false;
  private _isSupported = false;
  private _isVoiceSupported = false;
  private finalTranscript = '';
  private restartTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
      this._isSupported = true;

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        this.finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            this.finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (this.finalTranscript) {
          this.events.onResult?.(this.finalTranscript.trim());
        }
      };

      this.recognition.onend = () => {
        this._isListening = false;
        this.events.onListeningEnd?.();
        this.events.onEnd?.();
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          this.events.onEnd?.();
          return;
        }
        if (event.error === 'aborted') return;
        this.events.onError?.(event.error || 'Speech recognition error');
      };
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synthesis = window.speechSynthesis;
      this._isVoiceSupported = true;
    }
  }

  get isSupported() {
    return this._isSupported;
  }

  get isVoiceSupported() {
    return this._isVoiceSupported;
  }

  get isListening() {
    return this._isListening;
  }

  get isSpeaking() {
    return this._isSpeaking;
  }

  on(events: Partial<VoiceEngineEvents>) {
    this.events = { ...this.events, ...events };
  }

  startListening() {
    if (!this.recognition || this._isListening) return;

    this.finalTranscript = '';
    this._isListening = true;
    this.events.onListeningStart?.();

    try {
      this.recognition.start();
    } catch (e) {
      this._isListening = false;
      this.events.onError?.('Failed to start speech recognition');
    }
  }

  stopListening() {
    if (!this.recognition || !this._isListening) return;

    try {
      this.recognition.stop();
    } catch (e) {
      // ignore
    }
    this._isListening = false;
    this.events.onListeningEnd?.();
  }

  speak(text: string) {
    return new Promise<void>((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      const voices = this.synthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
      ) || voices.find((v) => v.lang.startsWith('en'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        this._isSpeaking = true;
        this.events.onSpeakStart?.();
      };

      utterance.onend = () => {
        this._isSpeaking = false;
        this.events.onSpeakEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        this._isSpeaking = false;
        this.events.onSpeakEnd?.();
        if (event.error === 'canceled' || event.error === 'interrupted') {
          resolve();
        } else {
          reject(new Error(`Speech synthesis error: ${event.error}`));
        }
      };

      this.synthesis.speak(utterance);
    });
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this._isSpeaking = false;
      this.events.onSpeakEnd?.();
    }
  }

  destroy() {
    this.stopListening();
    this.stopSpeaking();
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }
    this.recognition = null;
    this.synthesis = null;
  }
}

let instance: VoiceEngine | null = null;

export function getVoiceEngine(): VoiceEngine {
  if (!instance) {
    instance = new VoiceEngine();
  }
  return instance;
}
