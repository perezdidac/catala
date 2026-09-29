/**
 * TrackBuilderModal: "El Taller de les Vies"
 * Interactive wooden railway toy track sandbox for 5-year-old child & parent.
 * Child can place wooden tracks, bridges, trees, and animals, then run a miniature steam train!
 */

import { gameState } from '../GameState';
import { soundFX } from '../../engine/SoundFX';
import { speechManager } from '../../engine/SpeechManager';

export type TrackPieceType =
  | 'via_recta_h'
  | 'via_recta_v'
  | 'via_corba_ne'
  | 'via_corba_se'
  | 'via_corba_so'
  | 'via_corba_no'
  | 'pont'
  | 'arbre'
  | 'estacio'
  | 'semafor'
  | 'vaca'
  | 'esborrar';

interface TrackPieceDef {
  id: TrackPieceType;
  name: string;
  catalanPronunciation: string;
  icon: string;
  isTrack: boolean;
}

export const TRACK_PIECES: TrackPieceDef[] = [
  { id: 'via_recta_h', name: 'Via Recta ─', catalanPronunciation: 'Una via recta horitzontal', icon: '─', isTrack: true },
  { id: 'via_recta_v', name: 'Via Recta │', catalanPronunciation: 'Una via recta vertical', icon: '│', isTrack: true },
  { id: 'via_corba_ne', name: 'Corba ╰', catalanPronunciation: 'Una via corba cap a dalt', icon: '╰', isTrack: true },
  { id: 'via_corba_se', name: 'Corba ╭', catalanPronunciation: 'Una via corba cap a baix', icon: '╭', isTrack: true },
  { id: 'via_corba_so', name: 'Corba ╮', catalanPronunciation: 'Una via corba cap a l\'esquerra', icon: '╮', isTrack: true },
  { id: 'via_corba_no', name: 'Corba ╯', catalanPronunciation: 'Una via corba', icon: '╯', isTrack: true },
  { id: 'pont', name: 'Pont 🌉', catalanPronunciation: 'Un bonic pont de fusta sobre l\'aigua', icon: '🌉', isTrack: true },
  { id: 'arbre', name: 'Arbre 🌲', catalanPronunciation: 'Un arbre de pi verd', icon: '🌲', isTrack: false },
  { id: 'estacio', name: 'Estació 🏠', catalanPronunciation: 'La caseta de l\'estació', icon: '🏠', isTrack: false },
  { id: 'semafor', name: 'Semàfor 🚦', catalanPronunciation: 'El semàfor amb llum verda', icon: '🚦', isTrack: false },
  { id: 'vaca', name: 'Vaca 🐮', catalanPronunciation: 'Muuuu! La vaca que mira el tren', icon: '🐮', isTrack: false },
  { id: 'esborrar', name: 'Goma 🧹', catalanPronunciation: 'Esborrem aquesta peça', icon: '🧹', isTrack: false }
];

export class TrackBuilderModal {
  private modalEl: HTMLElement | null = null;
  private selectedPiece: TrackPieceType = 'via_recta_h';
  private gridCols: number = 8;
  private gridRows: number = 5;
  private grid: (TrackPieceType | null)[][] = [];

  // Mini-train simulation state
  private isTrainRunning: boolean = false;
  private trainX: number = 0;
  private trainY: number = 0;
  private trainDir: 'E' | 'W' | 'N' | 'S' = 'E';
  private trainIntervalId: number | null = null;

  constructor() {
    this.initGrid();
  }

  private initGrid(): void {
    this.grid = [];
    for (let r = 0; r < this.gridRows; r++) {
      const row: (TrackPieceType | null)[] = [];
      for (let c = 0; c < this.gridCols; c++) {
        row.push(null);
      }
      this.grid.push(row);
    }

    // Default charming loop if empty
    this.loadPresetOval();
  }

  public show(): void {
    soundFX.init();
    soundFX.playClick();
    this.createOrUpdateDOM();
    if (this.modalEl) {
      this.modalEl.classList.remove('hidden');
    }
  }

  public hide(): void {
    this.stopTrain();
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
  }

  public isVisible(): boolean {
    return !!this.modalEl && !this.modalEl.classList.contains('hidden');
  }

  private createOrUpdateDOM(): void {
    if (typeof document === 'undefined') return;

    if (!this.modalEl) {
      this.modalEl = document.createElement('div');
      this.modalEl.id = 'track-builder-modal';
      this.modalEl.className = 'modal hidden';
      document.body.appendChild(this.modalEl);

      this.modalEl.addEventListener('click', (e) => {
        if (e.target === this.modalEl) {
          this.hide();
        }
      });
    }

    this.modalEl.innerHTML = `
      <div class="modal-content builder-card">
        <div class="modal-header">
          <div class="builder-title-wrap">
            <span class="builder-icon">🪵</span>
            <div>
              <h2>El Taller de les Vies</h2>
              <div class="builder-subtitle">Construeix el teu circuit de tren de fusta i fes córrer la locomotora!</div>
            </div>
          </div>
          <button id="close-builder-btn" class="modal-close" title="Tanca">✕</button>
        </div>

        <!-- Toolbar of Wooden Pieces -->
        <div class="builder-palette">
          <div class="palette-label">Tria una peça de fusta:</div>
          <div class="palette-items-row">
            ${TRACK_PIECES.map((piece) => `
              <button
                class="btn-palette-piece ${this.selectedPiece === piece.id ? 'active' : ''}"
                data-piece="${piece.id}"
                title="${piece.name}"
              >
                <span class="palette-piece-icon">${piece.icon}</span>
                <span class="palette-piece-name">${piece.name.split(' ')[0]}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Wooden Table Grid -->
        <div class="wooden-board-container">
          <div class="wooden-grid" id="wooden-grid">
            ${this.renderGridCellsHTML()}
          </div>
        </div>

        <!-- Action Controls -->
        <div class="builder-actions-bar">
          <div class="action-group-left">
            <button id="btn-run-train" class="btn-builder-action ${this.isTrainRunning ? 'btn-stop' : 'btn-run'}">
              ${this.isTrainRunning ? '⏹️ Atura el Tren' : '▶️ Fes córrer el tren!'}
            </button>
            <button id="btn-whistle-toy" class="btn-builder-action btn-whistle" title="Toca el xiulet">
              📢 Tuuut!
            </button>
          </div>

          <div class="action-group-right">
            <button id="btn-preset-oval" class="btn-builder-tool" title="Carrega el Gran Oval">
              🔄 Circuit Oval
            </button>
            <button id="btn-preset-bridge" class="btn-builder-tool" title="Carrega el Circuit del Pont">
              🌉 El Pont
            </button>
            <button id="btn-clear-grid" class="btn-builder-tool btn-danger" title="Esborra tot el tauler">
              🧹 Neteja
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private renderGridCellsHTML(): string {
    let html = '';
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const piece = this.grid[r][c];
        const isTrainHere = this.isTrainRunning && this.trainX === c && this.trainY === r;

        let display = '';
        if (isTrainHere) {
          display = '<span class="mini-train-sprite">🚂</span>';
        } else if (piece) {
          const pDef = TRACK_PIECES.find((p) => p.id === piece);
          if (pDef) {
            display = `<span class="grid-piece-symbol piece-${piece}">${pDef.icon}</span>`;
          }
        }

        html += `
          <div class="grid-cell ${isTrainHere ? 'train-active' : ''}" data-row="${r}" data-col="${c}">
            ${display}
          </div>
        `;
      }
    }
    return html;
  }

  private bindEvents(): void {
    if (!this.modalEl) return;

    // Close button
    const closeBtn = this.modalEl.querySelector('#close-builder-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        soundFX.playClick();
        this.hide();
      });
    }

    // Palette piece selection
    const pieceBtns = this.modalEl.querySelectorAll('.btn-palette-piece');
    pieceBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = (e.currentTarget as HTMLElement).getAttribute('data-piece') as TrackPieceType;
        if (target) {
          this.selectedPiece = target;
          soundFX.playWoodClick();
          const def = TRACK_PIECES.find((p) => p.id === target);
          if (def) {
            speechManager.speak(def.name);
          }
          this.createOrUpdateDOM();
        }
      });
    });

    // Grid cell clicks
    const cells = this.modalEl.querySelectorAll('.grid-cell');
    cells.forEach((cell) => {
      cell.addEventListener('click', (e) => {
        const r = parseInt((e.currentTarget as HTMLElement).getAttribute('data-row') || '0', 10);
        const c = parseInt((e.currentTarget as HTMLElement).getAttribute('data-col') || '0', 10);
        this.handleCellClick(r, c);
      });
    });

    // Run / Stop Train button
    const runBtn = this.modalEl.querySelector('#btn-run-train');
    if (runBtn) {
      runBtn.addEventListener('click', () => {
        if (this.isTrainRunning) {
          this.stopTrain();
        } else {
          this.startTrain();
        }
      });
    }

    // Whistle button
    const whistleBtn = this.modalEl.querySelector('#btn-whistle-toy');
    if (whistleBtn) {
      whistleBtn.addEventListener('click', () => {
        soundFX.playWhistle();
        speechManager.speak("TUUUT-TUUUT! El tren petit saluda!");
      });
    }

    // Preset buttons
    const ovalBtn = this.modalEl.querySelector('#btn-preset-oval');
    if (ovalBtn) {
      ovalBtn.addEventListener('click', () => {
        this.stopTrain();
        soundFX.playWoodClick();
        this.loadPresetOval();
        speechManager.speak("Aquí tens el gran circuit oval!");
        this.createOrUpdateDOM();
      });
    }

    const bridgeBtn = this.modalEl.querySelector('#btn-preset-bridge');
    if (bridgeBtn) {
      bridgeBtn.addEventListener('click', () => {
        this.stopTrain();
        soundFX.playWoodClick();
        this.loadPresetBridge();
        speechManager.speak("Un circuit fantàstic amb un pont de fusta!");
        this.createOrUpdateDOM();
      });
    }

    // Clear button
    const clearBtn = this.modalEl.querySelector('#btn-clear-grid');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.stopTrain();
        soundFX.playClick();
        for (let r = 0; r < this.gridRows; r++) {
          for (let c = 0; c < this.gridCols; c++) {
            this.grid[r][c] = null;
          }
        }
        speechManager.speak("Taula neta! Ara pots construir de nou.");
        this.createOrUpdateDOM();
      });
    }
  }

  private handleCellClick(row: number, col: number): void {
    if (this.selectedPiece === 'esborrar') {
      this.grid[row][col] = null;
      soundFX.playClick();
    } else {
      this.grid[row][col] = this.selectedPiece;

      // Play special acoustic sound depending on item
      if (this.selectedPiece === 'vaca') {
        soundFX.playMoo();
      } else if (this.selectedPiece === 'pont') {
        soundFX.playWaterDrop();
      } else if (this.selectedPiece === 'arbre') {
        soundFX.playBirdChirp();
      } else if (this.selectedPiece === 'semafor') {
        soundFX.playBell();
      } else {
        soundFX.playWoodClick();
      }

      const def = TRACK_PIECES.find((p) => p.id === this.selectedPiece);
      if (def) {
        speechManager.speak(def.catalanPronunciation);
      }
    }

    // Update persistent state
    this.saveTracksToGameState();
    this.updateGridDOMOnly();
  }

  private updateGridDOMOnly(): void {
    if (!this.modalEl) return;
    const gridEl = this.modalEl.querySelector('#wooden-grid');
    if (gridEl) {
      gridEl.innerHTML = this.renderGridCellsHTML();
      // Re-bind cell click events
      const cells = gridEl.querySelectorAll('.grid-cell');
      cells.forEach((cell) => {
        cell.addEventListener('click', (e) => {
          const r = parseInt((e.currentTarget as HTMLElement).getAttribute('data-row') || '0', 10);
          const c = parseInt((e.currentTarget as HTMLElement).getAttribute('data-col') || '0', 10);
          this.handleCellClick(r, c);
        });
      });
    }
  }

  private saveTracksToGameState(): void {
    const list: { x: number; y: number; type: string }[] = [];
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        if (this.grid[r][c]) {
          list.push({ x: c, y: r, type: this.grid[r][c] as string });
        }
      }
    }
    gameState.setCustomTracks(list);
  }

  public loadPresetOval(): void {
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        this.grid[r][c] = null;
      }
    }

    // Oval: rows 1 to 3, cols 1 to 6
    this.grid[1][1] = 'via_corba_se'; // ╭
    this.grid[1][2] = 'via_recta_h';
    this.grid[1][3] = 'via_recta_h';
    this.grid[1][4] = 'via_recta_h';
    this.grid[1][5] = 'via_recta_h';
    this.grid[1][6] = 'via_corba_so'; // ╮

    this.grid[2][1] = 'via_recta_v';
    this.grid[2][6] = 'via_recta_v';

    this.grid[3][1] = 'via_corba_ne'; // ╰
    this.grid[3][2] = 'via_recta_h';
    this.grid[3][3] = 'via_recta_h';
    this.grid[3][4] = 'via_recta_h';
    this.grid[3][5] = 'via_recta_h';
    this.grid[3][6] = 'via_corba_no'; // ╯

    // Decorations
    this.grid[0][1] = 'arbre';
    this.grid[0][6] = 'arbre';
    this.grid[2][3] = 'vaca';
    this.grid[2][4] = 'estacio';
    this.grid[4][3] = 'semafor';

    this.saveTracksToGameState();
  }

  public loadPresetBridge(): void {
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        this.grid[r][c] = null;
      }
    }

    this.grid[1][1] = 'via_corba_se';
    this.grid[1][2] = 'via_recta_h';
    this.grid[1][3] = 'pont';
    this.grid[1][4] = 'via_recta_h';
    this.grid[1][5] = 'via_corba_so';

    this.grid[2][1] = 'via_recta_v';
    this.grid[2][5] = 'via_recta_v';

    this.grid[3][1] = 'via_corba_ne';
    this.grid[3][2] = 'via_recta_h';
    this.grid[3][3] = 'via_recta_h';
    this.grid[3][4] = 'via_recta_h';
    this.grid[3][5] = 'via_corba_no';

    this.grid[0][3] = 'estacio';
    this.grid[2][3] = 'arbre';
    this.grid[3][6] = 'vaca';

    this.saveTracksToGameState();
  }

  public startTrain(): void {
    this.stopTrain();

    // Find first track cell
    let startFound = false;
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const p = this.grid[r][c];
        if (p && TRACK_PIECES.find((tp) => tp.id === p)?.isTrack) {
          this.trainX = c;
          this.trainY = r;
          this.trainDir = 'E';
          startFound = true;
          break;
        }
      }
      if (startFound) break;
    }

    if (!startFound) {
      speechManager.speak("Posa alguna via de fusta primer per fer córrer el tren!");
      return;
    }

    this.isTrainRunning = true;
    soundFX.playWhistle();
    speechManager.speak("Txu, txu! El tren comença a circular!");

    if (typeof window !== 'undefined') {
      this.trainIntervalId = window.setInterval(() => {
        this.stepTrain();
      }, 550);
    }

    this.createOrUpdateDOM();
  }

  public stopTrain(): void {
    if (this.trainIntervalId !== null) {
      if (typeof window !== 'undefined') {
        window.clearInterval(this.trainIntervalId);
      }
      this.trainIntervalId = null;
    }
    this.isTrainRunning = false;
    this.createOrUpdateDOM();
  }

  private stepTrain(): void {
    if (!this.isTrainRunning) return;

    soundFX.playChuff(1.2);

    const currentPiece = this.grid[this.trainY][this.trainX];

    // Determine next direction according to current track geometry
    if (currentPiece === 'via_corba_se') {
      // ╭ : coming from W goes S, coming from N goes E
      if (this.trainDir === 'W') this.trainDir = 'S';
      else if (this.trainDir === 'N') this.trainDir = 'E';
      else this.trainDir = 'E';
    } else if (currentPiece === 'via_corba_so') {
      // ╮ : coming from E goes S, coming from N goes W
      if (this.trainDir === 'E') this.trainDir = 'S';
      else if (this.trainDir === 'N') this.trainDir = 'W';
      else this.trainDir = 'S';
    } else if (currentPiece === 'via_corba_no') {
      // ╯ : coming from E goes N, coming from S goes W
      if (this.trainDir === 'E') this.trainDir = 'N';
      else if (this.trainDir === 'S') this.trainDir = 'W';
      else this.trainDir = 'W';
    } else if (currentPiece === 'via_corba_ne') {
      // ╰ : coming from W goes N, coming from S goes E
      if (this.trainDir === 'W') this.trainDir = 'N';
      else if (this.trainDir === 'S') this.trainDir = 'E';
      else this.trainDir = 'N';
    }

    // Step forward in current direction
    let nextX = this.trainX;
    let nextY = this.trainY;

    if (this.trainDir === 'E') nextX++;
    else if (this.trainDir === 'W') nextX--;
    else if (this.trainDir === 'S') nextY++;
    else if (this.trainDir === 'N') nextY--;

    // Wrap-around bounds check
    if (nextX < 0) nextX = this.gridCols - 1;
    if (nextX >= this.gridCols) nextX = 0;
    if (nextY < 0) nextY = this.gridRows - 1;
    if (nextY >= this.gridRows) nextY = 0;

    const nextPiece = this.grid[nextY][nextX];
    const isNextTrack = nextPiece && TRACK_PIECES.find((p) => p.id === nextPiece)?.isTrack;

    if (isNextTrack) {
      this.trainX = nextX;
      this.trainY = nextY;
      if (nextPiece === 'pont') {
        soundFX.playWheelClack();
      }
    } else {
      // Hit a turn or scenery, try other directions or reverse
      this.trainDir = this.trainDir === 'E' ? 'S' : this.trainDir === 'S' ? 'W' : this.trainDir === 'W' ? 'N' : 'E';
    }

    this.updateGridDOMOnly();
  }
}

export const trackBuilderModal = new TrackBuilderModal();
