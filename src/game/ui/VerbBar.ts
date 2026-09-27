/**
 * VerbBar: Big, high-contrast, child-friendly action verb buttons
 * MIRA (Cyan), AGAFA (Amber), PARLA (Emerald Green), CONDUEIX (Crimson)
 */

import { ActionVerb, gameState } from '../GameState';
import { PixelPrimitives } from '../art/PixelPrimitives';
import { soundFX } from '../../engine/SoundFX';
import { speechManager } from '../../engine/SpeechManager';

export interface VerbButton {
  verb: ActionVerb;
  label: string;
  subLabel: string;
  icon: string;
  color: string;
  activeColor: string;
  textColor: string;
  x: number;
  y: number;
  w: number;
  h: number;
  catalanAudio: string;
}

export class VerbBar {
  private buttons: VerbButton[] = [
    {
      verb: 'MIRA',
      label: 'MIRA',
      subLabel: 'Ull',
      icon: '👁️',
      color: '#00b4d8',
      activeColor: '#00e5ff',
      textColor: '#0f172a',
      x: 8,
      y: 306,
      w: 78,
      h: 48,
      catalanAudio: 'Mira!'
    },
    {
      verb: 'AGAFA',
      label: 'AGAFA',
      subLabel: 'Mà',
      icon: '✋',
      color: '#f59e0b',
      activeColor: '#ffb300',
      textColor: '#0f172a',
      x: 90,
      y: 306,
      w: 78,
      h: 48,
      catalanAudio: 'Agafa!'
    },
    {
      verb: 'PARLA',
      label: 'PARLA',
      subLabel: 'Veu',
      icon: '🎤',
      color: '#10b981',
      activeColor: '#00e676',
      textColor: '#0f172a',
      x: 172,
      y: 306,
      w: 78,
      h: 48,
      catalanAudio: 'Parla!'
    },
    {
      verb: 'CONDUEIX',
      label: 'CONDUEIX',
      subLabel: 'Tren',
      icon: '🚂',
      color: '#e11d48',
      activeColor: '#ff1744',
      textColor: '#ffffff',
      x: 254,
      y: 306,
      w: 96,
      h: 48,
      catalanAudio: 'Condueix el tren!'
    }
  ];

  private hoveredVerb: ActionVerb | null = null;

  public render(ctx: CanvasRenderingContext2D, time: number): void {
    const currentVerb = gameState.get().activeVerb;

    for (const btn of this.buttons) {
      const isActive = currentVerb === btn.verb;
      const isHovered = this.hoveredVerb === btn.verb;

      // Button background
      const bgColor = isActive ? btn.activeColor : isHovered ? '#ffffff' : btn.color;
      const highlight = isActive ? '#ffffff' : '#f8fafc';
      const shadow = isActive ? '#0f172a' : '#1e293b';

      // Animated bounce when active
      const bounce = isActive ? Math.floor(Math.sin(time * 6) * 1.5) : 0;
      const by = btn.y - (isActive ? 2 : 0) + bounce;

      // 3D Beveled Button
      PixelPrimitives.drawBeveledRect(
        ctx,
        btn.x,
        by,
        btn.w,
        btn.h,
        bgColor,
        highlight,
        shadow,
        isActive ? 3 : 2
      );

      // Active glowing border
      if (isActive) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(btn.x - 1, by - 1, btn.w + 2, btn.h + 2);
      }

      // Icon (Emoji / Pictogram)
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.icon, btn.x + btn.w / 2, by + 16);

      // Catalan Verb Label
      ctx.fillStyle = isActive ? '#000000' : btn.textColor;
      ctx.font = 'bold 10px monospace';
      ctx.fillText(btn.label, btn.x + btn.w / 2, by + 34);
    }
  }

  public handlePointerMove(vx: number, vy: number): boolean {
    const prev = this.hoveredVerb;
    this.hoveredVerb = null;

    for (const btn of this.buttons) {
      if (vx >= btn.x && vx <= btn.x + btn.w && vy >= btn.y && vy <= btn.y + btn.h) {
        this.hoveredVerb = btn.verb;
        break;
      }
    }

    return this.hoveredVerb !== prev;
  }

  public handlePointerDown(vx: number, vy: number): boolean {
    for (const btn of this.buttons) {
      if (vx >= btn.x && vx <= btn.x + btn.w && vy >= btn.y && vy <= btn.y + btn.h) {
        soundFX.playClick();
        gameState.setVerb(btn.verb);
        // Play Catalan audio confirmation
        speechManager.speak(btn.catalanAudio);
        return true;
      }
    }
    return false;
  }
}
