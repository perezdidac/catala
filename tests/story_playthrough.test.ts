/**
 * Story Playthrough Test Suite
 * Headless simulation testing the complete narrative, puzzle playback,
 * dialogue triggers, voice gates, and transitions across all 5 scenes.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StorySimulator } from './StorySimulator';

describe('El Conductor de Paraules - Complete 5-Scene Story Playthrough', () => {
  let sim: StorySimulator;

  beforeEach(() => {
    sim = new StorySimulator();
  });

  it('plays through all 5 scenes from L\'Estació dels Pins to the Mediterranean Sea', () => {
    // ==========================================
    // ACT 1: L'Estació dels Pins (The Broken Junction)
    // ==========================================
    expect(sim.getCurrentScene()).toBe('station');
    expect(sim.getInventory()).toHaveLength(0);

    // 1. Child looks at the tracks with MIRA
    sim.selectVerb('MIRA');
    sim.tapHotspot('branches');
    expect(sim.isDialogOpen()).toBe(true);
    expect(sim.getActiveDialog()?.title).toBe('Via Bloquejada!');
    expect(sim.getActiveDialog()?.text).toContain('branques de pi');
    sim.dismissDialog();

    // 2. Child collects the pine branches with AGAFA
    sim.selectVerb('AGAFA');
    sim.tapHotspot('branches');
    expect(sim.hasInventoryItem('branques')).toBe(true);
    expect(sim.getActiveDialog()?.title).toBe('Molt bé!');
    sim.dismissDialog();

    // 3. Child talks to Stationmaster Pep with PARLA
    sim.selectVerb('PARLA');
    sim.tapHotspot('stationmaster');
    expect(sim.isDialogOpen()).toBe(true);
    expect(sim.getActiveDialog()?.isVoiceGate).toBe(true);
    expect(sim.getActiveDialog()?.targetPhrase).toBe('Obre la via');
    expect(sim.getActiveDialog()?.syllables).toEqual(['O', 'bre', 'la', 'vi', 'a']);

    // 4. Child speaks the magic words: "Obre la via!"
    const voiceAccepted = sim.respondVoiceGate('Obre la via');
    expect(voiceAccepted).toBe(true);
    expect(sim.getActiveDialog()?.title).toBe('Molt ben dit!');
    sim.dismissDialog();

    // 5. Child operates the switch lever
    sim.selectVerb('CONDUEIX');
    sim.tapHotspot('switch_lever');
    expect(sim.getActiveDialog()?.title).toBe('Via Oberta!');
    expect(sim.getActiveDialog()?.text).toContain('El semàfor està verd');
    sim.dismissDialog();

    // 6. Child enters the locomotive cabin
    sim.selectVerb('CONDUEIX');
    sim.tapHotspot('locomotive');
    expect(sim.getCurrentScene()).toBe('cabin');

    // ==========================================
    // ACT 2: La Cabina del Maquinista (Locomotive Cabin)
    // ==========================================
    // 7. Child pulls the steam whistle cord
    sim.tapHotspot('whistle');

    // 8. Child feeds the collected pine branches into the firebox
    expect(sim.hasInventoryItem('branques')).toBe(true);
    sim.tapHotspot('firebox');
    expect(sim.hasInventoryItem('branques')).toBe(false); // Wood consumed by fire

    // 9. Child pushes the throttle lever forward
    sim.tapHotspot('throttle_forward');

    // 10. Train steams ahead through Catalan countryside
    sim.advanceCabinSimulation(20); // 20 seconds travel
    // Journey completes and next station unlocks
    sim.dismissDialog();

    // ==========================================
    // ACT 3: El Pont del Riu d'Or (The Golden River Viaduct)
    // ==========================================
    // 11. Arrive at the bridge
    sim.tapHotspot('bridge'); // Navigates to bridge from cabin
    // In bridge scene:
    sim.selectVerb('MIRA');
    expect(sim.hasInventoryItem('clau_anglesa')).toBe(false);

    // 12. Check water crane before having the tool
    sim.selectVerb('AGAFA');
    sim.tapHotspot('water_crane');
    expect(sim.getActiveDialog()?.title).toBe('Vàlvula Tancada!');
    sim.dismissDialog();

    // 13. Speak with La Llúdriga Neus
    sim.selectVerb('PARLA');
    sim.tapHotspot('otter');
    expect(sim.isDialogOpen()).toBe(true);
    expect(sim.getActiveDialog()?.isVoiceGate).toBe(true);
    expect(sim.getActiveDialog()?.targetPhrase).toBe('Aigua fresca');
    expect(sim.getActiveDialog()?.syllables).toEqual(['Ai', 'gua', 'fres', 'ca']);

    // 14. Child speaks "Aigua fresca!"
    const otterMatched = sim.respondVoiceGate('Aigua fresca');
    expect(otterMatched).toBe(true);
    expect(sim.hasInventoryItem('clau_anglesa')).toBe(true);
    sim.dismissDialog();

    // 15. Child opens the water crane valve with the wrench
    sim.selectVerb('AGAFA');
    sim.tapHotspot('water_crane');
    expect(sim.getActiveDialog()?.title).toBe('Dipòsit Ple!');
    sim.dismissDialog();

    // 16. Child drives the train across the viaduct bridge
    sim.selectVerb('CONDUEIX');
    sim.tapHotspot('bridge');
    expect(sim.getCurrentScene()).toBe('castle');

    // ==========================================
    // ACT 4: El Castell de la Roca (Mountain Castle Station)
    // ==========================================
    // 17. Speak to Revisora Montserrat
    sim.selectVerb('PARLA');
    sim.tapHotspot('inspector');
    expect(sim.isDialogOpen()).toBe(true);
    expect(sim.getActiveDialog()?.isVoiceGate).toBe(true);
    expect(sim.getActiveDialog()?.targetPhrase).toBe('Tots al tren');
    expect(sim.getActiveDialog()?.syllables).toEqual(['Tots', 'al', 'tren']);

    // 18. Child calls out "Tots al tren!"
    const inspectorMatched = sim.respondVoiceGate('Tots al tren');
    expect(inspectorMatched).toBe(true);
    expect(sim.hasInventoryItem('bitllet')).toBe(true); // Golden ticket awarded
    sim.dismissDialog();

    // 19. Depart through the mountain tunnel
    sim.selectVerb('CONDUEIX');
    sim.tapHotspot('tunnel');
    expect(sim.getCurrentScene()).toBe('seaside');

    // ==========================================
    // ACT 5: La Vall Verda i el Mar (Coastal Terminal)
    // ==========================================
    // 20. Meet Alcaldessa Eulàlia by the beach
    sim.selectVerb('PARLA');
    sim.tapHotspot('mayor');
    expect(sim.isDialogOpen()).toBe(true);
    expect(sim.getActiveDialog()?.isVoiceGate).toBe(true);
    expect(sim.getActiveDialog()?.targetPhrase).toBe('Visca el tren');
    expect(sim.getActiveDialog()?.syllables).toEqual(['Vis', 'ca', 'el', 'tren']);

    // 21. Final celebratory cheer: "Visca el tren!"
    const mayorMatched = sim.respondVoiceGate('Visca el tren');
    expect(mayorMatched).toBe(true);
    expect(sim.hasInventoryItem('medalla')).toBe(true); // Golden Conductor Medal!
    expect(sim.getActiveDialog()?.title).toContain('El Gran Maquinista');
    sim.dismissDialog();

    // 22. Verify end-game state: child possesses legendary badges
    const inventory = sim.getInventory();
    expect(inventory.some((i) => i.id === 'clau_anglesa')).toBe(true);
    expect(inventory.some((i) => i.id === 'bitllet')).toBe(true);
    expect(inventory.some((i) => i.id === 'medalla')).toBe(true);
  });
});
