/**
 * StationScene: "L'Estació dels Pins" (The Pine Station)
 * Main puzzle scene with interactive hotspots, NPC dialogues, and track clearance.
 */

import { gameState } from '../GameState';
import { Sprites } from '../art/Sprites';
import { soundFX } from '../../engine/SoundFX';
import { speechManager } from '../../engine/SpeechManager';
import { dialogOverlay } from '../ui/DialogOverlay';
import { DIALOGUES, VOCABULARY_LIST } from '../../data/catalanVocabulary';
import { assetManager } from '../../engine/AssetManager';
import { particleSystem } from '../../engine/ParticleSystem';

export interface Hotspot {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cursor: string;
}

export class StationScene {
  private hoveredHotspotId: string | null = null;
  private animTime: number = 0;
  private wheelAngle: number = 0;
  private steamTimer: number = 0;

  // Scene hotspots - broad touch-friendly hitboxes matching modern pixel artwork & tests
  private hotspots: Hotspot[] = [
    {
      id: 'branches',
      name: 'Les Branques de Pi',
      x: 370,
      y: 235,
      w: 80,
      h: 50,
      cursor: 'pointer'
    },
    {
      id: 'switch_lever',
      name: "La Palanca de Canvi d'Agulla",
      x: 420,
      y: 220,
      w: 65,
      h: 65,
      cursor: 'pointer'
    },
    {
      id: 'stationmaster',
      name: "El Cap d'Estació Pep",
      x: 340,
      y: 180,
      w: 125,
      h: 95,
      cursor: 'pointer'
    },
    {
      id: 'locomotive',
      name: 'La Locomotora El Drac',
      x: 60,
      y: 140,
      w: 280,
      h: 130,
      cursor: 'pointer'
    },
    {
      id: 'clock',
      name: "El Rellotge de l'Estació",
      x: 390,
      y: 60,
      w: 75,
      h: 75,
      cursor: 'pointer'
    },
    {
      id: 'bird',
      name: "L'Ocellet de Pi",
      x: 535,
      y: 130,
      w: 55,
      h: 55,
      cursor: 'pointer'
    }
  ];

  public enter(): void {
    // Show welcoming greeting on first enter
    const state = gameState.get();
    if (!state.switchInspected && !state.branchesTaken) {
      setTimeout(() => {
        dialogOverlay.show({
          speaker: "El Conductor de Paraules",
          avatar: 'train',
          title: DIALOGUES.welcome.title,
          text: DIALOGUES.welcome.text,
          voiceText: DIALOGUES.welcome.voiceText
        });
      }, 300);
    }
  }

  public update(dt: number): void {
    this.animTime += dt;
    this.steamTimer += dt;
    if (this.steamTimer >= 0.4) {
      this.steamTimer = 0;
      particleSystem.emitSteam(350, 190, 2, 6);
    }
  }

  private drawSteamPuffs(ctx: CanvasRenderingContext2D, time: number, x: number, y: number): void {
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const puffTime = (time * 1.4 + i * 0.8) % 3.2;
      const puffY = y - puffTime * 24;
      const puffX = x - puffTime * 14 + Math.sin(puffTime * 3) * 6;
      const radius = 6 + puffTime * 7;
      const alpha = Math.max(0, 0.65 - puffTime * 0.2);
      ctx.fillStyle = `rgba(248, 250, 252, ${alpha})`;
      ctx.beginPath();
      ctx.arc(puffX, puffY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const time = this.animTime;
    const state = gameState.get();
    const modernBg = assetManager.getImage('station');

    if (modernBg) {
      // Modern High-Bit Pixel Art Artwork Backdrop
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(modernBg, 0, 0, 640, 360);
      ctx.restore();

      // Dynamic animated steam puffs from locomotive chimney
      this.drawSteamPuffs(ctx, time, 350, 195);

      // Tactile Pine branches on track (if not yet picked up)
      if (!state.branchesTaken) {
        Sprites.drawPineBranches(ctx, 395, 255, this.hoveredHotspotId === 'branches');
        // Sparkling reminder pulse
        const sparkle = Math.sin(time * 5) > 0 ? '✨' : '⭐';
        ctx.font = '14px sans-serif';
        ctx.fillText(sparkle, 405, 248);
      }

      // Track switch signal light indicator (green = open, red = blocked)
      const sigColor = state.switchOpen ? '#22c55e' : '#ef4444';
      ctx.save();
      ctx.fillStyle = sigColor;
      ctx.shadowColor = sigColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(430, 235, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Procedural fallback while image is loading or in headless tests
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 200);
      skyGrad.addColorStop(0, Sprites.COLORS.skyTop);
      skyGrad.addColorStop(0.65, Sprites.COLORS.skyMid);
      skyGrad.addColorStop(1, Sprites.COLORS.skyHorizon);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 640, 200);

      Sprites.drawDriftingClouds(ctx, time);
      Sprites.drawMountains(ctx, time);
      Sprites.drawPineTree(ctx, 35, 175, 0.7);
      Sprites.drawPineTree(ctx, 85, 178, 0.65);
      Sprites.drawPineTree(ctx, 290, 175, 0.75);
      Sprites.drawPineTree(ctx, 575, 185, 0.9);
      Sprites.drawPineTree(ctx, 620, 180, 0.8);

      ctx.fillStyle = Sprites.COLORS.grassGreen;
      ctx.fillRect(0, 190, 640, 60);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(240, 215, 400, 30);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(240, 243, 400, 2);

      Sprites.drawStationBuilding(ctx, 330, 215, time);
      Sprites.drawStationmaster(ctx, 345, 242, time, dialogOverlay.isOpen());
      Sprites.drawBird(ctx, 560, 180, time);
      Sprites.drawRailwayTracks(ctx, 0, 640, 255);
      Sprites.drawLocomotive(ctx, 160, 258, time, true, this.wheelAngle);
      Sprites.drawTrackSwitch(ctx, 410, 255, state.switchOpen, this.hoveredHotspotId === 'switch_lever');

      if (!state.branchesTaken) {
        Sprites.drawPineBranches(ctx, 415, 258, this.hoveredHotspotId === 'branches');
      }
    }

    // Interactive Hotspot Hover Highlight & Tactile Name Tag
    if (this.hoveredHotspotId) {
      const hs = this.hotspots.find((h) => h.id === this.hoveredHotspotId);
      if (hs) {
        // Glowing gold highlight outline around the hovered object
        ctx.save();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(hs.x, hs.y, hs.w, hs.h);
        ctx.restore();

        // High-contrast Catalan label pill at top
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(180, 8, 280, 26);
        ctx.strokeStyle = Sprites.COLORS.goldBrass;
        ctx.lineWidth = 2;
        ctx.strokeRect(180, 8, 280, 26);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hs.name, 320, 20);
      }
    }
  }

  public handlePointerMove(vx: number, vy: number): boolean {
    const prev = this.hoveredHotspotId;
    this.hoveredHotspotId = null;

    const state = gameState.get();

    for (const hs of this.hotspots) {
      // Hide branches hotspot once taken
      if (hs.id === 'branches' && state.branchesTaken) continue;

      if (vx >= hs.x && vx <= hs.x + hs.w && vy >= hs.y && vy <= hs.y + hs.h) {
        this.hoveredHotspotId = hs.id;
        break;
      }
    }

    return this.hoveredHotspotId !== prev;
  }

  public handlePointerDown(vx: number, vy: number): boolean {
    const state = gameState.get();
    const activeVerb = state.activeVerb;

    // Check hotspot hits
    for (const hs of this.hotspots) {
      if (hs.id === 'branches' && state.branchesTaken) continue;

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
      case 'branches':
        if (verb === 'MIRA') {
          soundFX.playClick();
          dialogOverlay.show({
            title: DIALOGUES.switchBlocked.title,
            text: DIALOGUES.switchBlocked.text,
            voiceText: DIALOGUES.switchBlocked.voiceText,
            avatar: 'narrator'
          });
          gameState.updateFlags({ switchInspected: true });
        } else if (verb === 'AGAFA') {
          // Take the branches!
          soundFX.playPickup();
          particleSystem.emitSparkles(395, 255, 12);
          gameState.addBadge('badge_branques');
          gameState.updateFlags({ branchesTaken: true });
          gameState.addItem({
            id: 'branques',
            name: 'Les Branques',
            catalanName: 'Les Branques de Pi',
            icon: '🪵',
            description: 'Branques de pi seques per encendre foc.',
            speechPhrase: 'Això són les branques de pi. Podem fer foc a la caldera!'
          });
          dialogOverlay.show({
            title: DIALOGUES.tookBranches.title,
            text: DIALOGUES.tookBranches.text,
            voiceText: DIALOGUES.tookBranches.voiceText,
            avatar: 'narrator'
          });
        } else if (verb === 'PARLA') {
          speechManager.speak("Les branques no parlen, però fan una bona olor de pi!");
        } else if (verb === 'CONDUEIX') {
          speechManager.speak("Primer cal netejar la via!");
        }
        break;

      case 'stationmaster':
        if (verb === 'MIRA') {
          soundFX.playClick();
          dialogOverlay.show({
            speaker: "El Cap d'Estació Pep",
            title: "Cap d'Estació Pep",
            text: "És en Pep, el vigilant de l'estació. Té la gorra vermella i la paleta verda.",
            voiceText: "Aquest és en Pep, el cap d'estació dels Pins. Porta una gorra vermella i la paleta verda de sortida.",
            avatar: 'stationmaster'
          });
        } else if (verb === 'AGAFA') {
          soundFX.playClick();
          speechManager.speak("En Pep no es pot agafar! És el nostre amic.");
        } else if (verb === 'PARLA') {
          soundFX.playClick();
          if (!state.voiceGatePassed) {
            // Voice Gate Trigger!
            dialogOverlay.show({
              speaker: DIALOGUES.stationmasterAskVoice.speaker,
              title: DIALOGUES.stationmasterAskVoice.title,
              text: DIALOGUES.stationmasterAskVoice.text,
              voiceText: DIALOGUES.stationmasterAskVoice.voiceText,
              avatar: 'stationmaster',
              isVoiceGate: true,
              targetPhrase: 'Obre la via',
              targetTokens: VOCABULARY_LIST.obre_via.acceptedRecognitionTokens,
              syllables: DIALOGUES.stationmasterAskVoice.syllables,
              onSuccess: () => {
                gameState.updateFlags({ voiceGatePassed: true });
                dialogOverlay.show({
                  speaker: DIALOGUES.stationmasterSuccess.speaker,
                  title: DIALOGUES.stationmasterSuccess.title,
                  text: DIALOGUES.stationmasterSuccess.text,
                  voiceText: DIALOGUES.stationmasterSuccess.voiceText,
                  avatar: 'stationmaster'
                });
              }
            });
          } else {
            // Already passed voice gate
            dialogOverlay.show({
              speaker: "Cap d'Estació Pep",
              title: "Tot preparat!",
              text: "Has dit la paraula màgica! Ara estira la palanca per donar llum verda!",
              voiceText: "Molt bé! Ara estira la palanca per donar llum verda al tren!",
              avatar: 'stationmaster'
            });
          }
        } else if (verb === 'CONDUEIX') {
          speechManager.speak("En Pep diu: Puja a la cabina quan la via estigui oberta!");
        }
        break;

      case 'switch_lever':
        if (verb === 'MIRA') {
          soundFX.playClick();
          const leverDesc = state.switchOpen
            ? "La palanca està activada i el semàfor està verd! La via està lliure."
            : "La palanca del canvi d'agulla. Cal retirar les branques i demanar el permís a en Pep!";
          dialogOverlay.show({
            title: "El Canvi d'Agulla",
            text: leverDesc,
            voiceText: leverDesc,
            avatar: 'narrator'
          });
        } else if (verb === 'AGAFA' || verb === 'CONDUEIX') {
          // If branches are still there
          if (!state.branchesTaken) {
            soundFX.playClick();
            dialogOverlay.show({
              title: "Palanca Encallada!",
              text: "No es pot moure la palanca! Les branques de pi la bloquegen. Fes servir AGAFA a les branques primer!",
              voiceText: "No es pot moure la palanca! Les branques de pi la bloquegen. Agafa les branques primer!",
              avatar: 'narrator'
            });
            return;
          }

          // If voice gate is not passed
          if (!state.voiceGatePassed) {
            soundFX.playClick();
            dialogOverlay.show({
              title: "Bloqueig de Seguretat!",
              text: "La palanca té un candau màgic! Fes servir PARLA amb en Pep per aprendre la paraula màgica!",
              voiceText: "La palanca necessita la paraula màgica. Parla amb el Cap d'Estació Pep!",
              avatar: 'stationmaster'
            });
            return;
          }

          // Move the lever!
          if (!state.switchOpen) {
            soundFX.playLever();
            particleSystem.emitRing(430, 235, '#22c55e', 30);
            particleSystem.emitSparkles(430, 235, 14);
            gameState.addBadge('badge_obre_via');
            gameState.updateFlags({ switchOpen: true });
            dialogOverlay.show({
              title: DIALOGUES.switchOpened.title,
              text: DIALOGUES.switchOpened.text,
              voiceText: DIALOGUES.switchOpened.voiceText,
              avatar: 'stationmaster'
            });
          } else {
            speechManager.speak("La via ja està oberta! El semàfor és verd!");
          }
        } else if (verb === 'PARLA') {
          speechManager.speak("La palanca fa clac quan la mous!");
        }
        break;

      case 'locomotive':
        if (verb === 'MIRA') {
          soundFX.playClick();
          dialogOverlay.show({
            title: "La Locomotora 'El Drac'",
            text: "Una meravellosa màquina de vapor antiga amb rodes vermelles i xiulet de llautó.",
            voiceText: "Això és una locomotora de vapor antiga. Es diu El Drac i funciona amb aigua, carbó i fusta.",
            avatar: 'train'
          });
        } else if (verb === 'AGAFA') {
          speechManager.speak("La locomotora és gegant! No cap a la maleta!");
        } else if (verb === 'PARLA') {
          soundFX.playWhistle();
          particleSystem.emitSteam(350, 185, 4, 8);
          speechManager.speak("La locomotora respon amb el xiulet: Tuuuut!");
        } else if (verb === 'CONDUEIX') {
          if (!state.switchOpen) {
            soundFX.playClick();
            dialogOverlay.show({
              title: "Atenció al Tren!",
              text: "Encara no podem arrencar! Primer hem de netejar les branques i obrir la via!",
              voiceText: "Encara no podem arrencar! Primer hem de netejar les branques i obrir la via amb en Pep.",
              avatar: 'stationmaster'
            });
          } else {
            // All cleared! Enter cabin!
            soundFX.playBell();
            particleSystem.emitSparkles(320, 180, 16);
            gameState.setScene('cabin');
          }
        }
        break;

      case 'clock':
        soundFX.playClick();
        particleSystem.emitRing(425, 100, '#fef08a', 20);
        speechManager.speak("Són les dotze en punt! L'hora en què surt el tren dels Pins.");
        break;

      case 'bird':
        soundFX.playBirdChirp();
        particleSystem.emitSparkles(560, 150, 8);
        speechManager.speak("L'ocellet canta: Piu, piu, piu!");
        break;
    }
  }
}
