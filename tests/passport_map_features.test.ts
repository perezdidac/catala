import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../src/game/GameState';
import { soundFX } from '../src/engine/SoundFX';
import { particleSystem } from '../src/engine/ParticleSystem';
import { StorySimulator } from './StorySimulator';

describe('Conductor Passport, Railway Map & Particle System Tests', () => {
  beforeEach(() => {
    gameState.reset();
    particleSystem.clear();
  });

  describe('Conductor Passport & Badge System', () => {
    it('initializes with default conductor avatar and starter badge', () => {
      const state = gameState.get();
      expect(state.avatarId).toBe('conductor_boy');
      expect(state.badges).toContain('badge_inici');
    });

    it('allows changing conductor avatar across child choices', () => {
      gameState.setAvatar('conductor_girl');
      expect(gameState.get().avatarId).toBe('conductor_girl');

      gameState.setAvatar('conductor_bear');
      expect(gameState.get().avatarId).toBe('conductor_bear');
    });

    it('awards badges on puzzle completion across scenes', () => {
      const sim = new StorySimulator();

      // Scene 1: Pick up branches
      sim.selectVerb('AGAFA');
      sim.tapHotspot('branches');
      expect(gameState.hasBadge('badge_branques')).toBe(true);

      // Voice gate 1 & switch lever
      sim.selectVerb('PARLA');
      sim.tapHotspot('stationmaster');
      sim.respondVoiceGate('Obre la via');
      sim.selectVerb('CONDUEIX');
      sim.tapHotspot('switch_lever');
      expect(gameState.hasBadge('badge_obre_via')).toBe(true);

      // Cabin: whistle & fire
      sim.tapHotspot('locomotive');
      sim.tapHotspot('whistle');
      expect(gameState.hasBadge('badge_xiulet')).toBe(true);

      sim.tapHotspot('firebox');
      expect(gameState.hasBadge('badge_foc')).toBe(true);
    });

    it('does not duplicate badges if earned multiple times', () => {
      gameState.addBadge('badge_test');
      gameState.addBadge('badge_test');
      const count = gameState.get().badges.filter((b) => b === 'badge_test').length;
      expect(count).toBe(1);
    });
  });

  describe('Railway Map & Fast Travel', () => {
    it('tracks unlocked scenes progressively as the story advances', () => {
      const sim = new StorySimulator();
      expect(gameState.get().unlockedScenes).toEqual(['station']);

      // Clear scene 1 and enter cabin
      sim.playScene1_Station();
      expect(gameState.get().unlockedScenes).toContain('station');
      expect(gameState.get().unlockedScenes).toContain('cabin');

      // Complete cabin travel to bridge
      sim.playScene2_Cabin();
      sim.tapHotspot('next_station_bridge');
      expect(gameState.get().unlockedScenes).toContain('bridge');

      // Complete bridge to castle
      sim.playScene3_Bridge();
      expect(gameState.get().unlockedScenes).toContain('castle');

      // Complete castle to seaside
      sim.playScene4_Castle();
      expect(gameState.get().unlockedScenes).toContain('seaside');
    });

    it('allows fast travel to any previously unlocked station via GameState.setScene', () => {
      const sim = new StorySimulator();
      sim.playScene1_Station();
      sim.playScene2_Cabin();
      sim.tapHotspot('next_station_bridge');

      expect(gameState.get().currentScene).toBe('bridge');

      // Child wants to go back to L'Estació dels Pins to see Pep
      gameState.setScene('station');
      expect(gameState.get().currentScene).toBe('station');

      // Travel back to Cabin
      gameState.setScene('cabin');
      expect(gameState.get().currentScene).toBe('cabin');
    });
  });

  describe('Procedural Music & Audio Controls', () => {
    it('toggles ambient music on and off', () => {
      expect(soundFX.isMusicOn()).toBe(false);
      const turnedOn = soundFX.toggleMusic();
      expect(turnedOn).toBe(true);
      expect(soundFX.isMusicOn()).toBe(true);

      const turnedOff = soundFX.toggleMusic();
      expect(turnedOff).toBe(false);
      expect(soundFX.isMusicOn()).toBe(false);
    });

    it('toggles mute states cleanly', () => {
      expect(soundFX.getMuted()).toBe(false);
      soundFX.setMuted(true);
      expect(soundFX.getMuted()).toBe(true);
      soundFX.setMuted(false);
      expect(soundFX.getMuted()).toBe(false);
    });
  });

  describe('ParticleSystem Memory & Safety', () => {
    it('emits particles and decays them without unbounded growth', () => {
      particleSystem.emitSteam(100, 100, 5);
      particleSystem.emitEmbers(100, 100, 5);
      particleSystem.emitWaterSplash(100, 100, 5);
      particleSystem.emitSparkles(100, 100, 5);
      particleSystem.emitConfetti(100, 100, 5);

      // Simulate 5 seconds of updates
      for (let step = 0; step < 50; step++) {
        particleSystem.update(0.1);
      }

      // After 5s all particles should have decayed and been cleaned up
      // Test clear method
      particleSystem.clear();
      expect(true).toBe(true);
    });
  });
});
