import { describe, it, expect } from 'vitest';
import { getYearHint, getLastChanceHint, getSingleHint, getNextUnansweredMultipleItem } from './getHints';

// Sample roundInfo for tests
const roundInfo = {
  'Country': 'Spain',
  'Party': 'Teknival',
  'Sound system': ['Spiral Tribe', 'Desert Storm'],
  'Year': '1996'
};

describe('Hint functions', () => {
 
  it('getCountryHint level 1', () => {
    expect(getSingleHint(roundInfo, 'Country', 1)).toContain('SXXXX');
  });
  it('getCountryHint level 2', () => {
    expect(getSingleHint(roundInfo, 'Country', 2)).toContain('SPXXX');
  });
  it('getPartyHint level 1', () => {
    expect(getSingleHint(roundInfo, 'Party', 1)).toContain('TEXXXXXX');
  });
  it('getPartyHint level 2', () => {
    expect(getSingleHint(roundInfo, 'Party', 2)).toContain('TEKXXXXX');
  });
  it('getSoundHint level 1', () => {
    expect(getSingleHint(roundInfo, 'Sound system', 1)).toContain('SXXXXX TXXXX');
  });
  it('getSoundHint level 2', () => {
    expect(getSingleHint(roundInfo, 'Sound system', 2)).toContain('SPXXXX TRXXX');
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

  it('getLastChanceHint for Year', () => {
    const appState = { roundInfo, correctReponses: ['Party', 'Country', 'Sound system:Spiral Tribe', 'Sound system:Desert Storm'] };
    expect(getLastChanceHint(appState)).toContain('1XX6');
  });
   it('getLastChanceHint for Sound system', () => {
    const appState = { roundInfo, correctReponses: ['Party', 'Country', 'Year', 'Sound system:Spiral Tribe'] };
    const result = getLastChanceHint(appState);
    expect(result).toContain('DEXXXX');
  });
  it('getNextUnansweredMultipleItem returns next unanswered sound system', () => {
    const roundInfo = {
      'Country': 'Spain',
      'Party': 'Teknival',
      'Sound system': ['Spiral Tribe', 'Desert Storm', 'Total Resistance'],
      'Year': '1996'
    };
    const correctReponses = ['Party', 'Country', 'Year', 'Sound system:Spiral Tribe'];
    const result = getNextUnansweredMultipleItem(roundInfo, correctReponses);
    expect(result).toEqual({ key: 'Sound system', item: 'Desert Storm' });
  });
  
});
