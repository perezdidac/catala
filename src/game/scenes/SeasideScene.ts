import { gameState, SceneId } from '../GameState';
import { Sprites } from '../art/Sprites';
import { PixelPrimitives } from '../art/PixelPrimitives';
import { soundFX } from '../../engine/SoundFX';
import { speechManager } from '../../engine/SpeechManager';
import { dialogOverlay } from '../ui/DialogOverlay';
import { DIALOGUES, VOCABULARY_LIST } from '../../data/catalanVocabulary';
import { assetManager } from '../../engine/AssetManager';
import { particleSystem } from '../../engine/ParticleSystem';

export class SeasideScene {
  private hoveredHotspotId: string | null = null;
  private animTime: number = 0;

  private hotspots = [
    { id: 'mayor', name: 'Alcaldessa Eulàlia', x: 240, y: 180, w: 120, h: 85 },
    { id: 'lighthouse', name: 'El Far de la Costa', x: 500, y: 15, w: 110, h: 130 },
    { id: 'sea', name: 'El Mar Mediterrani', x: 120, y: 60, w: 380, h: 110 },
    { id: 'locomotive', name: 'La Locomotora El Drac', x: 40, y: 150, w: 420, h: 110 }
  ];

  public enter(): void {
    setTimeout(() => {
      dialogOverlay.show({
        speaker: DIALOGUES.seasideIntro.speaker,
        title: DIALOGUES.seasideIntro.title,
        text: DIALOGUES.seasideIntro.text,
        voiceText: DIALOGUES.seasideIntro.voiceText,
        avatar: 'driver'
      });
    }, 200);
  }

  private confettiTimer: number = 0;

  public update(dt: number): void {
    this.animTime += dt;
    if (gameState.get().grandCelebration) {
      this.confettiTimer += dt;
      if (this.confettiTimer >= 0.25) {
        this.confettiTimer = 0;
        particleSystem.emitConfetti(100 + Math.random() * 440, 20 + Math.random() * 30, 6);
        if (Math.random() < 0.35) {
          particleSystem.emitSparkles(Math.random() * 640, Math.random() * 160, 4);
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const time = this.animTime;
    const state = gameState.get();
    const modernBg = assetManager.getImage('seaside');

    if (modernBg) {
      // Modern High-Bit Pixel Art Artwork Backdrop
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(modernBg, 0, 0, 640, 360);
      ctx.restore();

      // Sparkling sea waves
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      for (let s = 0; s < 6; s++) {
        const sx = 200 + Math.sin(time * 3 + s * 1.8) * 120;
        const sy = 85 + s * 12;
        ctx.fillRect(sx, sy, 18, 2);
      }
      ctx.restore();

      // Celebratory festival confetti falling down
      const confettiColors = ['#f43f5e', '#3b82f6', '#eab308', '#22c55e', '#a855f7'];
      for (let c = 0; c < 16; c++) {
        const cx = (c * 42 + Math.sin(time * 2 + c) * 20) % 640;
        const cy = ((time * 35 + c * 38) % 360);
        ctx.fillStyle = confettiColors[c % confettiColors.length];
        ctx.fillRect(cx, cy, 3, 4);
      }
    } else {
      // Procedural fallback
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 150);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(1, '#fde047');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 640, 150);

      Sprites.drawDriftingClouds(ctx, time);
      Sprites.drawSeasideView(ctx, time);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(180, 220, 460, 30);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(180, 248, 460, 2);

      const flagColors = ['#dc2626', '#facc15', '#3b82f6', '#16a34a', '#ec4899'];
      for (let f = 0; f < 18; f++) {
        const fx = 180 + f * 24;
        const fy = 200 + Math.sin(f * 0.8) * 3;
        ctx.fillStyle = flagColors[f % flagColors.length];
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + 10, fy);
        ctx.lineTo(fx + 5, fy + 10);
        ctx.fill();
      }

      Sprites.drawRailwayTracks(ctx, 0, 640, 255);
      Sprites.drawLocomotive(ctx, 110, 258, time, true, 0);
      Sprites.drawMayor(ctx, 310, 242, time, dialogOverlay.isOpen());

      // Buffer stop (buffer block at track end)
      PixelPrimitives.drawBeveledRect(ctx, 330, 240, 16, 22, '#dc2626', '#f87171', '#7f1d1d', 2);
    }

    // 8. Hotspot Hover Name Tag
    if (this.hoveredHotspotId) {
      const hs = this.hotspots.find((h) => h.id === this.hoveredHotspotId);
      if (hs) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(180, 8, 280, 24);
        ctx.strokeStyle = Sprites.COLORS.goldBrass;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(180, 8, 280, 24);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hs.name, 320, 20);
      }
    }

    // 9. Route Map & Station Teleport Selector along top
    this.renderRouteMap(ctx);
  }

  private renderRouteMap(ctx: CanvasRenderingContext2D): void {
    const stations: { id: SceneId; label: string; x: number }[] = [
      { id: 'station', label: '1. Pins', x: 20 },
      { id: 'cabin', label: '2. Cabina', x: 85 },
      { id: 'bridge', label: '3. Pont', x: 155 },
      { id: 'castle', label: '4. Castell', x: 220 },
      { id: 'seaside', label: '5. El Mar', x: 295 }
    ];

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(10, 8, 360, 24);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 8, 360, 24);

    for (const st of stations) {
      const isCurrent = gameState.get().currentScene === st.id;
      ctx.fillStyle = isCurrent ? '#fef08a' : '#94a3b8';
      ctx.font = isCurrent ? 'bold 9px sans-serif' : '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(st.label, st.x, 23);
    }
  }

  public handlePointerMove(vx: number, vy: number): boolean {
    const prev = this.hoveredHotspotId;
    this.hoveredHotspotId = null;

    for (const hs of this.hotspots) {
      if (vx >= hs.x && vx <= hs.x + hs.w && vy >= hs.y && vy <= hs.y + hs.h) {
        this.hoveredHotspotId = hs.id;
        break;
      }
    }

    return this.hoveredHotspotId !== prev;
  }

  public handlePointerDown(vx: number, vy: number): boolean {
    // Route map selector click
    if (vy >= 8 && vy <= 32) {
      if (vx >= 15 && vx <= 75) {
        soundFX.playClick();
        gameState.setScene('station');
        return true;
      } else if (vx >= 80 && vx <= 145) {
        soundFX.playClick();
        gameState.setScene('cabin');
        return true;
      } else if (vx >= 150 && vx <= 210) {
        soundFX.playClick();
        gameState.setScene('bridge');
        return true;
      } else if (vx >= 215 && vx <= 285) {
        soundFX.playClick();
        gameState.setScene('castle');
        return true;
      }
    }

    const state = gameState.get();
    const activeVerb = state.activeVerb;

    for (const hs of this.hotspots) {
      if (vx >= hs.x && vx <= hs.x + hs.w && vy >= hs.y && vy <= hs.y + hs.h) {
        this.onHotspotClick(hs.id, activeVerb);
        return true;
      }
    }

    return false;
  }

  private onHotspotClick(hotspotId: string, verb: string): void {
    const state = gameState.get();

    switch (hotspotId) {
      case 'mayor':
        if (verb === 'MIRA') {
          soundFX.playClick();
          speechManager.speak("És l'Alcaldessa Eulàlia! Té la banda catalana i la medalla d'or!");
        } else if (verb === 'PARLA') {
          soundFX.playClick();
          if (!state.grandCelebration) {
            // Final Grand Voice Gate: Visca el tren!
            dialogOverlay.show({
              speaker: DIALOGUES.mayorAskVoice.speaker,
              title: DIALOGUES.mayorAskVoice.title,
              text: DIALOGUES.mayorAskVoice.text,
              voiceText: DIALOGUES.mayorAskVoice.voiceText,
              avatar: 'driver',
              isVoiceGate: true,
              targetPhrase: 'Visca el tren',
              targetTokens: VOCABULARY_LIST.visca_el_tren.acceptedRecognitionTokens,
              syllables: DIALOGUES.mayorAskVoice.syllables,
              onSuccess: () => {
                soundFX.playSuccess();
                particleSystem.emitConfetti(320, 100, 36);
                particleSystem.emitSparkles(320, 150, 24);
                gameState.addBadge('badge_medalla_or');
                gameState.addBadge('badge_visca_el_tren');
                gameState.updateFlags({
                  celebrationVoiceGatePassed: true,
                  medalAwarded: true,
                  grandCelebration: true
                });
                gameState.addItem({
                  id: 'medalla',
                  name: "La Medalla d'Or",
                  catalanName: "La Medalla d'Or del Gran Maquinista",
                  icon: '🏅',
                  description: 'Medalla d\'or del millor conductor de paraules.',
                  speechPhrase: 'Has guanyat la medalla d\'or del Gran Maquinista!'
                });
                dialogOverlay.show({
                  speaker: DIALOGUES.mayorSuccess.speaker,
                  title: DIALOGUES.mayorSuccess.title,
                  text: DIALOGUES.mayorSuccess.text,
                  voiceText: DIALOGUES.mayorSuccess.voiceText,
                  avatar: 'driver'
                });
              }
            });
          } else {
            speechManager.speak("L'Alcaldessa diu: Ets el millor maquinista de tot Catalunya!");
          }
        } else if (verb === 'AGAFA') {
          speechManager.speak("L'Alcaldessa et fa entrega de la medalla d'or!");
        }
        break;

      case 'lighthouse':
        soundFX.playWhistle();
        particleSystem.emitSparkles(545, 55, 14);
        speechManager.speak("El far de la platja il·lumina les barquetes del mar!");
        break;

      case 'sea':
        soundFX.playClick();
        particleSystem.emitWaterSplash(300, 120, 8);
        speechManager.speak("El mar blau té ones suaus i gavines volant!");
        break;

      case 'locomotive':
        soundFX.playWhistle();
        speechManager.speak("La locomotora El Drac ha complert la seva gran missió!");
        break;
    }
  }
}
