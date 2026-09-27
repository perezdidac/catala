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

  // Scene hotspots
  private hotspots: Hotspot[] = [
    {
      id: 'branches',
      name: 'Les Branques de Pi',
      x: 395,
      y: 245,
      w: 55,
      h: 30,
      cursor: 'pointer'
    },
    {
      id: 'switch_lever',
      name: "La Palanca de Canvi d'Agulla",
      x: 445,
      y: 230,
      w: 48,
      h: 55,
      cursor: 'pointer'
    },
    {
      id: 'stationmaster',
      name: "El Cap d'Estació Pep",
      x: 345,
      y: 195,
      w: 40,
      h: 68,
      cursor: 'pointer'
    },
    {
      id: 'locomotive',
      name: 'La Locomotora El Drac',
      x: 80,
      y: 155,
      w: 240,
      h: 110,
      cursor: 'pointer'
    },
    {
      id: 'clock',
      name: "El Rellotge de l'Estació",
      x: 420,
      y: 100,
      w: 36,
      h: 36,
      cursor: 'pointer'
    },
    {
      id: 'bird',
      name: "L'Ocellet de Pi",
      x: 555,
      y: 165,
      w: 24,
      h: 24,
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
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const time = this.animTime;
    const state = gameState.get();

    // 1. Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 200);
    skyGrad.addColorStop(0, Sprites.COLORS.skyTop);
    skyGrad.addColorStop(0.65, Sprites.COLORS.skyMid);
    skyGrad.addColorStop(1, Sprites.COLORS.skyHorizon);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 640, 200);

    // 2. Drifting Pixel Clouds
    Sprites.drawDriftingClouds(ctx, time);

    // 3. Montserrat Mountain Peaks
    Sprites.drawMountains(ctx, time);

    // 4. Background Pine Trees
    Sprites.drawPineTree(ctx, 35, 175, 0.7);
    Sprites.drawPineTree(ctx, 85, 178, 0.65);
    Sprites.drawPineTree(ctx, 290, 175, 0.75);
    Sprites.drawPineTree(ctx, 575, 185, 0.9);
    Sprites.drawPineTree(ctx, 620, 180, 0.8);

    // 5. Station Platform & Ground
    ctx.fillStyle = Sprites.COLORS.grassGreen;
    ctx.fillRect(0, 190, 640, 60);

    // Platform pavement
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(240, 215, 400, 30);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(240, 243, 400, 2);

    // 6. Station Building "L'Estació dels Pins"
    Sprites.drawStationBuilding(ctx, 330, 215, time);

    // 7. Stationmaster Pep
    Sprites.drawStationmaster(
      ctx,
      345,
      242,
      time,
      dialogOverlay.isOpen()
    );

    // 8. Singing Bird on fence
    Sprites.drawBird(ctx, 560, 180, time);

    // 9. Railway Tracks
    Sprites.drawRailwayTracks(ctx, 0, 640, 255);

    // 10. Steam Locomotive "El Drac"
    Sprites.drawLocomotive(ctx, 160, 258, time, true, this.wheelAngle);

    // 11. Track Switch & Lever
    Sprites.drawTrackSwitch(
      ctx,
      410,
      255,
      state.switchOpen,
      this.hoveredHotspotId === 'switch_lever'
    );

    // 12. Fallen Pine Branches (if not yet picked up)
    if (!state.branchesTaken) {
      Sprites.drawPineBranches(
        ctx,
        415,
        258,
        this.hoveredHotspotId === 'branches'
      );
    }

    // 13. Hotspot Hover Name Tag above the scene
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
            gameState.setScene('cabin');
          }
        }
        break;

      case 'clock':
        soundFX.playClick();
        speechManager.speak("Són les dotze en punt! L'hora en què surt el tren dels Pins.");
        break;

      case 'bird':
        soundFX.playBirdChirp();
        speechManager.speak("L'ocellet canta: Piu, piu, piu!");
        break;
    }
  }
}
