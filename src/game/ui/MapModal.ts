/**
 * MapModal: "El Mapa Ferroviari de Catalunya"
 * Tactile vintage railway map allowing child & parent to fast-travel
 * between unlocked stations anytime.
 */

import { gameState, SceneId } from '../GameState';
import { soundFX } from '../../engine/SoundFX';
import { speechManager } from '../../engine/SpeechManager';
import { particleSystem } from '../../engine/ParticleSystem';

export class MapModal {
  private element: HTMLElement | null = null;

  constructor() {
    this.createDom();
  }

  private createDom(): void {
    if (typeof document === 'undefined') return;

    this.element = document.createElement('div');
    this.element.id = 'map-modal';
    this.element.className = 'modal hidden';
    this.element.innerHTML = `
      <div class="modal-content map-card">
        <div class="modal-header map-header">
          <div class="map-title-wrap">
            <span class="map-header-icon">🗺️</span>
            <div>
              <h2>Mapa Ferroviari de Catalunya</h2>
              <span class="map-subtitle">Tria l'estació on vols viatjar amb El Drac</span>
            </div>
          </div>
          <button id="map-close" class="modal-close" aria-label="Tanca">✕</button>
        </div>

        <div id="map-body" class="map-body">
          <!-- Populated dynamically -->
        </div>
      </div>
    `;

    document.body.appendChild(this.element);

    const closeBtn = this.element.querySelector('#map-close');
    closeBtn?.addEventListener('click', () => this.hide());

    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) this.hide();
    });
  }

  public show(): void {
    if (!this.element) return;
    soundFX.playClick();
    this.renderMap();
    this.element.classList.remove('hidden');
  }

  public hide(): void {
    if (!this.element) return;
    soundFX.playClick();
    this.element.classList.add('hidden');
  }

  public isOpen(): boolean {
    return !!this.element && !this.element.classList.contains('hidden');
  }

  private renderMap(): void {
    if (!this.element) return;
    const body = this.element.querySelector('#map-body');
    if (!body) return;

    const state = gameState.get();

    const stations: {
      id: SceneId;
      name: string;
      subtitle: string;
      icon: string;
      km: string;
      desc: string;
    }[] = [
      {
        id: 'station',
        name: "L'Estació dels Pins",
        subtitle: 'Bosc i Muntanya',
        icon: '🌲',
        km: 'Km 0',
        desc: "El punt de partida. Parla amb el Cap d'Estació Pep i neteja la via!"
      },
      {
        id: 'cabin',
        name: 'La Cabina del Tren',
        icon: '🕹️',
        subtitle: 'El Drac a tota marxa',
        km: 'Km 2.5',
        desc: 'Condueix la locomotora, alimenta la caldera i fes sonar el xiulet!'
      },
      {
        id: 'bridge',
        name: "El Pont del Riu d'Or",
        icon: '🌉',
        subtitle: "Viaducte d'Aigua",
        km: 'Km 5.0',
        desc: 'Coneix la llúdriga Neus i fes servir la grua per omplir el dipòsit.'
      },
      {
        id: 'castle',
        name: 'El Castell de la Roca',
        icon: '🏰',
        subtitle: 'Túnel de Pedra',
        km: 'Km 7.5',
        desc: 'Fes sonar la campana de bronze i crida: Tots al tren!'
      },
      {
        id: 'seaside',
        name: 'La Vall Verda i el Mar',
        icon: '🌊',
        subtitle: 'Terminus Mediterrani',
        km: 'Km 10.0',
        desc: "Arribada triomfal a la platja, festa d'estiu i Medalla d'Honor!"
      }
    ];

    body.innerHTML = `
      <div class="railway-route-container">
        <!-- Connecting Railway Track Line -->
        <div class="route-track-line"></div>

        <div class="station-stops-list">
          ${stations
            .map((s, index) => {
              const isUnlocked = state.unlockedScenes.includes(s.id);
              const isCurrent = state.currentScene === s.id;

              return `
              <div class="station-stop-item ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}">
                <div class="stop-node">
                  <span class="stop-km-badge">${s.km}</span>
                  <div class="stop-pin ${isCurrent ? 'pulse-pin' : ''}">
                    ${isUnlocked ? s.icon : '🔒'}
                  </div>
                </div>

                <div class="stop-details">
                  <div class="stop-header-row">
                    <strong class="stop-name">${s.name}</strong>
                    ${isCurrent ? '<span class="current-tag">Estàs aquí 📍</span>' : ''}
                  </div>
                  <span class="stop-subtitle">${s.subtitle}</span>
                  <p class="stop-desc">${s.desc}</p>

                  <div class="stop-action-row">
                    ${
                      isUnlocked
                        ? `<button class="btn-travel ${isCurrent ? 'btn-travel-active' : ''}" data-scene="${s.id}">
                            ${isCurrent ? 'Ja hi ets 🚂' : 'Viatja aquí ➔'}
                          </button>`
                        : `<span class="locked-note">Bloquejat: avança en la història</span>`
                    }
                  </div>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>
    `;

    // Attach click events to travel buttons
    const travelBtns = body.querySelectorAll('.btn-travel:not(.btn-travel-active)');
    travelBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetScene = (btn as HTMLElement).dataset.scene as SceneId;
        if (targetScene) {
          this.travelTo(targetScene);
        }
      });
    });
  }

  private travelTo(sceneId: SceneId): void {
    soundFX.playWhistle();
    soundFX.playChuff(1.2);
    particleSystem.emitSparkles(320, 180, 16);

    const stationNames: Record<SceneId, string> = {
      station: "L'Estació dels Pins",
      cabin: 'La Cabina del Maquinista',
      bridge: "El Pont del Riu d'Or",
      castle: 'El Castell de la Roca',
      seaside: 'La Vall Verda i el Mar'
    };

    speechManager.speak(`Rumb cap a ${stationNames[sceneId]}! Tots al tren!`);

    this.hide();

    setTimeout(() => {
      gameState.setScene(sceneId);
    }, 400);
  }
}

export const mapModal = new MapModal();
