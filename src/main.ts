/**
 * El Conductor de Paraules: Main Entry Point & Game Loop
 */

import { CanvasRenderer } from './engine/CanvasRenderer';
import { SceneManager } from './game/SceneManager';
import { InputManager } from './engine/InputManager';
import { soundFX } from './engine/SoundFX';
import { gameState } from './game/GameState';

class App {
  private renderer: CanvasRenderer;
  private sceneManager: SceneManager;
  private inputManager: InputManager;

  private lastTime: number = 0;
  private totalTime: number = 0;

  constructor() {
    const container = document.getElementById('canvas-container');
    if (!container) throw new Error('Canvas container not found');

    this.renderer = new CanvasRenderer(container);
    this.sceneManager = new SceneManager();
    this.inputManager = new InputManager(this.renderer, this.sceneManager);

    this.setupUIControls();
    this.startLoop();
  }

  private setupUIControls(): void {
    // Sound Mute Toggle
    const soundBtn = document.getElementById('btn-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        soundFX.init();
        const isMuted = soundFX.getMuted();
        soundFX.setMuted(!isMuted);
        soundBtn.textContent = !isMuted ? '🔇' : '🔊';
        soundBtn.setAttribute('title', !isMuted ? 'Activa el so' : 'Silencia el so');
      });
    }

    // Fullscreen Toggle
    const fsBtn = document.getElementById('btn-fullscreen');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
          fsBtn.textContent = '🗗';
        } else {
          document.exitFullscreen().catch(() => {});
          fsBtn.textContent = '⛶';
        }
      });
    }

    // Parent Guide Modal
    const parentGuideBtn = document.getElementById('btn-parent-guide');
    const parentModal = document.getElementById('parent-modal');
    const closeParentModal = document.getElementById('close-parent-modal');

    if (parentGuideBtn && parentModal && closeParentModal) {
      parentGuideBtn.addEventListener('click', () => {
        parentModal.classList.remove('hidden');
      });
      closeParentModal.addEventListener('click', () => {
        parentModal.classList.add('hidden');
      });
      parentModal.addEventListener('click', (e) => {
        if (e.target === parentModal) {
          parentModal.classList.add('hidden');
        }
      });
    }

    // Reset Game button
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        soundFX.init();
        soundFX.playClick();
        if (confirm("Vols reiniciar l'aventura des del principi?")) {
          gameState.reset();
        }
      });
    }
  }

  private startLoop(): void {
    const loop = (currentTimeMs: number) => {
      if (!this.lastTime) this.lastTime = currentTimeMs;
      const dt = Math.min(0.1, (currentTimeMs - this.lastTime) / 1000);
      this.lastTime = currentTimeMs;
      this.totalTime += dt;

      // Update active scene & simulations
      this.sceneManager.update(dt);

      // Render to 640x360 offscreen buffer
      this.renderer.clear('#101827');
      this.sceneManager.render(this.renderer.ctx, this.totalTime);

      // Blit to screen with pixelated letterboxing
      this.renderer.renderToScreen();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

// Boot application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
