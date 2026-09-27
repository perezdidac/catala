/**
 * CastleScene: Scene 4 - "El Castell de la Roca" (The Mountain Castle Station)
 * Medieval castle, Ticket Inspector Montserrat, departure bell, and mountain tunnel.
 */

import { gameState } from '../GameState';
import { Sprites } from '../art/Sprites';
import { PixelPrimitives } from '../art/PixelPrimitives';
import { soundFX } from '../../engine/SoundFX';
import { speechManager } from '../../engine/SpeechManager';
import { dialogOverlay } from '../ui/DialogOverlay';
import { DIALOGUES, VOCABULARY_LIST } from '../../data/catalanVocabulary';

export class CastleScene {
  private hoveredHotspotId: string | null = null;
  private animTime: number = 0;

  private hotspots = [
    { id: 'inspector', name: 'Revisora Montserrat', x: 310, y: 195, w: 42, h: 65 },
    { id: 'bell', name: 'La Campana de Sortida', x: 260, y: 180, w: 32, h: 45 },
    { id: 'castle', name: 'El Castell de la Roca', x: 420, y: 50, w: 100, h: 100 },
    { id: 'tunnel', name: 'El Túnel de la Muntanya', x: 520, y: 170, w: 100, h: 90 },
    { id: 'locomotive', name: 'La Locomotora El Drac', x: 60, y: 155, w: 180, h: 100 }
  ];

  public enter(): void {
    setTimeout(() => {
      dialogOverlay.show({
        speaker: DIALOGUES.castleIntro.speaker,
        title: DIALOGUES.castleIntro.title,
        text: DIALOGUES.castleIntro.text,
        voiceText: DIALOGUES.castleIntro.voiceText,
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

    // 1. Sky & Sun
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 180);
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(1, '#fef08a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 640, 180);

    Sprites.drawDriftingClouds(ctx, time);

    // 2. Medieval Hill & Castle
    Sprites.drawCastle(ctx, 450, 120);

    // 3. Platform & Green Hill slopes with olive trees
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(0, 190, 640, 65);

    // Stone Platform
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(200, 215, 340, 30);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(200, 243, 340, 2);

    // 4. Mountain Tunnel Entry (Arched stone tunnel)
    const tunX = 530;
    const tunY = 175;
    PixelPrimitives.drawBeveledRect(ctx, tunX - 10, tunY - 30, 110, 95, '#57534e', '#a8a29e', '#292524', 3);
    // Dark tunnel interior
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(tunX + 45, tunY + 25, 36, Math.PI, 0);
    ctx.lineTo(tunX + 81, tunY + 65);
    ctx.lineTo(tunX + 9, tunY + 65);
    ctx.fill();

    // 5. Tracks
    Sprites.drawRailwayTracks(ctx, 0, 640, 255);

    // 6. Locomotive
    Sprites.drawLocomotive(ctx, 110, 258, time, true, 0);

    // 7. Departure Brass Bell
    Sprites.drawStationBell(ctx, 275, 205, state.bellRung, time);

    // 8. Revisora Montserrat
    Sprites.drawInspector(ctx, 310, 242, time, dialogOverlay.isOpen());

    // 9. Hotspot Hover Name Tag
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

    // 10. Nav back pill
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
    ctx.fillText('🌉 El Pont', 65, 26);
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
    // Nav back to El Pont
    if (vx >= 10 && vx <= 120 && vy >= 10 && vy <= 36) {
      soundFX.playClick();
      gameState.setScene('bridge');
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
      case 'inspector':
        if (verb === 'MIRA') {
          soundFX.playClick();
          speechManager.speak("És la Revisora Montserrat! Té la gorra verda i revisa els bitllets dels passatgers.");
        } else if (verb === 'PARLA') {
          soundFX.playClick();
          if (!state.allAboardVoiceGatePassed) {
            // Voice Gate: Tots al tren!
            dialogOverlay.show({
              speaker: DIALOGUES.inspectorAskVoice.speaker,
              title: DIALOGUES.inspectorAskVoice.title,
              text: DIALOGUES.inspectorAskVoice.text,
              voiceText: DIALOGUES.inspectorAskVoice.voiceText,
              avatar: 'driver',
              isVoiceGate: true,
              targetPhrase: 'Tots al tren',
              targetTokens: VOCABULARY_LIST.tots_al_tren.acceptedRecognitionTokens,
              syllables: DIALOGUES.inspectorAskVoice.syllables,
              onSuccess: () => {
                soundFX.playBell();
                gameState.updateFlags({
                  allAboardVoiceGatePassed: true,
                  bellRung: true
                });
                gameState.addItem({
                  id: 'bitllet',
                  name: 'El Bitllet Daurat',
                  catalanName: 'El Bitllet Daurat',
                  icon: '🎟️',
                  description: 'Bitllet daurat cap a la Vall Verda i el Mar.',
                  speechPhrase: 'Això és el bitllet daurat de primera classe!'
                });
                dialogOverlay.show({
                  speaker: DIALOGUES.inspectorSuccess.speaker,
                  title: DIALOGUES.inspectorSuccess.title,
                  text: DIALOGUES.inspectorSuccess.text,
                  voiceText: DIALOGUES.inspectorSuccess.voiceText,
                  avatar: 'driver'
                });
              }
            });
          } else {
            speechManager.speak("La Revisora diu: Tots els bitllets revisats! Podeu entrar al túnel.");
          }
        } else if (verb === 'AGAFA') {
          speechManager.speak("La Revisora et somriu amb el bitllet!");
        }
        break;

      case 'bell':
        soundFX.playBell();
        gameState.updateFlags({ bellRung: true });
        speechManager.speak("Ding, dong! La campana de bronze ressona per tota la muntanya!");
        break;

      case 'castle':
        soundFX.playClick();
        speechManager.speak("El Castell de la Roca té una bandera catalana que oneja al vent!");
        break;

      case 'locomotive':
      case 'tunnel':
        if (verb === 'CONDUEIX') {
          if (!state.allAboardVoiceGatePassed && !state.bellRung) {
            soundFX.playClick();
            dialogOverlay.show({
              title: 'Atenció a la Sortida!',
              text: 'Abans d\'entrar al túnel, hem de parlar amb la Revisora i cridar: TOTS AL TREN!',
              voiceText: 'Abans d\'entrar al túnel, hem de parlar amb la Revisora i cridar: Tots al tren!',
              avatar: 'driver'
            });
          } else {
            // Success! Cross tunnel to Seaside!
            soundFX.playWhistle();
            gameState.updateFlags({ tunnelCrossed: true });
            gameState.setScene('seaside');
          }
        } else if (verb === 'MIRA') {
          speechManager.speak("El túnel de roca porta cap a la Vall Verda i la platja del mar!");
        }
        break;
    }
  }
}
