/**
 * SceneManager: Handles scene switching, updates, rendering, and event routing
 */

import { SceneId, gameState } from './GameState';
import { StationScene } from './scenes/StationScene';
import { CabinScene } from './scenes/CabinScene';
import { VerbBar } from './ui/VerbBar';
import { InventoryBar } from './ui/InventoryBar';
import { dialogOverlay } from './ui/DialogOverlay';

export class SceneManager {
  private stationScene: StationScene;
  private cabinScene: CabinScene;
  private verbBar: VerbBar;
  private inventoryBar: InventoryBar;
  private currentSceneId: SceneId = 'station';

  constructor() {
    this.stationScene = new StationScene();
    this.cabinScene = new CabinScene();
    this.verbBar = new VerbBar();
    this.inventoryBar = new InventoryBar();

    // Subscribe to scene changes from GameState
    gameState.subscribe((state) => {
      if (state.currentScene !== this.currentSceneId) {
        this.currentSceneId = state.currentScene;
        this.getActiveScene().enter();
      }
    });

    this.stationScene.enter();
  }

  public getActiveScene(): StationScene | CabinScene {
    return this.currentSceneId === 'station' ? this.stationScene : this.cabinScene;
  }

  public update(dt: number): void {
    this.getActiveScene().update(dt);
  }

  public render(ctx: CanvasRenderingContext2D, time: number): void {
    // 1. Render active game scene (Station or Cabin)
    this.getActiveScene().render(ctx);

    // 2. Render bottom UI bar only in Station scene, or when relevant
    if (this.currentSceneId === 'station') {
      this.verbBar.render(ctx, time);
      this.inventoryBar.render(ctx, time);
    } else {
      // In Cabin scene, show inventory bar so child can feed wood to firebox
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
    if (this.currentSceneId === 'station') {
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
    if (this.currentSceneId === 'station') {
      if (this.verbBar.handlePointerDown(vx, vy)) return;
      if (this.inventoryBar.handlePointerDown(vx, vy)) return;
    } else {
      if (this.inventoryBar.handlePointerDown(vx, vy)) return;
    }

    // Forward to scene
    this.getActiveScene().handlePointerDown(vx, vy);
  }

  public handlePointerUp(): void {
    if (this.currentSceneId === 'cabin') {
      this.cabinScene.handlePointerUp();
    }
  }
}
