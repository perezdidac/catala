/**
 * SceneManager: Handles scene switching, updates, rendering, and event routing for all 5 scenes
 */

import { SceneId, gameState } from './GameState';
import { StationScene } from './scenes/StationScene';
import { CabinScene } from './scenes/CabinScene';
import { BridgeScene } from './scenes/BridgeScene';
import { CastleScene } from './scenes/CastleScene';
import { SeasideScene } from './scenes/SeasideScene';
import { VerbBar } from './ui/VerbBar';
import { InventoryBar } from './ui/InventoryBar';
import { dialogOverlay } from './ui/DialogOverlay';

export interface IScene {
  enter: () => void;
  update: (dt: number) => void;
  render: (ctx: CanvasRenderingContext2D) => void;
  handlePointerMove: (vx: number, vy: number) => boolean;
  handlePointerDown: (vx: number, vy: number) => boolean;
  handlePointerUp?: () => void;
}

export class SceneManager {
  private scenes: Record<SceneId, IScene>;
  private verbBar: VerbBar;
  private inventoryBar: InventoryBar;
  private currentSceneId: SceneId = 'station';

  constructor() {
    this.scenes = {
      station: new StationScene(),
      cabin: new CabinScene(),
      bridge: new BridgeScene(),
      castle: new CastleScene(),
      seaside: new SeasideScene()
    };

    this.verbBar = new VerbBar();
    this.inventoryBar = new InventoryBar();

    // Subscribe to scene changes from GameState
    gameState.subscribe((state) => {
      if (state.currentScene !== this.currentSceneId) {
        this.currentSceneId = state.currentScene;
        this.getActiveScene().enter();
      }
    });

    this.getActiveScene().enter();
  }

  public getActiveScene(): IScene {
    return this.scenes[this.currentSceneId] || this.scenes.station;
  }

  public update(dt: number): void {
    this.getActiveScene().update(dt);
  }

  public render(ctx: CanvasRenderingContext2D, time: number): void {
    // 1. Render active game scene
    this.getActiveScene().render(ctx);

    // 2. Render UI bars
    if (this.currentSceneId === 'cabin') {
      // In Cabin view, render inventory shelf so child can use fuel items
      this.inventoryBar.render(ctx, time);
    } else {
      // In story stations, render both VerbBar and InventoryBar
      this.verbBar.render(ctx, time);
      this.inventoryBar.render(ctx, time);
    }

    // 3. Render Modal Dialog Overlay on top
    if (dialogOverlay.isOpen()) {
      dialogOverlay.render(ctx, time);
    }
  }

  public handlePointerMove(vx: number, vy: number): void {
    if (dialogOverlay.isOpen()) {
      return;
    }

    // Check UI first
    if (this.currentSceneId !== 'cabin') {
      if (this.verbBar.handlePointerMove(vx, vy)) return;
      if (this.inventoryBar.handlePointerMove(vx, vy)) return;
    } else {
      if (this.inventoryBar.handlePointerMove(vx, vy)) return;
    }

    // Forward to active scene
    this.getActiveScene().handlePointerMove(vx, vy);
  }

  public handlePointerDown(vx: number, vy: number): void {
    // Modal dialog absorbs clicks first
    if (dialogOverlay.isOpen()) {
      dialogOverlay.handlePointerDown(vx, vy);
      return;
    }

    // Check UI bars
    if (this.currentSceneId !== 'cabin') {
      if (this.verbBar.handlePointerDown(vx, vy)) return;
      if (this.inventoryBar.handlePointerDown(vx, vy)) return;
    } else {
      if (this.inventoryBar.handlePointerDown(vx, vy)) return;
    }

    // Forward to scene
    this.getActiveScene().handlePointerDown(vx, vy);
  }

  public handlePointerUp(): void {
    const scene = this.getActiveScene();
    if (scene.handlePointerUp) {
      scene.handlePointerUp();
    }
  }
}
