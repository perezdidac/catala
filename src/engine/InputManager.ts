/**
 * InputManager: Touch and Mouse event translation, audio unlocking, and gesture handling
 */

import { CanvasRenderer } from './CanvasRenderer';
import { SceneManager } from '../game/SceneManager';
import { soundFX } from './SoundFX';
import { gameState } from '../game/GameState';

export class InputManager {
  private canvasRenderer: CanvasRenderer;
  private sceneManager: SceneManager;
  private isPointerDown: boolean = false;

  constructor(canvasRenderer: CanvasRenderer, sceneManager: SceneManager) {
    this.canvasRenderer = canvasRenderer;
    this.sceneManager = sceneManager;
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const canvas = this.canvasRenderer.getScreenCanvas();

    // Mouse / Pointer Down
    canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      // Unlock Web Audio context on first user interaction
      soundFX.init();

      this.isPointerDown = true;
      const { x, y } = this.canvasRenderer.screenToVirtual(e.clientX, e.clientY);
      this.sceneManager.handlePointerDown(x, y);
    });

    // Pointer Move
    window.addEventListener('pointermove', (e: PointerEvent) => {
      const { x, y } = this.canvasRenderer.screenToVirtual(e.clientX, e.clientY);
      this.sceneManager.handlePointerMove(x, y);
    });

    // Pointer Up
    window.addEventListener('pointerup', (_e: PointerEvent) => {
      this.isPointerDown = false;
      this.sceneManager.handlePointerUp();
    });

    canvas.addEventListener('pointercancel', () => {
      this.isPointerDown = false;
      this.sceneManager.handlePointerUp();
    });

    // Prevent default context menu on right click / long press
    canvas.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
    });

    // Keyboard Shortcuts for easy desktop play / accessibility
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      soundFX.init();
      switch (e.key) {
        case '1':
          gameState.setVerb('MIRA');
          break;
        case '2':
          gameState.setVerb('AGAFA');
          break;
        case '3':
          gameState.setVerb('PARLA');
          break;
        case '4':
          gameState.setVerb('CONDUEIX');
          break;
        case ' ':
          // Spacebar blows the train whistle!
          soundFX.playWhistle();
          break;
      }
    });
  }
}
