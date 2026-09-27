/**
 * Story Constraints & Unblockable Fallback Test Suite
 * Tests puzzle prerequisites, anti-sequence-breaking guards,
 * and verifies that child tap-to-speak fallbacks always work.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StorySimulator } from './StorySimulator';
import { gameState } from '../src/game/GameState';

describe('Story Constraints, Puzzle Logic & Fallback Resilience', () => {
  let sim: StorySimulator;

  beforeEach(() => {
    sim = new StorySimulator();
  });

  describe('Scene 1 Sequence Guards', () => {
    it('prevents throwing switch lever while branches are on the track', () => {
      // Trying to pull lever before taking branches
      sim.selectVerb('CONDUEIX');
      sim.tapHotspot('switch_lever');

      expect(sim.isDialogOpen()).toBe(true);
      expect(sim.getActiveDialog()?.title).toBe('Palanca Encallada!');
      expect(gameState.get().switchOpen).toBe(false);
    });

    it('prevents throwing switch lever before speaking with Pep', () => {
      // Pick up branches first
      sim.selectVerb('AGAFA');
      sim.tapHotspot('branches');
      sim.dismissDialog();

      // Attempt to pull lever without voice gate
      sim.selectVerb('CONDUEIX');
      sim.tapHotspot('switch_lever');

      expect(sim.isDialogOpen()).toBe(true);
      expect(sim.getActiveDialog()?.title).toBe('Bloqueig de Seguretat!');
      expect(gameState.get().switchOpen).toBe(false);
    });

    it('prevents entering the cabin before the track is cleared and open', () => {
      sim.selectVerb('CONDUEIX');
      sim.tapHotspot('locomotive');

      expect(sim.isDialogOpen()).toBe(true);
      expect(sim.getActiveDialog()?.title).toBe('Atenció al Tren!');
      expect(sim.getCurrentScene()).toBe('station');
    });
  });

  describe('Scene 3 & 4 Sequence Guards', () => {
    it('prevents crossing river bridge before filling boiler with water', () => {
      gameState.setScene('bridge');
      expect(sim.getCurrentScene()).toBe('bridge');

      // Attempt to drive locomotive across bridge without water
      sim.selectVerb('CONDUEIX');
      sim.tapHotspot('bridge');

      expect(sim.isDialogOpen()).toBe(true);
      expect(sim.getActiveDialog()?.title).toBe('Falta Aigua!');
      expect(sim.getCurrentScene()).toBe('bridge');
    });

    it('prevents entering mountain tunnel before ringing bell or calling Tots al Tren', () => {
      gameState.setScene('castle');
      expect(sim.getCurrentScene()).toBe('castle');

      // Attempt to drive train into tunnel before departure signal
      sim.selectVerb('CONDUEIX');
      sim.tapHotspot('tunnel');

      expect(sim.isDialogOpen()).toBe(true);
      expect(sim.getActiveDialog()?.title).toBe('Atenció a la Sortida!');
      expect(sim.getCurrentScene()).toBe('castle');
    });
  });

  describe('Child-Friendly Fallback Resilience ("Toca per dir-ho!")', () => {
    it('successfully advances Scene 1 voice gate via tap fallback without microphone', () => {
      sim.selectVerb('AGAFA');
      sim.tapHotspot('branches');
      sim.dismissDialog();

      sim.selectVerb('PARLA');
      sim.tapHotspot('stationmaster');
      expect(sim.getActiveDialog()?.isVoiceGate).toBe(true);

      // Child taps "🗣️ Toca per dir-ho!"
      sim.tapVoiceGateFallback();

      expect(gameState.get().voiceGatePassed).toBe(true);
      expect(sim.getActiveDialog()?.title).toBe('Molt ben dit!');
    });

    it('successfully advances Scene 3 otter voice gate via tap fallback', () => {
      gameState.setScene('bridge');
      sim.selectVerb('PARLA');
      sim.tapHotspot('otter');
      expect(sim.getActiveDialog()?.isVoiceGate).toBe(true);

      sim.tapVoiceGateFallback();

      expect(gameState.get().waterVoiceGatePassed).toBe(true);
      expect(sim.hasInventoryItem('clau_anglesa')).toBe(true);
    });

    it('successfully advances Scene 4 ticket inspector voice gate via tap fallback', () => {
      gameState.setScene('castle');
      sim.selectVerb('PARLA');
      sim.tapHotspot('inspector');
      expect(sim.getActiveDialog()?.isVoiceGate).toBe(true);

      sim.tapVoiceGateFallback();

      expect(gameState.get().allAboardVoiceGatePassed).toBe(true);
      expect(sim.hasInventoryItem('bitllet')).toBe(true);
    });

    it('successfully advances Scene 5 mayor voice gate via tap fallback', () => {
      gameState.setScene('seaside');
      sim.selectVerb('PARLA');
      sim.tapHotspot('mayor');
      expect(sim.getActiveDialog()?.isVoiceGate).toBe(true);

      sim.tapVoiceGateFallback();

      expect(gameState.get().celebrationVoiceGatePassed).toBe(true);
      expect(sim.hasInventoryItem('medalla')).toBe(true);
    });
  });

  describe('Story Reset & State Cleanliness', () => {
    it('resets all flags and inventory on gameState.reset()', () => {
      // Pick up item and change scene
      gameState.setScene('seaside');
      gameState.addItem({
        id: 'test',
        name: 'test',
        catalanName: 'test',
        icon: '🚂',
        description: 'test',
        speechPhrase: 'test'
      });
      gameState.updateFlags({ switchOpen: true, waterTankFilled: true });

      // Reset
      gameState.reset();

      expect(gameState.get().currentScene).toBe('station');
      expect(gameState.get().inventory).toHaveLength(0);
      expect(gameState.get().switchOpen).toBe(false);
      expect(gameState.get().waterTankFilled).toBe(false);
    });
  });
});
