/**
 * El Conductor de Paraules: Main Entry Point & Game Loop
 */

import { CanvasRenderer } from './engine/CanvasRenderer';
import { SceneManager } from './game/SceneManager';
import { InputManager } from './engine/InputManager';
import { soundFX } from './engine/SoundFX';
import { gameState } from './game/GameState';
import { assetManager } from './engine/AssetManager';
import { passportModal } from './game/ui/PassportModal';
import { mapModal } from './game/ui/MapModal';
import { trackBuilderModal } from './game/ui/TrackBuilderModal';
import { weatherSystem } from './engine/WeatherSystem';

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
    this.setupStateSubscriptions();
    this.startLoop();
  }

  private setupStateSubscriptions(): void {
    const badge = document.querySelector('.badge-episode');
    if (!badge) return;

    const titles: Record<string, string> = {
      station: "Episodi 1: L'Estació dels Pins",
      cabin: 'Episodi 2: La Cabina del Maquinista',
      bridge: "Episodi 3: El Pont del Riu d'Or",
      castle: 'Episodi 4: El Castell de la Roca',
      seaside: 'Episodi 5: La Vall Verda i el Mar'
    };

    gameState.subscribe((state) => {
      badge.textContent = titles[state.currentScene] || "Aventura de Tren";
    });
  }

  private setupUIControls(): void {
    // Passport Modal Button
    const passportBtn = document.getElementById('btn-passport');
    if (passportBtn) {
      passportBtn.addEventListener('click', () => {
        soundFX.init();
        passportModal.show();
      });
    }

    // Railway Map Modal Button
    const mapBtn = document.getElementById('btn-map');
    if (mapBtn) {
      mapBtn.addEventListener('click', () => {
        soundFX.init();
        mapModal.show();
      });
    }

    // Track Builder Toy Modal Button
    const builderBtn = document.getElementById('btn-builder');
    if (builderBtn) {
      builderBtn.addEventListener('click', () => {
        soundFX.init();
        trackBuilderModal.show();
      });
    }

    // Weather Atmosphere Toggle Button
    const weatherBtn = document.getElementById('btn-weather');
    if (weatherBtn) {
      const updateWeatherBtn = (w: string) => {
        const labels: Record<string, string> = {
          sol: '☀️ Sol',
          capvespre: '🌅 Capvespre',
          nit: '🌙 Nit',
          pluja: '🌧️ Pluja'
        };
        weatherBtn.textContent = labels[w] || '🌤️ Temps';
      };

      gameState.subscribe((state) => {
        updateWeatherBtn(state.weather || 'sol');
      });

      weatherBtn.addEventListener('click', () => {
        soundFX.init();
        weatherSystem.cycle();
      });
    }

    // Cozy Ambient Music Toggle
    const musicBtn = document.getElementById('btn-music');
    if (musicBtn) {
      musicBtn.addEventListener('click', () => {
        soundFX.init();
        const isOn = soundFX.toggleMusic();
        musicBtn.textContent = isOn ? '🎵 Música ON' : '🎵 Música';
        musicBtn.style.borderColor = isOn ? '#f59e0b' : '#64748b';
      });
    }

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

    // Modern Pixel Art Gallery Modal
    const artGalleryBtn = document.getElementById('btn-art-gallery');
    const galleryModal = document.getElementById('gallery-modal');
    const closeGalleryModal = document.getElementById('close-gallery-modal');

    if (artGalleryBtn && galleryModal && closeGalleryModal) {
      artGalleryBtn.addEventListener('click', () => {
        soundFX.init();
        soundFX.playClick();

        // Ensure all gallery modal images use inlined high-res data URLs
        const galleryImages = galleryModal.querySelectorAll<HTMLImageElement>('.gallery-card img');
        if (galleryImages.length >= 6) {
          galleryImages[0].src = assetManager.getArtSource('station');
          galleryImages[1].src = assetManager.getArtSource('cabin');
          galleryImages[2].src = assetManager.getArtSource('bridge');
          galleryImages[3].src = assetManager.getArtSource('castle');
          galleryImages[4].src = assetManager.getArtSource('seaside');
          galleryImages[5].src = assetManager.getArtSource('items');
        }

        galleryModal.classList.remove('hidden');
      });
      closeGalleryModal.addEventListener('click', () => {
        soundFX.playClick();
        galleryModal.classList.add('hidden');
      });
      galleryModal.addEventListener('click', (e) => {
        if (e.target === galleryModal) {
          galleryModal.classList.add('hidden');
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

// Boot application reliably whether DOM is loading or already interactive/complete
function bootApp(): void {
  try {
    if ((window as any).__WORD_CONDUCTOR_BOOTED__) return;
    (window as any).__WORD_CONDUCTOR_BOOTED__ = true;
    console.log('[WordConductor] Booting El Conductor de Paraules...');
    new App();
  } catch (err) {
    console.error('[WordConductor] Fatal error bootstrapping game:', err);
    const container = document.getElementById('canvas-container');
    if (container) {
      container.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#f8fafc; font-family:'Fredoka', sans-serif; text-align:center; padding:20px;">
          <div style="font-size:3rem; margin-bottom:12px;">🚂</div>
          <h2 style="color:#f59e0b; font-size:1.5rem; margin-bottom:8px;">El Conductor de Paraules</h2>
          <p style="margin-bottom:16px; color:#cbd5e1; max-width:400px; line-height:1.4;">S'ha produït un petit problema en carregar el joc. Fes clic al botó per tornar-ho a provar.</p>
          <button onclick="window.location.reload()" style="background:#16a34a; border:2px solid #4ade80; color:white; font-size:1.1rem; font-weight:bold; padding:12px 24px; border-radius:12px; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.4);">
            🔄 Torna a carregar
          </button>
        </div>
      `;
    }
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootApp);
} else {
  // DOM is already ready
  bootApp();
}
