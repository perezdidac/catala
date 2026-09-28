import { gameState } from '../GameState';
import { Sprites } from '../art/Sprites';
import { soundFX } from '../../engine/SoundFX';
import { speechManager } from '../../engine/SpeechManager';
import { dialogOverlay } from '../ui/DialogOverlay';
import { DIALOGUES, VOCABULARY_LIST } from '../../data/catalanVocabulary';
import { assetManager } from '../../engine/AssetManager';

export class BridgeScene {
  private hoveredHotspotId: string | null = null;
  private animTime: number = 0;

  private hotspots = [
    { id: 'water_crane', name: "La Grua d'Aigua", x: 250, y: 15, w: 240, h: 140 },
    { id: 'otter', name: 'La Llúdriga Neus', x: 160, y: 225, w: 280, h: 70 },
    { id: 'locomotive', name: 'La Locomotora El Drac', x: 40, y: 35, w: 380, h: 120 },
    { id: 'river', name: "El Riu d'Or", x: 100, y: 210, w: 440, h: 110 },
    { id: 'bridge', name: 'El Viaducte de Pedra', x: 60, y: 110, w: 520, h: 110 }
  ];

  public enter(): void {
    setTimeout(() => {
      dialogOverlay.show({
        speaker: DIALOGUES.bridgeIntro.speaker,
        title: DIALOGUES.bridgeIntro.title,
        text: DIALOGUES.bridgeIntro.text,
        voiceText: DIALOGUES.bridgeIntro.voiceText,
        avatar: 'driver'
      });
    }, 200);
  }

  public update(dt: number): void {
    this.animTime += dt;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const time = this.animTime;
    const state = gameState.get();
    const modernBg = assetManager.getImage('bridge');

    if (modernBg) {
      // Modern High-Bit Pixel Art Artwork Backdrop
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(modernBg, 0, 0, 640, 360);
      ctx.restore();

      // Dynamic water ripples in the river
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let r = 0; r < 5; r++) {
        const rx = 240 + Math.sin(time * 2 + r * 1.5) * 80;
        const ry = 250 + r * 12;
        ctx.fillRect(rx, ry, 24, 2);
      }
      ctx.restore();

      // Water pouring from crane when operated
      if (state.waterCraneOperated) {
        ctx.save();
        ctx.fillStyle = 'rgba(147, 197, 253, 0.85)';
        for (let w = 0; w < 4; w++) {
          const flowY = 55 + ((time * 80 + w * 18) % 45);
          ctx.fillRect(394 + (w % 2) * 2, flowY, 4, 8);
        }
        ctx.restore();
      }

      // Sparkle on Neus' wrench if not yet taken
      if (!state.wrenchCollected) {
        ctx.font = '14px sans-serif';
        ctx.fillText('✨', 228, 245 + Math.sin(time * 4) * 3);
      }
    } else {
      // Procedural fallback
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 180);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 640, 180);

      Sprites.drawDriftingClouds(ctx, time);
      Sprites.drawMountains(ctx, time);
      Sprites.drawViaductBridge(ctx, time);
      Sprites.drawRailwayTracks(ctx, 0, 640, 240);
      Sprites.drawLocomotive(ctx, 120, 243, time, true, 0);
      Sprites.drawWaterCrane(ctx, 275, 238, state.waterCraneOperated, time);
      Sprites.drawOtter(ctx, 400, 255, time, !state.wrenchCollected);
    }

    // Hotspot Hover Outline & Label Pill
    if (this.hoveredHotspotId) {
      const hs = this.hotspots.find((h) => h.id === this.hoveredHotspotId);
      if (hs) {
        ctx.save();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(hs.x, hs.y, hs.w, hs.h);
        ctx.restore();

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(180, 8, 280, 26);
        ctx.strokeStyle = Sprites.COLORS.goldBrass;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(180, 8, 280, 26);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hs.name, 320, 20);
      }
    }

    // 8. Navigation pill to return to previous station
    this.renderNavPill(ctx);
  }

  private renderNavPill(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(10, 10, 110, 26);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(10, 10, 110, 26);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚉 Els Pins', 65, 26);
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
    // Nav back to Els Pins
    if (vx >= 10 && vx <= 120 && vy >= 10 && vy <= 36) {
      soundFX.playClick();
      gameState.setScene('station');
      return true;
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
      case 'otter':
        if (verb === 'MIRA') {
          soundFX.playClick();
          speechManager.speak("És la llúdriga Neus! Neda feliç al riu i porta una clau anglesa.");
        } else if (verb === 'AGAFA') {
          if (!state.wrenchCollected) {
            speechManager.speak("La Neus vol que parlem amb ella abans de donar-nos la clau!");
          } else {
            speechManager.speak("La Neus neda contenta: Xip-xap!");
          }
        } else if (verb === 'PARLA') {
          soundFX.playClick();
          if (!state.wrenchCollected) {
            // Voice Gate: Aigua fresca
            dialogOverlay.show({
              speaker: DIALOGUES.otterAskVoice.speaker,
              title: DIALOGUES.otterAskVoice.title,
              text: DIALOGUES.otterAskVoice.text,
              voiceText: DIALOGUES.otterAskVoice.voiceText,
              avatar: 'driver',
              isVoiceGate: true,
              targetPhrase: 'Aigua fresca',
              targetTokens: VOCABULARY_LIST.aigua_fresca.acceptedRecognitionTokens,
              syllables: DIALOGUES.otterAskVoice.syllables,
              onSuccess: () => {
                gameState.updateFlags({
                  waterVoiceGatePassed: true,
                  wrenchCollected: true
                });
                gameState.addItem({
                  id: 'clau_anglesa',
                  name: 'La Clau Anglesa',
                  catalanName: 'La Clau Anglesa',
                  icon: '🔧',
                  description: 'Clau anglesa per obrir la grua d\'aigua.',
                  speechPhrase: 'Això és la clau anglesa per obrir la vàlvula!'
                });
                dialogOverlay.show({
                  speaker: DIALOGUES.otterSuccess.speaker,
                  title: DIALOGUES.otterSuccess.title,
                  text: DIALOGUES.otterSuccess.text,
                  voiceText: DIALOGUES.otterSuccess.voiceText,
                  avatar: 'driver'
                });
              }
            });
          } else {
            speechManager.speak("La Neus et saluda: Molt bon viatge pel pont del riu d'Or!");
          }
        }
        break;

      case 'water_crane':
        if (verb === 'MIRA') {
          soundFX.playClick();
          speechManager.speak("La grua d'aigua serveix per omplir la caldera de la locomotora.");
        } else if (verb === 'AGAFA' || verb === 'CONDUEIX') {
          if (!state.wrenchCollected) {
            soundFX.playClick();
            dialogOverlay.show({
              title: 'Vàlvula Tancada!',
              text: 'La vàlvula necessita una clau anglesa. Parla amb la llúdriga Neus al riu!',
              voiceText: 'La vàlvula necessita una clau anglesa. Parla amb la llúdriga Neus al riu!',
              avatar: 'driver'
            });
          } else if (!state.waterTankFilled) {
            // Fill water!
            soundFX.playLever();
            gameState.updateFlags({
              waterCraneOperated: true,
              waterTankFilled: true
            });
            dialogOverlay.show({
              title: DIALOGUES.waterTankFull.title,
              text: DIALOGUES.waterTankFull.text,
              voiceText: DIALOGUES.waterTankFull.voiceText,
              avatar: 'driver'
            });
          } else {
            speechManager.speak("El dipòsit d'aigua ja està ple!");
          }
        } else if (verb === 'PARLA') {
          speechManager.speak("La grua fa: gorg, gorg quan baixa l'aigua!");
        }
        break;

      case 'locomotive':
      case 'bridge':
        if (verb === 'CONDUEIX') {
          if (!state.waterTankFilled) {
            soundFX.playClick();
            dialogOverlay.show({
              title: 'Falta Aigua!',
              text: 'Abans de creuar el pont, hem d\'omplir la caldera amb aigua fresca de la grua!',
              voiceText: 'Abans de creuar el pont, hem d\'omplir la caldera amb aigua fresca de la grua!',
              avatar: 'driver'
            });
          } else {
            // Success! Head to the Castle!
            soundFX.playWhistle();
            gameState.setScene('castle');
          }
        } else if (verb === 'MIRA') {
          speechManager.speak("El gran pont de pedra creua cap al Castell de la Roca!");
        }
        break;

      case 'river':
        speechManager.speak("L'aigua del riu baixa fresca i cristal·lina!");
        break;
    }
  }
}
