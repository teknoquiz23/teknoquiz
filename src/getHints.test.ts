import { describe, it, expect } from 'vitest';
import { getCountryHint, getPartyHint, getSoundHint, getYearHint, getLastChanceHint } from './getHints';

// Sample roundInfo for tests
const roundInfo = {
  'Country': 'Spain',
  'Party': 'Teknival',
  'Sound system': ['Spiral Tribe', 'Desert Storm'],
  'Year': '1996'
};

describe('Hint functions', () => {
  it('getCountryHint level 1', () => {
    expect(getCountryHint(roundInfo)).toContain('SXXXX');
  });
  it('getCountryHint level 2', () => {
    expect(getCountryHint(roundInfo, 2)).toContain('SPXXX');
  });
  it('getPartyHint level 1', () => {
    expect(getPartyHint(roundInfo)).toContain('TEXXXXXX');
  });
  it('getPartyHint level 2', () => {
    expect(getPartyHint(roundInfo, 2)).toContain('TEKXXXXX');
  });
  it('getSoundHint level 1', () => {
    expect(getSoundHint(roundInfo, [], 1)).toContain('SXXXXX TXXXX');
  });
  it('getSoundHint level 2', () => {
    expect(getSoundHint(roundInfo, [], 2)).toContain('SPXXXX TRXXX');
  });
  it('getYearHint level 1', () => {
    expect(getYearHint({ roundInfo, correctReponses: [] }, false, '1990', 1)).toContain('year');
  });
  it('getYearHint level 2', () => {
    expect(getYearHint({ roundInfo, correctReponses: [] }, false, '1990', 2)).toContain('1XX6');
  });
  it('getLastChanceHint for Party', () => {
    const appState = { roundInfo, correctReponses: ['Country', 'Sound system:Spiral Tribe', 'Sound system:Desert Storm', 'Year'] };
    expect(getLastChanceHint(appState)).toContain('TEK');
  });
  it('getLastChanceHint for Country', () => {
    const appState = { roundInfo, correctReponses: ['Party', 'Sound system:Spiral Tribe', 'Sound system:Desert Storm', 'Year'] };
    expect(getLastChanceHint(appState)).toContain('SP');
  });
  it('getLastChanceHint for Sound system', () => {
    const appState = { roundInfo, correctReponses: ['Party', 'Country', 'Year', 'Sound system:Spiral Tribe'] };
    expect(getLastChanceHint(appState)).toContain('DEXXXX');
    expect(getLastChanceHint(appState)).toContain('STXXX');
  });
  it('getLastChanceHint for Year', () => {
    const appState = { roundInfo, correctReponses: ['Party', 'Country', 'Sound system:Spiral Tribe', 'Sound system:Desert Storm'] };
    expect(getLastChanceHint(appState)).toContain('1XX6');
  });
});
