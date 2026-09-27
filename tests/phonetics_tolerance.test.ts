/**
 * Catalan Phonetics & Accent Tolerance Test Suite
 * Tests fuzzy matching algorithms against child speech variations,
 * diacritics stripping, token containment, and false rejection/acceptance.
 */

import { describe, it, expect } from 'vitest';
import {
  matchesCatalanToken,
  normalizeCatalanText,
  VOCABULARY_LIST
} from '../src/data/catalanVocabulary';

describe('Catalan Phonetics & Child Speech Tolerance', () => {
  describe('Text Normalization', () => {
    it('strips accents, punctuation, and casing cleanly', () => {
      expect(normalizeCatalanText("L'Estació dels Pins!")).toBe('lestacio dels pins');
      expect(normalizeCatalanText('OBRE LA VIA, SI US PLAU')).toBe('obre la via si us plau');
      expect(normalizeCatalanText('Carbó')).toBe('carbo');
      expect(normalizeCatalanText('Llúdriga')).toBe('lludriga');
      expect(normalizeCatalanText('¿Endavant?')).toBe('endavant');
    });
  });

  describe('Scene 1: "Obre la via" (Open the track)', () => {
    const tokens = VOCABULARY_LIST.obre_via.acceptedRecognitionTokens;

    it('accepts exact pronunciation', () => {
      expect(matchesCatalanToken('obre la via', tokens)).toBe(true);
    });

    it('accepts child variations with accents or casing', () => {
      expect(matchesCatalanToken('Obre La Via', tokens)).toBe(true);
      expect(matchesCatalanToken('obre via', tokens)).toBe(true);
      expect(matchesCatalanToken('obre', tokens)).toBe(true);
    });

    it('accepts phonetic variants commonly uttered by 5-year-olds', () => {
      // Catalan dialectal variant "obri"
      expect(matchesCatalanToken('obri la via', tokens)).toBe(true);
      expect(matchesCatalanToken('obri via', tokens)).toBe(true);
      expect(matchesCatalanToken('obra la via', tokens)).toBe(true);
    });

    it('accepts phrase embedded with polite expressions', () => {
      expect(matchesCatalanToken('obre la via si us plau', tokens)).toBe(true);
      expect(matchesCatalanToken('hola obre la via', tokens)).toBe(true);
    });

    it('rejects completely unrelated words', () => {
      expect(matchesCatalanToken('poma vermella', tokens)).toBe(false);
      expect(matchesCatalanToken('gat i gos', tokens)).toBe(false);
      expect(matchesCatalanToken('anem a dormir', tokens)).toBe(false);
    });
  });

  describe('Scene 3: "Aigua fresca" (Fresh water)', () => {
    const tokens = VOCABULARY_LIST.aigua_fresca.acceptedRecognitionTokens;

    it('accepts clear child pronunciation', () => {
      expect(matchesCatalanToken('aigua fresca', tokens)).toBe(true);
      expect(matchesCatalanToken('Aigua Fresca!', tokens)).toBe(true);
    });

    it('accepts short forms', () => {
      expect(matchesCatalanToken('aigua', tokens)).toBe(true);
      expect(matchesCatalanToken('aigua de riu', tokens)).toBe(true);
    });

    it('rejects non-matching phrases', () => {
      expect(matchesCatalanToken('xocolata desfeta', tokens)).toBe(false);
      expect(matchesCatalanToken('volem pa amb tomaquet', tokens)).toBe(false);
    });
  });

  describe('Scene 4: "Tots al tren" (All aboard)', () => {
    const tokens = VOCABULARY_LIST.tots_al_tren.acceptedRecognitionTokens;

    it('accepts "tots al tren" and child approximations', () => {
      expect(matchesCatalanToken('tots al tren', tokens)).toBe(true);
      expect(matchesCatalanToken('tots al tre', tokens)).toBe(true);
      expect(matchesCatalanToken('al tren', tokens)).toBe(true);
      expect(matchesCatalanToken('tots al tren nois', tokens)).toBe(true);
    });

    it('rejects incorrect words', () => {
      expect(matchesCatalanToken('tinc son', tokens)).toBe(false);
      expect(matchesCatalanToken('avió que vola', tokens)).toBe(false);
    });
  });

  describe('Scene 5: "Visca el tren" (Hurray for the train)', () => {
    const tokens = VOCABULARY_LIST.visca_el_tren.acceptedRecognitionTokens;

    it('accepts celebration cheers', () => {
      expect(matchesCatalanToken('visca el tren', tokens)).toBe(true);
      expect(matchesCatalanToken('visca!', tokens)).toBe(true);
      expect(matchesCatalanToken('visca el maquinista', tokens)).toBe(true);
      expect(matchesCatalanToken('visca tren', tokens)).toBe(true);
    });

    it('rejects random noise words', () => {
      expect(matchesCatalanToken('cadira blava', tokens)).toBe(false);
    });
  });

  describe('All 5-Scene Target Vocabulary Syllables', () => {
    it('verifies all vocabulary entries have non-empty child syllables', () => {
      for (const [key, word] of Object.entries(VOCABULARY_LIST)) {
        expect(word.id).toBe(key);
        expect(word.syllables.length).toBeGreaterThan(0);
        expect(word.phoneticHint.length).toBeGreaterThan(0);
        expect(word.acceptedRecognitionTokens.length).toBeGreaterThan(0);
      }
    });
  });
});
