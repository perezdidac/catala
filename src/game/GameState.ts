/**
 * GameState: Reactive state store for puzzles, inventory, and multi-scene transitions
 * Supports 5 interconnected chapters across the Catalan railway journey.
 */

export type ActionVerb = 'MIRA' | 'AGAFA' | 'PARLA' | 'CONDUEIX';
export type SceneId = 'station' | 'cabin' | 'bridge' | 'castle' | 'seaside';

export interface InventoryItem {
  id: string;
  name: string;
  catalanName: string;
  icon: string;
  description: string;
  speechPhrase: string;
}

export interface GameStateData {
  currentScene: SceneId;
  activeVerb: ActionVerb;
  inventory: InventoryItem[];
  selectedItemId: string | null;
  unlockedScenes: SceneId[];

  // Scene 1: L'Estació dels Pins
  switchInspected: boolean;
  branchesTaken: boolean;
  stationmasterSpoken: boolean;
  voiceGatePassed: boolean;
  switchOpen: boolean;

  // Scene 2: La Cabina del Maquinista
  branchesInFirebox: boolean;
  coalShoveled: number;
  steamPressure: number; // 0 to 100%
  throttle: number;      // 0 to 100%
  speedKmh: number;      // calculated from throttle and steam
  whistlePulled: boolean;
  distanceTraveled: number; // 0 to 1000m
  cabinCompleted: boolean;
  episodeCompleted: boolean;

  // Scene 3: El Pont del Riu d'Or
  waterCraneInspected: boolean;
  otterSpoken: boolean;
  waterVoiceGatePassed: boolean;
  wrenchCollected: boolean;
  waterCraneOperated: boolean;
  waterTankFilled: boolean;

  // Scene 4: El Castell de la Roca
  ticketInspected: boolean;
  inspectorSpoken: boolean;
  allAboardVoiceGatePassed: boolean;
  bellRung: boolean;
  tunnelCrossed: boolean;

  // Scene 5: La Vall Verda i el Mar
  mayorSpoken: boolean;
  celebrationVoiceGatePassed: boolean;
  medalAwarded: boolean;
  grandCelebration: boolean;
}

export type StateListener = (state: GameStateData) => void;

export class GameState {
  private state: GameStateData;
  private listeners: Set<StateListener> = new Set();

  constructor() {
    this.state = this.getInitialState();
  }

  public getInitialState(): GameStateData {
    return {
      currentScene: 'station',
      activeVerb: 'MIRA',
      inventory: [],
      selectedItemId: null,
      unlockedScenes: ['station'],

      // Scene 1
      switchInspected: false,
      branchesTaken: false,
      stationmasterSpoken: false,
      voiceGatePassed: false,
      switchOpen: false,

      // Scene 2
      branchesInFirebox: false,
      coalShoveled: 0,
      steamPressure: 50,
      throttle: 0,
      speedKmh: 0,
      whistlePulled: false,
      distanceTraveled: 0,
      cabinCompleted: false,
      episodeCompleted: false,

      // Scene 3
      waterCraneInspected: false,
      otterSpoken: false,
      waterVoiceGatePassed: false,
      wrenchCollected: false,
      waterCraneOperated: false,
      waterTankFilled: false,

      // Scene 4
      ticketInspected: false,
      inspectorSpoken: false,
      allAboardVoiceGatePassed: false,
      bellRung: false,
      tunnelCrossed: false,

      // Scene 5
      mayorSpoken: false,
      celebrationVoiceGatePassed: false,
      medalAwarded: false,
      grandCelebration: false
    };
  }

  public get(): GameStateData {
    return this.state;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  public setVerb(verb: ActionVerb): void {
    if (this.state.activeVerb !== verb) {
      this.state.activeVerb = verb;
      this.state.selectedItemId = null;
      this.notify();
    }
  }

  public setScene(scene: SceneId): void {
    if (this.state.currentScene !== scene) {
      this.state.currentScene = scene;
      if (!this.state.unlockedScenes.includes(scene)) {
        this.state.unlockedScenes = [...this.state.unlockedScenes, scene];
      }
      this.notify();
    }
  }

  public addItem(item: InventoryItem): void {
    if (!this.state.inventory.some((i) => i.id === item.id)) {
      this.state.inventory = [...this.state.inventory, item];
      this.notify();
    }
  }

  public removeItem(itemId: string): void {
    this.state.inventory = this.state.inventory.filter((i) => i.id !== itemId);
    if (this.state.selectedItemId === itemId) {
      this.state.selectedItemId = null;
    }
    this.notify();
  }

  public hasItem(itemId: string): boolean {
    return this.state.inventory.some((i) => i.id === itemId);
  }

  public selectItem(itemId: string | null): void {
    this.state.selectedItemId = this.state.selectedItemId === itemId ? null : itemId;
    this.notify();
  }

  public updateFlags(partial: Partial<GameStateData>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  public reset(): void {
    this.state = this.getInitialState();
    this.notify();
  }
}

export const gameState = new GameState();
