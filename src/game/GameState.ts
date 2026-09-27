/**
 * GameState: Reactive state store for puzzles, inventory, and scene transitions
 */

export type ActionVerb = 'MIRA' | 'AGAFA' | 'PARLA' | 'CONDUEIX';
export type SceneId = 'station' | 'cabin';

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

  // Station Scene Puzzle Flags
  switchInspected: boolean;
  branchesTaken: boolean;
  stationmasterSpoken: boolean;
  voiceGatePassed: boolean;
  switchOpen: boolean;

  // Cabin Scene Simulation State
  branchesInFirebox: boolean;
  coalShoveled: number;
  steamPressure: number; // 0 to 100%
  throttle: number;      // 0 to 100%
  speedKmh: number;      // calculated from throttle and steam
  whistlePulled: boolean;
  distanceTraveled: number; // 0 to 1000m
  episodeCompleted: boolean;
}

export type StateListener = (state: GameStateData) => void;

export class GameState {
  private state: GameStateData;
  private listeners: Set<StateListener> = new Set();

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): GameStateData {
    return {
      currentScene: 'station',
      activeVerb: 'MIRA',
      inventory: [],
      selectedItemId: null,

      switchInspected: false,
      branchesTaken: false,
      stationmasterSpoken: false,
      voiceGatePassed: false,
      switchOpen: false,

      branchesInFirebox: false,
      coalShoveled: 0,
      steamPressure: 50, // default warm boiler
      throttle: 0,
      speedKmh: 0,
      whistlePulled: false,
      distanceTraveled: 0,
      episodeCompleted: false
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
      this.state.selectedItemId = null; // deselect item when switching verb
      this.notify();
    }
  }

  public setScene(scene: SceneId): void {
    if (this.state.currentScene !== scene) {
      this.state.currentScene = scene;
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
