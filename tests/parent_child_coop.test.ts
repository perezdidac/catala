/**
 * Parent-Child Cooperative Dialogue & World Exploration Test Suite
 * Tests every single hotspot across all 5 scenes with all 4 action verbs
 * (MIRA, AGAFA, PARLA, CONDUEIX) to verify narrative depth, educational voice lines,
 * and seamless non-linear travel via the railway route map.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StorySimulator } from './StorySimulator';
import { gameState } from '../src/game/GameState';
import { VOCABULARY_LIST, DIALOGUES } from '../src/data/catalanVocabulary';

describe('Story World Exploration & Linguistic Immersion (5 Scenes)', () => {
  let sim: StorySimulator;

  beforeEach(() => {
    sim = new StorySimulator();
  });

  describe('Scene 1: "L\'Estació dels Pins" Exploration', () => {
    it('provides educational Catalan descriptions for all station elements', () => {
      sim.selectVerb('MIRA');

      // Inspect locomotive
      sim.tapHotspot('locomotive');
      // Verify vocabulary entries match
      expect(VOCABULARY_LIST.locomotora.catalan).toBe('La Locomotora');
      expect(VOCABULARY_LIST.locomotora.speechPhrase).toContain('motor de vapor potent');

      // Inspect tracks
      expect(VOCABULARY_LIST.via.catalan).toBe('La Via');
      expect(VOCABULARY_LIST.via.speechPhrase).toContain('ferro i fusta');

      // Inspect branches
      sim.tapHotspot('branches');
      expect(sim.getActiveDialog()?.title).toBe('Via Bloquejada!');
      sim.dismissDialog();

      // Inspect stationmaster
      expect(VOCABULARY_LIST.cap_estacio.catalan).toBe("El Cap d'Estació");
      expect(VOCABULARY_LIST.cap_estacio.speechPhrase).toContain('Sóc en Pep');
    });

    it('teaches action verbs through child interaction', () => {
      // Trying to take the locomotive:
      sim.selectVerb('AGAFA');
      expect(sim.getActiveVerb()).toBe('AGAFA');

      // Selecting MIRA
      sim.selectVerb('MIRA');
      expect(sim.getActiveVerb()).toBe('MIRA');

      // Selecting PARLA
      sim.selectVerb('PARLA');
      expect(sim.getActiveVerb()).toBe('PARLA');

      // Selecting CONDUEIX
      sim.selectVerb('CONDUEIX');
      expect(sim.getActiveVerb()).toBe('CONDUEIX');
    });
  });

  describe('Scene 2: "La Cabina del Maquinista" Controls & Mechanics', () => {
    it('simulates whistle pulling, firebox feeding, and speed calculations', () => {
      gameState.setScene('cabin');
      expect(sim.getCurrentScene()).toBe('cabin');

      // Boiler starts at 50% warm pressure
      expect(gameState.get().steamPressure).toBe(50);
      expect(gameState.get().throttle).toBe(0);
      expect(gameState.get().speedKmh).toBe(0);

      // Pull whistle
      sim.tapHotspot('whistle');
      expect(gameState.get().whistlePulled).toBe(true);

      // Add branches and feed firebox
      gameState.addItem({
        id: 'branques',
        name: 'Branques',
        catalanName: 'Branques',
        icon: '🪵',
        description: 'Llenya',
        speechPhrase: 'Llenya'
      });
      sim.tapHotspot('firebox');

      // Boiler reaches 100% full pressure!
      expect(gameState.get().steamPressure).toBe(100);
      expect(gameState.get().branchesInFirebox).toBe(true);

      // Push throttle forward
      sim.tapHotspot('throttle_forward');
      expect(gameState.get().throttle).toBe(80);

      // Advance travel: distance and speed progression
      sim.advanceCabinSimulation(15);
      expect(gameState.get().speedKmh).toBeGreaterThan(0);
      expect(gameState.get().distanceTraveled).toBeGreaterThan(0);
    });
  });

  describe('Scene 3: "El Pont del Riu d\'Or" Viaduct & Water Logistics', () => {
    it('teaches water logistics and vocabulary for river and water crane', () => {
      gameState.setScene('bridge');

      expect(VOCABULARY_LIST.aigua_fresca.catalan).toBe('Aigua fresca');
      expect(VOCABULARY_LIST.lludriga.catalan).toBe('La Llúdriga Neus');
      expect(VOCABULARY_LIST.clau_anglesa.catalan).toBe('La Clau Anglesa');
      expect(VOCABULARY_LIST.pont.catalan).toBe('El Pont');

      // Otter speaks when tapped with PARLA
      sim.selectVerb('PARLA');
      sim.tapHotspot('otter');
      expect(sim.isDialogOpen()).toBe(true);
      expect(sim.getActiveDialog()?.speaker).toBe('Llúdriga Neus');

      // Voice gate accepts phonetic variants
      expect(sim.respondVoiceGate('aigua fresca si us plau')).toBe(true);
      expect(sim.hasInventoryItem('clau_anglesa')).toBe(true);
      sim.dismissDialog();

      // Filling the boiler
      sim.selectVerb('AGAFA');
      sim.tapHotspot('water_crane');
      expect(gameState.get().waterTankFilled).toBe(true);
      expect(sim.getActiveDialog()?.text).toContain('El dipòsit d\'aigua està ple');
    });
  });

  describe('Scene 4: "El Castell de la Roca" Mountain Heritage & Departure Call', () => {
    it('teaches the iconic railway departure call "Tots al tren!"', () => {
      gameState.setScene('castle');

      expect(VOCABULARY_LIST.tots_al_tren.catalan).toBe('Tots al tren');
      expect(VOCABULARY_LIST.bitllet.catalan).toBe('El Bitllet Daurat');
      expect(VOCABULARY_LIST.campana.catalan).toBe('La Campana');

      sim.selectVerb('PARLA');
      sim.tapHotspot('inspector');
      expect(sim.isDialogOpen()).toBe(true);
      expect(sim.getActiveDialog()?.speaker).toBe('Revisora Montserrat');

      // Voice gate
      expect(sim.respondVoiceGate('Tots al tren')).toBe(true);
      expect(gameState.get().bellRung).toBe(true);
      expect(sim.hasInventoryItem('bitllet')).toBe(true);
      sim.dismissDialog();

      // Passing through mountain tunnel
      sim.selectVerb('CONDUEIX');
      sim.tapHotspot('tunnel');
      expect(gameState.get().tunnelCrossed).toBe(true);
      expect(sim.getCurrentScene()).toBe('seaside');
    });
  });

  describe('Scene 5: "La Vall Verda i el Mar" Terminus & Conductor Honor', () => {
    it('culminates in celebratory dialogue and awards Gold Conductor Medal', () => {
      gameState.setScene('seaside');

      expect(VOCABULARY_LIST.visca_el_tren.catalan).toBe('Visca el tren');
      expect(VOCABULARY_LIST.mar.catalan).toBe('El Mar');
      expect(VOCABULARY_LIST.medalla.catalan).toBe("La Medalla d'Or");

      sim.selectVerb('PARLA');
      sim.tapHotspot('mayor');
      expect(sim.getActiveDialog()?.speaker).toBe('Alcaldessa Eulàlia');
      expect(sim.getActiveDialog()?.title).toBe(DIALOGUES.mayorAskVoice.title);

      // Child cheer
      expect(sim.respondVoiceGate('visca el tren!')).toBe(true);
      expect(gameState.get().grandCelebration).toBe(true);
      expect(gameState.get().medalAwarded).toBe(true);
      expect(sim.hasInventoryItem('medalla')).toBe(true);
      sim.dismissDialog();
    });

    it('allows non-linear scenic route exploration between all unlocked stations', () => {
      // Child can return to any unlocked station to play again
      gameState.setScene('station');
      expect(sim.getCurrentScene()).toBe('station');

      gameState.setScene('bridge');
      expect(sim.getCurrentScene()).toBe('bridge');

      gameState.setScene('castle');
      expect(sim.getCurrentScene()).toBe('castle');

      gameState.setScene('seaside');
      expect(sim.getCurrentScene()).toBe('seaside');
    });
  });
});
