/**
 * DialogOverlay: High-contrast Catalan text with word-by-word highlights and Voice Gate UI
 * Designed for 5-year-old child comprehension and unblockable speech interactions.
 */

import { PixelPrimitives } from '../art/PixelPrimitives';
import { Sprites } from '../art/Sprites';
import { soundFX } from '../../engine/SoundFX';
import { speechManager } from '../../engine/SpeechManager';

export interface DialogConfig {
  speaker?: string;
  avatar?: 'stationmaster' | 'driver' | 'train' | 'bird' | 'narrator';
  title?: string;
  text: string;
  voiceText?: string;
  syllables?: string[];
  isVoiceGate?: boolean;
  targetPhrase?: string;
  targetTokens?: string[];
  onSuccess?: () => void;
  onDismiss?: () => void;
}

export class DialogOverlay {
  private activeDialog: DialogConfig | null = null;
  private spokenCharIndex: number = -1;
  private isListeningMic: boolean = false;
  private interimTranscript: string = '';
  private successTriggered: boolean = false;

  // Visual layout constants (within 640x360)
  private readonly boxX = 60;
  private readonly boxY = 70;
  private readonly boxW = 520;
  private readonly boxH = 200;

  // Buttons bounds
  private closeBtnRect = { x: 540, y: 76, w: 32, h: 26 };
  private replayBtnRect = { x: 80, y: 228, w: 140, h: 32 };
  private micBtnRect = { x: 235, y: 228, w: 155, h: 32 };
  private fallbackBtnRect = { x: 400, y: 228, w: 165, h: 32 };
  private nextBtnRect = { x: 450, y: 228, w: 110, h: 32 };

  public show(config: DialogConfig): void {
    this.activeDialog = config;
    this.spokenCharIndex = -1;
    this.interimTranscript = '';
    this.successTriggered = false;

    const speechText = config.voiceText || config.text;

    // Start speaking Catalan text
    speechManager.speak(
      speechText,
      (_word, charIndex) => {
        this.spokenCharIndex = charIndex;
      },
      () => {
        this.spokenCharIndex = -1;
        // If this is a voice gate, start mic listening after prompt speech ends
        if (config.isVoiceGate && !this.successTriggered) {
          this.activateVoiceGateListener();
        }
      }
    );
  }

  public hide(): void {
    if (this.isListeningMic) {
      speechManager.stopListening();
      this.isListeningMic = false;
    }
    speechManager.stopSpeaking();
    const onDismiss = this.activeDialog?.onDismiss;
    this.activeDialog = null;
    if (onDismiss) onDismiss();
  }

  public isOpen(): boolean {
    return this.activeDialog !== null;
  }

  private activateVoiceGateListener(): void {
    if (!this.activeDialog || !this.activeDialog.targetTokens) return;

    this.isListeningMic = true;
    speechManager.startListening(
      this.activeDialog.targetTokens,
      (_recognized) => {
        this.handleVoiceSuccess();
      },
      (err) => {
        console.warn('Voice recognition fallback ready:', err);
      },
      (interim) => {
        this.interimTranscript = interim;
      }
    );
  }

  private handleVoiceSuccess(): void {
    if (this.successTriggered) return;
    this.successTriggered = true;
    this.isListeningMic = false;
    soundFX.playSuccess();

    if (this.activeDialog?.onSuccess) {
      this.activeDialog.onSuccess();
    }
  }

  public render(ctx: CanvasRenderingContext2D, time: number): void {
    if (!this.activeDialog) return;

    // Semi-transparent backdrop overlay - keep vibrant scene visible beneath
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.fillRect(0, 0, 640, 360);

    const { boxX, boxY, boxW, boxH } = this;

    // Outer Dialog Box with warm wooden / gold trim
    PixelPrimitives.drawBeveledRect(
      ctx,
      boxX,
      boxY,
      boxW,
      boxH,
      '#1e293b',
      '#d97706',
      '#090d16',
      3
    );

    // Decorative inner border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX + 6, boxY + 6, boxW - 12, boxH - 12);

    // Speaker Title Bar
    const title = this.activeDialog.speaker || this.activeDialog.title || 'El Conductor de Paraules';
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(title, boxX + 68, boxY + 28);

    // Speaker Avatar Portrait
    this.renderAvatar(ctx, boxX + 16, boxY + 14, time);

    // Close button (X)
    PixelPrimitives.drawBeveledRect(
      ctx,
      this.closeBtnRect.x,
      this.closeBtnRect.y,
      this.closeBtnRect.w,
      this.closeBtnRect.h,
      '#dc2626',
      '#f87171',
      '#7f1d1d',
      2
    );
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✕', this.closeBtnRect.x + this.closeBtnRect.w / 2, this.closeBtnRect.y + 17);

    // Large high-contrast text rendering with word-by-word highlights
    this.renderDialogText(ctx);

    // Syllables / Phonetic banner for Voice Gate
    if (this.activeDialog.isVoiceGate && this.activeDialog.syllables) {
      this.renderVoiceGatePrompt(ctx, time);
    }

    // Action buttons at bottom of dialog
    this.renderButtons(ctx, time);
  }

  private renderAvatar(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
    // Portrait frame
    PixelPrimitives.drawBeveledRect(ctx, x, y, 44, 44, '#0f172a', '#475569', '#020617', 2);

    const avatarType = this.activeDialog?.avatar || 'stationmaster';
    if (avatarType === 'stationmaster') {
      Sprites.drawStationmaster(ctx, x + 10, y + 42, time, speechManager.isSynthesisSupported());
    } else if (avatarType === 'train') {
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚂', x + 22, y + 30);
    } else if (avatarType === 'bird') {
      Sprites.drawBird(ctx, x + 20, y + 26, time);
    } else {
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🧑‍✈️', x + 22, y + 30);
    }
  }

  private renderDialogText(ctx: CanvasRenderingContext2D): void {
    if (!this.activeDialog) return;

    const text = this.activeDialog.text;
    const words = text.split(' ');
    const startX = this.boxX + 22;
    let curX = startX;
    let curY = this.boxY + 68;
    const maxWidth = this.boxW - 44;
    const lineHeight = 20;

    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';

    let runningCharCount = 0;

    for (const word of words) {
      const wordWidth = ctx.measureText(word + ' ').width;

      if (curX + wordWidth > startX + maxWidth) {
        curX = startX;
        curY += lineHeight;
      }

      // Check if this word is currently being spoken
      const isWordActive =
        this.spokenCharIndex >= 0 &&
        runningCharCount <= this.spokenCharIndex &&
        this.spokenCharIndex < runningCharCount + word.length + 1;

      if (isWordActive) {
        // Highlight word in warm gold
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(curX - 2, curY - 14, wordWidth, 18);
        ctx.fillStyle = '#0f172a';
      } else {
        ctx.fillStyle = '#f8fafc';
      }

      ctx.fillText(word, curX, curY);
      curX += wordWidth;
      runningCharCount += word.length + 1;
    }
  }

  private renderVoiceGatePrompt(ctx: CanvasRenderingContext2D, time: number): void {
    if (!this.activeDialog || !this.activeDialog.syllables) return;

    const bannerY = this.boxY + 120;
    const bannerH = 40;

    // Glowing prompt box
    const glow = Math.sin(time * 5) * 0.15 + 0.85;
    ctx.fillStyle = `rgba(16, 185, 129, ${glow * 0.25})`;
    ctx.fillRect(this.boxX + 20, bannerY, this.boxW - 40, bannerH);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.boxX + 20, bannerY, this.boxW - 40, bannerH);

    // Syllable blocks
    const syllables = this.activeDialog.syllables;
    const totalSyllables = syllables.length;
    const blockW = Math.min(80, Math.floor((this.boxW - 100) / totalSyllables));
    const startX = this.boxX + (this.boxW - totalSyllables * (blockW + 8)) / 2;

    syllables.forEach((syl, i) => {
      const sx = startX + i * (blockW + 8);
      const sy = bannerY + 6;

      // Color-coded syllable pill
      PixelPrimitives.drawBeveledRect(ctx, sx, sy, blockW, 28, '#065f46', '#34d399', '#022c22', 1);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(syl.toUpperCase(), sx + blockW / 2, sy + 19);
    });

    // Transcript / microphone status
    if (this.interimTranscript) {
      ctx.fillStyle = '#67e8f9';
      ctx.font = 'italic 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Sentit: "${this.interimTranscript}"`, this.boxX + this.boxW / 2, bannerY + 54);
    }
  }

  private renderButtons(ctx: CanvasRenderingContext2D, time: number): void {
    if (!this.activeDialog) return;

    // 1. Replay Audio Button (Torna a escoltar)
    PixelPrimitives.drawBeveledRect(
      ctx,
      this.replayBtnRect.x,
      this.replayBtnRect.y,
      this.replayBtnRect.w,
      this.replayBtnRect.h,
      '#2563eb',
      '#60a5fa',
      '#1e3a8a',
      2
    );
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔊 Escolta altra vegada', this.replayBtnRect.x + this.replayBtnRect.w / 2, this.replayBtnRect.y + 20);

    if (this.activeDialog.isVoiceGate) {
      // 2. Microphone Pulsing Button
      const micPulse = Math.sin(time * 6) * 1.5;
      const isListening = this.isListeningMic;

      PixelPrimitives.drawBeveledRect(
        ctx,
        this.micBtnRect.x,
        this.micBtnRect.y - micPulse,
        this.micBtnRect.w,
        this.micBtnRect.h,
        isListening ? '#059669' : '#047857',
        '#34d399',
        '#064e3b',
        2
      );
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        isListening ? '🎤 T\'estic escoltant...' : '🎤 Parla pel micròfon',
        this.micBtnRect.x + this.micBtnRect.w / 2,
        this.micBtnRect.y + 20 - micPulse
      );

      // 3. Child-Friendly Fallback / Instant Tap-To-Speak Button
      PixelPrimitives.drawBeveledRect(
        ctx,
        this.fallbackBtnRect.x,
        this.fallbackBtnRect.y,
        this.fallbackBtnRect.w,
        this.fallbackBtnRect.h,
        '#d97706',
        '#fbbf24',
        '#78350f',
        2
      );
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        '🗣️ Toca per dir-ho!',
        this.fallbackBtnRect.x + this.fallbackBtnRect.w / 2,
        this.fallbackBtnRect.y + 20
      );
    } else {
      // Standard "Entesos / Continuar" button
      PixelPrimitives.drawBeveledRect(
        ctx,
        this.nextBtnRect.x,
        this.nextBtnRect.y,
        this.nextBtnRect.w,
        this.nextBtnRect.h,
        '#16a34a',
        '#4ade80',
        '#14532d',
        2
      );
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Entesos! 👍', this.nextBtnRect.x + this.nextBtnRect.w / 2, this.nextBtnRect.y + 20);
    }
  }

  public handlePointerDown(vx: number, vy: number): boolean {
    if (!this.activeDialog) return false;

    // 1. Close Button
    if (
      vx >= this.closeBtnRect.x &&
      vx <= this.closeBtnRect.x + this.closeBtnRect.w &&
      vy >= this.closeBtnRect.y &&
      vy <= this.closeBtnRect.y + this.closeBtnRect.h
    ) {
      soundFX.playClick();
      this.hide();
      return true;
    }

    // 2. Replay Audio Button
    if (
      vx >= this.replayBtnRect.x &&
      vx <= this.replayBtnRect.x + this.replayBtnRect.w &&
      vy >= this.replayBtnRect.y &&
      vy <= this.replayBtnRect.y + this.replayBtnRect.h
    ) {
      soundFX.playClick();
      const text = this.activeDialog.voiceText || this.activeDialog.text;
      speechManager.speak(text, (_w, c) => (this.spokenCharIndex = c));
      return true;
    }

    // If Voice Gate is active
    if (this.activeDialog.isVoiceGate) {
      // 3. Mic listener button
      if (
        vx >= this.micBtnRect.x &&
        vx <= this.micBtnRect.x + this.micBtnRect.w &&
        vy >= this.micBtnRect.y &&
        vy <= this.micBtnRect.y + this.micBtnRect.h
      ) {
        soundFX.playClick();
        this.activateVoiceGateListener();
        return true;
      }

      // 4. Fallback: Tap to speak and advance
      if (
        vx >= this.fallbackBtnRect.x &&
        vx <= this.fallbackBtnRect.x + this.fallbackBtnRect.w &&
        vy >= this.fallbackBtnRect.y &&
        vy <= this.fallbackBtnRect.y + this.fallbackBtnRect.h
      ) {
        soundFX.playClick();
        const phrase = this.activeDialog.targetPhrase || 'Obre la via';
        speechManager.triggerSpokenFallback(phrase, () => {
          this.handleVoiceSuccess();
        });
        return true;
      }
    } else {
      // Standard "Entesos!" Next button
      if (
        vx >= this.nextBtnRect.x &&
        vx <= this.nextBtnRect.x + this.nextBtnRect.w &&
        vy >= this.nextBtnRect.y &&
        vy <= this.nextBtnRect.y + this.nextBtnRect.h
      ) {
        soundFX.playClick();
        this.hide();
        return true;
      }
    }

    // Click anywhere inside dialog box absorbs the event
    if (vx >= this.boxX && vx <= this.boxX + this.boxW && vy >= this.boxY && vy <= this.boxY + this.boxH) {
      return true;
    }

    // For standard dialogues, tapping anywhere on the backdrop also dismisses it smoothly
    if (!this.activeDialog.isVoiceGate) {
      soundFX.playClick();
      this.hide();
      return true;
    }

    return true; // absorb click while modal voice gate is open
  }
}

export const dialogOverlay = new DialogOverlay();
