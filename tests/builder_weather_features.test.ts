import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../src/game/GameState';
import { weatherSystem, WEATHER_MODES } from '../src/engine/WeatherSystem';
import { trackBuilderModal, TRACK_PIECES } from '../src/game/ui/TrackBuilderModal';
import { soundFX } from '../src/engine/SoundFX';

describe('Track Builder, Weather System & Game Persistence Features', () => {
  beforeEach(() => {
    gameState.reset();
  });

  describe('Weather & Atmosphere System', () => {
    it('initializes with sunny weather by default', () => {
      expect(gameState.get().weather).toBe('sol');
    });

    it('cycles sequentially through Sol, Capvespre, Nit, and Pluja', () => {
      expect(gameState.get().weather).toBe('sol');

      const next1 = weatherSystem.cycle();
      expect(next1).toBe('capvespre');
      expect(gameState.get().weather).toBe('capvespre');

      const next2 = weatherSystem.cycle();
      expect(next2).toBe('nit');
      expect(gameState.get().weather).toBe('nit');

      const next3 = weatherSystem.cycle();
      expect(next3).toBe('pluja');
      expect(gameState.get().weather).toBe('pluja');

      const next4 = weatherSystem.cycle();
      expect(next4).toBe('sol');
      expect(gameState.get().weather).toBe('sol');
    });

    it('updates atmospheric simulation without errors across all weathers', () => {
      gameState.setWeather('pluja');
      weatherSystem.update(0.05);

      gameState.setWeather('nit');
      weatherSystem.update(0.05);

      gameState.setWeather('capvespre');
      weatherSystem.update(0.05);

      gameState.setWeather('sol');
      weatherSystem.update(0.05);
      expect(true).toBe(true);
    });
  });

  describe('Toy Wooden Railway Track Builder (El Taller de les Vies)', () => {
    it('initializes with the default preset oval track', () => {
      trackBuilderModal.loadPresetOval();
      const state = gameState.get();
      expect(state.customTracks.length).toBeGreaterThan(0);
      expect(state.customTracks.some((t) => t.type === 'pont' || t.type.startsWith('via'))).toBe(true);
    });

    it('loads the preset bridge layout', () => {
      trackBuilderModal.loadPresetBridge();
      const state = gameState.get();
      expect(state.customTracks.some((t) => t.type === 'pont')).toBe(true);
    });

    it('starts and stops mini-train simulation safely', () => {
      trackBuilderModal.loadPresetOval();
      trackBuilderModal.startTrain();
      // Mini train should start
      trackBuilderModal.stopTrain();
      expect(true).toBe(true);
    });

    it('defines valid Catalan names and pronunciations for all wooden pieces', () => {
      expect(TRACK_PIECES.length).toBeGreaterThanOrEqual(10);
      for (const piece of TRACK_PIECES) {
        expect(piece.id).toBeDefined();
        expect(piece.name).toBeDefined();
        expect(piece.catalanPronunciation).toBeDefined();
        expect(piece.icon).toBeDefined();
      }
    });
  });

  describe('Child Name & Conductor Diploma Persistence', () => {
    it('sets and updates child name', () => {
      expect(gameState.get().childName).toBe('Petit Maquinista');
      gameState.setChildName('Pau i Laia');
      expect(gameState.get().childName).toBe('Pau i Laia');
    });

    it('resets state and clears persistent storage on game reset', () => {
      gameState.setChildName('Aina');
      gameState.setWeather('nit');
      gameState.addBadge('badge_test_save');

      gameState.reset();
      expect(gameState.get().childName).toBe('Petit Maquinista');
      expect(gameState.get().weather).toBe('sol');
      expect(gameState.get().badges).not.toContain('badge_test_save');
    });
  });

  describe('Animal Sounds & Procedural Catalan Train Song', () => {
    it('plays synthesized animal sounds without throwing errors', () => {
      soundFX.init();
      soundFX.playMeow();
      soundFX.playBark();
      soundFX.playMoo();
      soundFX.playQuack();
      soundFX.playSnore();
      soundFX.playWaterDrop();
      soundFX.playWoodClick();
      soundFX.playMagicChime();
      expect(true).toBe(true);
    });

    it('starts and stops Catalan train children song', () => {
      soundFX.init();
      expect(soundFX.isTrainSongPlaying()).toBe(false);

      const stopFn = soundFX.playTrainSong();
      expect(soundFX.isTrainSongPlaying()).toBe(true);

      stopFn();
      expect(soundFX.isTrainSongPlaying()).toBe(false);
    });
  });
});
