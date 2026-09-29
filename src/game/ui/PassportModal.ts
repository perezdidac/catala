/**
 * PassportModal: "El Passaport de Maquinista"
 * Tactile child-friendly collectible passport with customizable avatar,
 * station ink stamps, Catalan vocabulary soundboard, and parent co-op tips.
 */

import { gameState } from '../GameState';
import { speechManager } from '../../engine/SpeechManager';
import { soundFX } from '../../engine/SoundFX';
import { particleSystem } from '../../engine/ParticleSystem';
import { VOCABULARY_LIST } from '../../data/catalanVocabulary';

export class PassportModal {
  private element: HTMLElement | null = null;
  private activeTab: 'license' | 'stamps' | 'vocab' | 'diploma' | 'song' | 'parent' = 'license';
  private stopSongCallback: (() => void) | null = null;

  constructor() {
    this.createDom();
  }

  private createDom(): void {
    if (typeof document === 'undefined') return;

    this.element = document.createElement('div');
    this.element.id = 'passport-modal';
    this.element.className = 'modal hidden';
    this.element.innerHTML = `
      <div class="modal-content passport-card">
        <div class="modal-header passport-header">
          <div class="passport-title-wrap">
            <span class="passport-seal">🎖️</span>
            <div>
              <h2>Passaport de Maquinista</h2>
              <span class="passport-subtitle">Ferrocarrils de Catalunya • Aventura de Paraules</span>
            </div>
          </div>
          <button id="passport-close" class="modal-close" aria-label="Tanca">✕</button>
        </div>

        <!-- Navigation Tabs -->
        <div class="passport-tabs">
          <button class="passport-tab active" data-tab="license">🎫 Llicència</button>
          <button class="passport-tab" data-tab="stamps">💮 Segells</button>
          <button class="passport-tab" data-tab="vocab">🗣️ Paraules</button>
          <button class="passport-tab" data-tab="diploma">🏅 Diploma</button>
          <button class="passport-tab" data-tab="song">🎶 Cançó</button>
          <button class="passport-tab" data-tab="parent">👨‍👩‍👧 En Família</button>
        </div>

        <!-- Tab Body -->
        <div id="passport-body" class="passport-body">
          <!-- Populated dynamically -->
        </div>
      </div>
    `;

    document.body.appendChild(this.element);

    // Event listeners
    const closeBtn = this.element.querySelector('#passport-close');
    closeBtn?.addEventListener('click', () => this.hide());

    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) this.hide();
    });

    const tabs = this.element.querySelectorAll('.passport-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabKey = (tab as HTMLElement).dataset.tab as
          | 'license'
          | 'stamps'
          | 'vocab'
          | 'diploma'
          | 'song'
          | 'parent';
        this.switchTab(tabKey);
      });
    });
  }

  public show(): void {
    if (!this.element) return;
    soundFX.playPickup();
    this.renderActiveTab();
    this.element.classList.remove('hidden');
  }

  public hide(): void {
    if (!this.element) return;
    if (this.stopSongCallback) {
      this.stopSongCallback();
      this.stopSongCallback = null;
    }
    soundFX.playClick();
    this.element.classList.add('hidden');
  }

  public isOpen(): boolean {
    return !!this.element && !this.element.classList.contains('hidden');
  }

  private switchTab(tab: 'license' | 'stamps' | 'vocab' | 'diploma' | 'song' | 'parent'): void {
    if (this.stopSongCallback) {
      this.stopSongCallback();
      this.stopSongCallback = null;
    }
    soundFX.playClick();
    this.activeTab = tab;

    if (!this.element) return;
    const tabs = this.element.querySelectorAll('.passport-tab');
    tabs.forEach((t) => {
      t.classList.toggle('active', (t as HTMLElement).dataset.tab === tab);
    });

    this.renderActiveTab();
  }

  private renderActiveTab(): void {
    if (!this.element) return;
    const body = this.element.querySelector('#passport-body');
    if (!body) return;

    const state = gameState.get();

    if (this.activeTab === 'license') {
      body.innerHTML = this.renderLicenseTab(state);
      this.attachLicenseEvents(body);
    } else if (this.activeTab === 'stamps') {
      body.innerHTML = this.renderStampsTab(state);
    } else if (this.activeTab === 'vocab') {
      body.innerHTML = this.renderVocabTab(state);
      this.attachVocabEvents(body);
    } else if (this.activeTab === 'diploma') {
      body.innerHTML = this.renderDiplomaTab(state);
      this.attachDiplomaEvents(body);
    } else if (this.activeTab === 'song') {
      body.innerHTML = this.renderSongTab(state);
      this.attachSongEvents(body);
    } else if (this.activeTab === 'parent') {
      body.innerHTML = this.renderParentTab(state);
    }
  }

  private renderLicenseTab(state: any): string {
    const avatars = [
      { id: 'conductor_boy', label: 'Noi', icon: '👦' },
      { id: 'conductor_girl', label: 'Noia', icon: '👧' },
      { id: 'conductor_bear', label: 'Ós', icon: '🐻' },
      { id: 'conductor_cat', label: 'Gat', icon: '🐱' },
      { id: 'conductor_dragon', label: 'Drac', icon: '🐉' },
    ];

    const currentAvatar = avatars.find((a) => a.id === state.avatarId) || avatars[0];

    return `
      <div class="license-container">
        <div class="license-card">
          <div class="license-photo-section">
            <div class="license-photo-frame">
              <span class="avatar-large">${currentAvatar.icon}</span>
            </div>
            <span class="license-badge">OFICIAL</span>
          </div>
          <div class="license-info-section">
            <div class="info-row">
              <span class="info-label">Títol Oficial:</span>
              <strong class="info-value">Maquinista de Vapor</strong>
            </div>
            <div class="info-row">
              <span class="info-label">Tren assignat:</span>
              <span class="info-value">Locomotora "El Drac"</span>
            </div>
            <div class="info-row">
              <span class="info-label">Línia:</span>
              <span class="info-value">Dels Pins al Mar Blau</span>
            </div>
            <div class="info-row">
              <span class="info-label">Idioma:</span>
              <span class="info-value highlight">Català (Nivell Estel·lar)</span>
            </div>
          </div>
        </div>

        <div class="avatar-picker-section">
          <h3>Tria el teu avatar de maquinista:</h3>
          <div class="avatar-choices">
            ${avatars
              .map(
                (a) => `
              <button class="btn-avatar-choice ${a.id === state.avatarId ? 'selected' : ''}" data-avatar="${a.id}">
                <span class="choice-icon">${a.icon}</span>
                <span class="choice-label">${a.label}</span>
              </button>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  private attachLicenseEvents(container: Element): void {
    const btns = container.querySelectorAll('.btn-avatar-choice');
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.avatar;
        if (id) {
          soundFX.playClick();
          gameState.setAvatar(id);
          particleSystem.emitSparkles(250, 180, 10);
          this.renderActiveTab();
        }
      });
    });
  }

  private renderStampsTab(state: any): string {
    const stations = [
      {
        id: 'station',
        name: "L'Estació dels Pins",
        icon: '🌲',
        date: 'Km 0',
        unlocked: state.unlockedScenes.includes('station'),
        motto: 'Obre la via!'
      },
      {
        id: 'cabin',
        name: 'La Cabina del Tren',
        icon: '🕹️',
        date: 'Km 2.5',
        unlocked: state.unlockedScenes.includes('cabin'),
        motto: 'Foc i Vapor!'
      },
      {
        id: 'bridge',
        name: "El Pont del Riu d'Or",
        icon: '🌉',
        date: 'Km 5.0',
        unlocked: state.unlockedScenes.includes('bridge'),
        motto: 'Aigua fresca!'
      },
      {
        id: 'castle',
        name: 'El Castell de la Roca',
        icon: '🏰',
        date: 'Km 7.5',
        unlocked: state.unlockedScenes.includes('castle'),
        motto: 'Tots al tren!'
      },
      {
        id: 'seaside',
        name: 'La Vall Verda i el Mar',
        icon: '🌊',
        date: 'Km 10.0',
        unlocked: state.unlockedScenes.includes('seaside'),
        motto: 'Visca el tren!'
      }
    ];

    return `
      <div class="stamps-grid">
        ${stations
          .map(
            (s) => `
          <div class="station-stamp ${s.unlocked ? 'stamped' : 'locked'}">
            <div class="stamp-circle">
              <span class="stamp-icon">${s.icon}</span>
              <strong class="stamp-name">${s.name}</strong>
              <span class="stamp-km">${s.date}</span>
              ${s.unlocked ? `<span class="stamp-motto">${s.motto}</span>` : `<span class="stamp-locked">Pendent</span>`}
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  private renderVocabTab(state: any): string {
    const words = [
      VOCABULARY_LIST.tren,
      VOCABULARY_LIST.locomotora,
      VOCABULARY_LIST.via,
      VOCABULARY_LIST.obre_via,
      VOCABULARY_LIST.branques,
      VOCABULARY_LIST.xiulet,
      VOCABULARY_LIST.foc,
      VOCABULARY_LIST.carbo,
      VOCABULARY_LIST.aigua_fresca,
      VOCABULARY_LIST.clau_anglesa,
      VOCABULARY_LIST.lludriga,
      VOCABULARY_LIST.tots_al_tren,
      VOCABULARY_LIST.visca_el_tren,
    ];

    return `
      <div class="vocab-tab-container">
        <p class="vocab-intro">Toca qualsevol paraula per escoltar com es pronuncia en català:</p>
        <div class="vocab-cards-grid">
          ${words
            .map(
              (w) => `
            <button class="vocab-word-card" data-phrase="${w.catalan}" data-syllables="${w.syllables.join(' - ')}">
              <span class="word-card-icon">${w.icon}</span>
              <strong class="word-card-catalan">${w.catalan}</strong>
              <span class="word-card-syllables">${w.syllables.join(' • ')}</span>
              <span class="word-card-en">${w.meaningEn}</span>
              <span class="word-card-listen">🔊 Escolta</span>
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  private attachVocabEvents(container: Element): void {
    const cards = container.querySelectorAll('.vocab-word-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const phrase = (card as HTMLElement).dataset.phrase;
        if (phrase) {
          soundFX.playClick();
          speechManager.speak(phrase);
          card.classList.add('pulse');
          setTimeout(() => card.classList.remove('pulse'), 400);
        }
      });
    });
  }

  private renderDiplomaTab(state: any): string {
    const today = new Date().toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const isComplete = state.unlockedScenes.includes('seaside') || state.badges.includes('badge_medalla');

    return `
      <div class="diploma-tab-container">
        <!-- Interactive Name Input for Parents & Child -->
        <div class="diploma-edit-bar">
          <label for="diploma-name-input"><strong>✏️ Nom del Maquinista:</strong></label>
          <input
            type="text"
            id="diploma-name-input"
            class="diploma-name-input"
            value="${state.childName || 'Petit Maquinista'}"
            placeholder="Escriu el teu nom aquí..."
            maxlength="25"
          />
        </div>

        <!-- Printable Certificate Frame -->
        <div class="diploma-frame printable-area" id="printable-diploma">
          <div class="diploma-border-inner">
            <div class="diploma-badge-top">🏅 GENERALITAT DE LES VIES • CATALUNYA 🚂</div>
            <h1 class="diploma-main-title">DIPLOMA OFICIAL DE MAQUINISTA</h1>
            <p class="diploma-intro">Es certifica amb orgull i alegria que:</p>

            <div class="diploma-hero-name" id="diploma-display-name">
              ${state.childName || 'Petit Maquinista'}
            </div>

            <p class="diploma-body-text">
              Ha superat amb gran mestria tots els reptes de la línia ferroviària de Catalunya,
              obrint les vies, alimentant la caldera de foc, omplint el dipòsit d'aigua fresca al viaducte,
              fent sonar el xiulet amb el crit <em>"Tots al tren!"</em> i arribant triomfalment davant del Mar Mediterrani.
            </p>

            <!-- Stations Cleared Row -->
            <div class="diploma-stamps-summary">
              <span class="diploma-stamp-mini">🌲 Pins</span> •
              <span class="diploma-stamp-mini">🕹️ Cabina</span> •
              <span class="diploma-stamp-mini">🌉 Viaducte</span> •
              <span class="diploma-stamp-mini">🏰 Castell</span> •
              <span class="diploma-stamp-mini">🌊 Mar</span>
            </div>

            <!-- Footer with Seal and Signatures -->
            <div class="diploma-footer-row">
              <div class="diploma-sig">
                <div class="sig-line">Cap d'Estació Pep</div>
                <span class="sig-role">Estació dels Pins</span>
              </div>

              <div class="diploma-gold-seal">
                <div class="seal-inner">
                  <span>★ OFICIAL ★</span>
                  <strong>GRAN MAQUINISTA</strong>
                  <span>CATALUNYA</span>
                </div>
              </div>

              <div class="diploma-sig">
                <div class="sig-line">${today}</div>
                <span class="sig-role">Data d'Expedició</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="diploma-actions">
          <button id="btn-print-diploma" class="btn-diploma-action btn-print">
            🖨️ Imprimeix el Diploma
          </button>
          <button id="btn-speak-diploma" class="btn-diploma-action btn-speak">
            🔊 Llegeix el Diploma
          </button>
        </div>
      </div>
    `;
  }

  private attachDiplomaEvents(container: Element): void {
    const input = container.querySelector('#diploma-name-input') as HTMLInputElement | null;
    const nameDisplay = container.querySelector('#diploma-display-name');

    if (input && nameDisplay) {
      input.addEventListener('input', () => {
        const val = input.value.trim() || 'Petit Maquinista';
        nameDisplay.textContent = val;
        gameState.setChildName(val);
      });
    }

    const printBtn = container.querySelector('#btn-print-diploma');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        soundFX.playClick();
        window.print();
      });
    }

    const speakBtn = container.querySelector('#btn-speak-diploma');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        soundFX.playClick();
        const name = gameState.get().childName || 'Petit Maquinista';
        speechManager.speak(
          `Enhorabona, ${name}! Has completat tota la ruta del tren en català! Ets un gran maquinista de vapor!`
        );
      });
    }
  }

  private renderSongTab(state: any): string {
    const isPlaying = soundFX.isTrainSongPlaying();

    return `
      <div class="song-tab-container">
        <div class="song-header">
          <h3>🎶 Canta la Cançó del Tren Petit!</h3>
          <p>Una cançó tradicional catalana per cantar en família tot picant de mans:</p>
        </div>

        <!-- Karaoke Lyrics Board -->
        <div class="song-lyrics-board" id="song-lyrics-board">
          <div class="karaoke-line" data-line="1">
            <span class="syllable" id="syl-0">El</span>
            <span class="syllable" id="syl-1">tren</span>
            <span class="syllable" id="syl-2">pe-</span><span class="syllable" id="syl-3">tit</span>
            <span class="syllable" id="syl-4">que</span>
            <span class="syllable" id="syl-5">pu-</span><span class="syllable" id="syl-6">ja a</span>
            <span class="syllable" id="syl-7">la</span>
            <span class="syllable" id="syl-8">mun-</span><span class="syllable" id="syl-9">ta-nya,</span>
          </div>

          <div class="karaoke-line" data-line="2">
            <span class="syllable" id="syl-10">fa</span>
            <span class="syllable" id="syl-11">txu-</span><span class="syllable" id="syl-12">txu-</span><span class="syllable" id="syl-13">txu</span>
            <span class="syllable" id="syl-14">i</span>
            <span class="syllable" id="syl-15">mai</span>
            <span class="syllable" id="syl-16">no</span>
            <span class="syllable" id="syl-17">s'en-</span><span class="syllable" id="syl-18">ga-nya!</span>
          </div>

          <div class="karaoke-line" data-line="3">
            <span class="syllable" id="syl-19">Xiu-</span><span class="syllable" id="syl-20">let</span>
            <span class="syllable" id="syl-21">que</span>
            <span class="syllable" id="syl-22">so-na:</span>
            <span class="syllable highlight-whistle" id="syl-23">tu-</span><span class="syllable highlight-whistle" id="syl-24">tu-</span><span class="syllable highlight-whistle" id="syl-25">tuuuut!</span>
          </div>

          <div class="karaoke-line" data-line="4">
            <span class="syllable" id="syl-26">Tots</span>
            <span class="syllable" id="syl-27">ben</span>
            <span class="syllable" id="syl-28">con-</span><span class="syllable" id="syl-29">tents</span>
            <span class="syllable" id="syl-30">i a-</span><span class="syllable" id="syl-31">munt,</span>
            <span class="syllable highlight-final" id="syl-32">a-munt!</span>
          </div>
        </div>

        <!-- Bouncing Train Character -->
        <div class="karaoke-train-track">
          <div class="karaoke-train-runner" id="karaoke-train-runner">🚂</div>
        </div>

        <!-- Controls -->
        <div class="song-controls">
          <button id="btn-toggle-song" class="btn-song-play ${isPlaying ? 'playing' : ''}">
            ${isPlaying ? '⏹️ Atura la Cançó' : '▶️ Toca la Melodia i Canta!'}
          </button>
          <button id="btn-sing-voice" class="btn-song-sing">
            🎤 Canta amb la Veu en Català
          </button>
        </div>
      </div>
    `;
  }

  private attachSongEvents(container: Element): void {
    const playBtn = container.querySelector('#btn-toggle-song') as HTMLButtonElement | null;
    const singBtn = container.querySelector('#btn-sing-voice') as HTMLButtonElement | null;
    const trainRunner = container.querySelector('#karaoke-train-runner') as HTMLElement | null;

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (soundFX.isTrainSongPlaying()) {
          soundFX.stopTrainSong();
          playBtn.textContent = '▶️ Toca la Melodia i Canta!';
          playBtn.classList.remove('playing');
          // Clear active syllable classes
          container.querySelectorAll('.syllable.active').forEach((el) => el.classList.remove('active'));
        } else {
          playBtn.textContent = '⏹️ Atura la Cançó';
          playBtn.classList.add('playing');

          this.stopSongCallback = soundFX.playTrainSong(
            (index, text) => {
              // Highlight active syllable
              container.querySelectorAll('.syllable.active').forEach((el) => el.classList.remove('active'));
              const targetSyl = container.querySelector(`#syl-${index}`);
              if (targetSyl) {
                targetSyl.classList.add('active');
              }

              // Animate little train runner
              if (trainRunner) {
                const pct = (index / 33) * 90;
                trainRunner.style.left = `${pct}%`;
                trainRunner.style.transform = `scale(${index % 2 === 0 ? 1.2 : 1})`;
              }

              if (index === 25) {
                particleSystem.emitSteam(320, 200, 3, 6);
              }
            },
            () => {
              playBtn.textContent = '▶️ Toca la Melodia i Canta!';
              playBtn.classList.remove('playing');
              container.querySelectorAll('.syllable.active').forEach((el) => el.classList.remove('active'));
              soundFX.playSuccess();
              particleSystem.emitSparkles(320, 180, 16);
            }
          );
        }
      });
    }

    if (singBtn) {
      singBtn.addEventListener('click', () => {
        soundFX.playClick();
        speechManager.speak(
          "El tren petit que puja a la muntanya, fa txu-txu-txu i mai no s'enganya! Xiulet que sona: tu-tu-tuuuut! Tots ben contents i amunt, amunt!"
        );
      });
    }
  }

  private renderParentTab(state: any): string {
    return `
      <div class="parent-tips-container">
        <div class="parent-card-header">
          <h3>👨‍👩‍👧 Com jugar en català amb un infant de 5 anys:</h3>
          <p>Consells pedagògics per a mares i pares que viuen a l'estranger:</p>
        </div>

        <div class="tip-box">
          <strong>1. Celebreu l'intent, no la perfecció:</strong>
          <p>Quan el joc demana <em>"Obre la via"</em> o <em>"Tots al tren"</em>, el reconeixement de veu està programat per ser molt tolerant. Fins i tot si diuen <em>"via"</em> o <em>"tren"</em>, el joc ho accepta amb aplaudiments.</p>
        </div>

        <div class="tip-box">
          <strong>2. Feu servir les síl·labes amb ritme:</strong>
          <p>Els nens de 5 anys aprenen molt bé amb cops de palmell: <strong>O - BRE - LA - VI - A</strong> (5 palmellades!). Acompanyeu-los picant de mans!</p>
        </div>

        <div class="tip-box">
          <strong>3. Preguntes espontànies mentre jugueu:</strong>
          <ul>
            <li><em>"De quin color és la gorra del Cap d'Estació?"</em> (Vermella!)</li>
            <li><em>"Com fa el xiulet del Drac?"</em> (Tuuuut-tuuuut!)</li>
            <li><em>"Què crema a la caldera?"</em> (La llenya i el carbó!)</li>
          </ul>
        </div>

        <div class="tip-box">
          <strong>4. Si esteu en un lloc sense micròfon:</strong>
          <p>Cada repte té sempre el botó <em>"Toca per dir-ho!"</em> perquè el nen pugui jugar en silenci o sense autorització de micròfon al navegador.</p>
        </div>
      </div>
    `;
  }
}

export const passportModal = new PassportModal();
