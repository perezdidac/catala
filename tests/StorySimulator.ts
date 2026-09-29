/**
 * StorySimulator: Headless story and gameplay simulation engine
 * Simulates a 5-year-old child and parent interacting with hotspots,
 * verbs, dialogues, voice gates, and inventory across all 5 scenes.
 */

import { gameState, ActionVerb, SceneId, InventoryItem } from '../src/game/GameState';
import { dialogOverlay, DialogConfig } from '../src/game/ui/DialogOverlay';
import { matchesCatalanToken } from '../src/data/catalanVocabulary';

export class StorySimulator {
  constructor() {
    this.resetStory();
  }

  public resetStory(): void {
    gameState.reset();
    dialogOverlay.hide();
  }

  public getCurrentScene(): SceneId {
    return gameState.get().currentScene;
  }

  public getActiveVerb(): ActionVerb {
    return gameState.get().activeVerb;
  }

  public selectVerb(verb: ActionVerb): void {
    gameState.setVerb(verb);
  }

  public getInventory(): InventoryItem[] {
    return gameState.get().inventory;
  }

  public hasInventoryItem(itemId: string): boolean {
    return gameState.hasItem(itemId);
  }

  public isDialogOpen(): boolean {
    return dialogOverlay.isOpen();
  }

  public getActiveDialog(): DialogConfig | null {
    return (dialogOverlay as unknown as { activeDialog: DialogConfig | null }).activeDialog;
  }

  public dismissDialog(): void {
    dialogOverlay.hide();
  }

  /**
   * Simulates speaking into the microphone during a voice gate
   */
  public respondVoiceGate(spokenText: string): boolean {
    const dialog = this.getActiveDialog();
    if (!dialog || !dialog.isVoiceGate || !dialog.targetTokens) {
      return false;
    }

    const matched = matchesCatalanToken(spokenText, dialog.targetTokens);
    if (matched && dialog.onSuccess) {
      dialog.onSuccess();
      return true;
    }
    return false;
  }

  /**
   * Simulates tapping the child-friendly fallback button ('🗣️ Toca per dir-ho!')
   */
  public tapVoiceGateFallback(): void {
    const dialog = this.getActiveDialog();
    if (!dialog || !dialog.isVoiceGate) {
      throw new Error('Cannot tap voice gate fallback when voice gate is not active');
    }
    if (dialog.onSuccess) {
      dialog.onSuccess();
    }
  }

  /**
   * Simulates tapping a hotspot in the current scene
   */
  public tapHotspot(hotspotId: string): void {
    const scene = gameState.get().currentScene;
    const verb = gameState.get().activeVerb;

    switch (scene) {
      case 'station':
        this.interactStationHotspot(hotspotId, verb);
        break;
      case 'cabin':
        this.interactCabinHotspot(hotspotId, verb);
        break;
      case 'bridge':
        this.interactBridgeHotspot(hotspotId, verb);
        break;
      case 'castle':
        this.interactCastleHotspot(hotspotId, verb);
        break;
      case 'seaside':
        this.interactSeasideHotspot(hotspotId, verb);
        break;
    }
  }

  // --- Station Interactions ---
  private interactStationHotspot(hotspotId: string, verb: ActionVerb): void {
    const state = gameState.get();

    if (hotspotId === 'branches') {
      if (verb === 'MIRA') {
        gameState.updateFlags({ switchInspected: true });
        dialogOverlay.show({
          title: 'Via Bloquejada!',
          text: 'La via està bloquejada per branques de pi! No podem passar.'
        });
      } else if (verb === 'AGAFA') {
        gameState.updateFlags({ branchesTaken: true });
        gameState.addBadge('badge_branques');
        gameState.addItem({
          id: 'branques',
          name: 'Les Branques',
          catalanName: 'Les Branques de Pi',
          icon: '🪵',
          description: 'Branques de pi seques.',
          speechPhrase: 'Això són les branques de pi!'
        });
        dialogOverlay.show({
          title: 'Molt bé!',
          text: 'Has recollit les branques!'
        });
      }
    } else if (hotspotId === 'stationmaster') {
      if (verb === 'PARLA') {
        if (!state.voiceGatePassed) {
          dialogOverlay.show({
            speaker: "Cap d'Estació Pep",
            title: 'La Paraula Màgica',
            text: "Per activar el canvi d'agulla, digues: 'OBRE LA VIA'!",
            isVoiceGate: true,
            targetPhrase: 'Obre la via',
            targetTokens: ['obre la via', 'obre via', 'obre', 'obri la via', 'via'],
            syllables: ['O', 'bre', 'la', 'vi', 'a'],
            onSuccess: () => {
              gameState.updateFlags({ voiceGatePassed: true });
              gameState.addBadge('badge_obre_via');
              dialogOverlay.show({
                speaker: "Cap d'Estació Pep",
                title: 'Molt ben dit!',
                text: "Genial! Has dit 'Obre la via'! Ara estira la palanca!"
              });
            }
          });
        }
      }
    } else if (hotspotId === 'switch_lever') {
      if (verb === 'AGAFA' || verb === 'CONDUEIX') {
        if (!state.branchesTaken) {
          dialogOverlay.show({
            title: 'Palanca Encallada!',
            text: 'Les branques bloquegen la palanca!'
          });
          return;
        }
        if (!state.voiceGatePassed) {
          dialogOverlay.show({
            title: 'Bloqueig de Seguretat!',
            text: 'Parla amb el Cap d\'Estació Pep primer!'
          });
          return;
        }
        gameState.updateFlags({ switchOpen: true });
        dialogOverlay.show({
          title: 'Via Oberta!',
          text: 'CLAC! El semàfor està verd! Puja a la cabina amb CONDUEIX!'
        });
      }
    } else if (hotspotId === 'locomotive') {
      if (verb === 'CONDUEIX') {
        if (state.switchOpen) {
          gameState.setScene('cabin');
        } else {
          dialogOverlay.show({
            title: 'Atenció al Tren!',
            text: 'Primer hem d\'obrir la via!'
          });
        }
      }
    }
  }

  // --- Cabin Interactions ---
  private interactCabinHotspot(hotspotId: string, _verb: ActionVerb): void {
    if (hotspotId === 'whistle' || hotspotId === 'whistle_cord') {
      gameState.addBadge('badge_xiulet');
      gameState.updateFlags({ whistlePulled: true });
    } else if (hotspotId === 'firebox') {
      if (gameState.hasItem('branques')) {
        gameState.removeItem('branques');
        gameState.addBadge('badge_foc');
        gameState.updateFlags({
          branchesInFirebox: true,
          steamPressure: 100
        });
      }
    } else if (hotspotId === 'throttle_forward' || hotspotId === 'throttle') {
      gameState.updateFlags({ throttle: 80, speedKmh: 45 });
    } else if (hotspotId === 'bridge' || hotspotId === 'advance_to_bridge' || hotspotId === 'next_station_bridge') {
      gameState.setScene('bridge');
    }
  }

  public advanceCabinSimulation(dtSeconds: number): void {
    const state = gameState.get();
    if (state.currentScene !== 'cabin') return;

    const speed = (state.throttle / 100) * (state.steamPressure / 100) * 80;
    const newDist = state.distanceTraveled + speed * dtSeconds * 3;
    gameState.updateFlags({ speedKmh: speed, distanceTraveled: newDist });

    if (newDist >= 800) {
      gameState.addBadge('badge_estacio_2');
      gameState.updateFlags({ episodeCompleted: true, cabinCompleted: true });
    }
  }

  // --- Bridge Interactions ---
  private interactBridgeHotspot(hotspotId: string, verb: ActionVerb): void {
    const state = gameState.get();

    if (hotspotId === 'otter') {
      if (verb === 'PARLA' && !state.wrenchCollected) {
        dialogOverlay.show({
          speaker: 'Llúdriga Neus',
          title: "L'Aigua del Riu",
          text: "Em pots dir ben clar: 'AIGUA FRESCA'?",
          isVoiceGate: true,
          targetPhrase: 'Aigua fresca',
          targetTokens: ['aigua fresca', 'aigua', 'aigua de riu', 'fresca'],
          syllables: ['Ai', 'gua', 'fres', 'ca'],
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
              description: 'Clau anglesa per obrir la grua.',
              speechPhrase: 'Això és la clau anglesa!'
            });
            dialogOverlay.show({
              speaker: 'Llúdriga Neus',
              title: 'Aigua pura!',
              text: 'Aquí tens la clau anglesa per omplir la caldera!'
            });
          }
        });
      }
    } else if (hotspotId === 'water_crane') {
      if (verb === 'AGAFA' || verb === 'CONDUEIX') {
        if (!state.wrenchCollected) {
          dialogOverlay.show({
            title: 'Vàlvula Tancada!',
            text: 'La vàlvula necessita una clau anglesa!'
          });
        } else {
          gameState.updateFlags({
            waterCraneOperated: true,
            waterTankFilled: true
          });
          dialogOverlay.show({
            title: 'Dipòsit Ple!',
            text: 'Gorg, gorg! El dipòsit d\'aigua està ple!'
          });
        }
      }
    } else if (hotspotId === 'locomotive' || hotspotId === 'bridge') {
      if (verb === 'CONDUEIX') {
        if (state.waterTankFilled) {
          gameState.setScene('castle');
        } else {
          dialogOverlay.show({
            title: 'Falta Aigua!',
            text: 'Abans de creuar el pont, hem d\'omplir la caldera!'
          });
        }
      }
    }
  }

  // --- Castle Interactions ---
  private interactCastleHotspot(hotspotId: string, verb: ActionVerb): void {
    const state = gameState.get();

    if (hotspotId === 'inspector') {
      if (verb === 'PARLA' && !state.allAboardVoiceGatePassed) {
        dialogOverlay.show({
          speaker: 'Revisora Montserrat',
          title: 'El Gran Crida de Sortida',
          text: "Crida ben fort: 'TOTS AL TREN'!",
          isVoiceGate: true,
          targetPhrase: 'Tots al tren',
          targetTokens: ['tots al tren', 'tots al tre', 'tots', 'al tren'],
          syllables: ['Tots', 'al', 'tren'],
          onSuccess: () => {
            gameState.updateFlags({
              allAboardVoiceGatePassed: true,
              bellRung: true
            });
            gameState.addItem({
              id: 'bitllet',
              name: 'El Bitllet Daurat',
              catalanName: 'El Bitllet Daurat',
              icon: '🎟️',
              description: 'Bitllet daurat cap al mar.',
              speechPhrase: 'El bitllet daurat!'
            });
            dialogOverlay.show({
              speaker: 'Revisora Montserrat',
              title: 'Tots a bord!',
              text: 'Ding-dong! La campana de bronze ressona pel túnel!'
            });
          }
        });
      }
    } else if (hotspotId === 'bell') {
      gameState.updateFlags({ bellRung: true });
    } else if (hotspotId === 'tunnel' || hotspotId === 'locomotive') {
      if (verb === 'CONDUEIX') {
        if (state.allAboardVoiceGatePassed || state.bellRung) {
          gameState.updateFlags({ tunnelCrossed: true });
          gameState.setScene('seaside');
        } else {
          dialogOverlay.show({
            title: 'Atenció a la Sortida!',
            text: 'Fes sonar la campana i digues TOTS AL TREN!'
          });
        }
      }
    }
  }

  // --- Seaside Interactions ---
  private interactSeasideHotspot(hotspotId: string, verb: ActionVerb): void {
    const state = gameState.get();

    if (hotspotId === 'mayor') {
      if (verb === 'PARLA' && !state.grandCelebration) {
        dialogOverlay.show({
          speaker: 'Alcaldessa Eulàlia',
          title: 'La Gran Festa del Tren',
          text: "Cridem tots plegats: 'VISCA EL TREN'!",
          isVoiceGate: true,
          targetPhrase: 'Visca el tren',
          targetTokens: ['visca el tren', 'visca', 'el tren', 'visca tren'],
          syllables: ['Vis', 'ca', 'el', 'tren'],
          onSuccess: () => {
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
              description: 'Medalla d\'or del millor conductor.',
              speechPhrase: 'La medalla d\'or del Gran Maquinista!'
            });
            dialogOverlay.show({
              speaker: 'Alcaldessa Eulàlia',
              title: '🏅 El Gran Maquinista!',
              text: 'Visca el tren i el nostre petit maquinista!'
            });
          }
        });
      }
    }
  }

  // --- Automated Scene Playthrough Helpers ---
  public playScene1_Station(): void {
    this.selectVerb('AGAFA');
    this.tapHotspot('branches');
    this.dismissDialog();

    this.selectVerb('PARLA');
    this.tapHotspot('stationmaster');
    this.respondVoiceGate('Obre la via');
    this.dismissDialog();

    this.selectVerb('CONDUEIX');
    this.tapHotspot('switch_lever');
    this.dismissDialog();

    this.tapHotspot('locomotive');
  }

  public playScene2_Cabin(): void {
    this.tapHotspot('whistle');
    this.tapHotspot('firebox');
    this.tapHotspot('throttle_forward');
    this.advanceCabinSimulation(30);
  }

  public playScene3_Bridge(): void {
    this.selectVerb('PARLA');
    this.tapHotspot('otter');
    this.respondVoiceGate('Aigua fresca');
    this.dismissDialog();

    this.selectVerb('CONDUEIX');
    this.tapHotspot('water_crane');
    this.dismissDialog();

    this.tapHotspot('locomotive');
  }

  public playScene4_Castle(): void {
    this.selectVerb('PARLA');
    this.tapHotspot('inspector');
    this.respondVoiceGate('Tots al tren');
    this.dismissDialog();

    this.tapHotspot('bell');

    this.selectVerb('CONDUEIX');
    this.tapHotspot('tunnel');
  }

  public playScene5_Seaside(): void {
    this.selectVerb('PARLA');
    this.tapHotspot('mayor');
    this.respondVoiceGate('Visca el tren');
    this.dismissDialog();
  }
}
