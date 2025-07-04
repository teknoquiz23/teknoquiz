import { describe, it, expect } from 'vitest';
import { getYearHint, getLastChanceHint, getNewHint } from './getHints';

// Sample roundInfo for tests
const roundInfo = {
  'Country': 'Spain',
  'Party': 'Teknival',
  'Sound system': ['Spiral Tribe', 'Desert Storm'],
  'Year': '1996'
};

describe('Hint functions', () => {
 
  // it('getCountryHint level 1', () => {
  //   expect(getNewHint(roundInfo, 'Country', 1)).toContain('SXXXX');
  // });
  // it('getCountryHint level 2', () => {
  //   expect(getNewHint(roundInfo, 'Country', 2)).toContain('SPXXX');
  // });
  // it('getPartyHint level 1', () => {
  //   expect(getNewHint(roundInfo, 'Party', 1)).toContain('TEXXXXXX');
  // });
  // it('getPartyHint level 2', () => {
  //   expect(getNewHint(roundInfo, 'Party', 2)).toContain('TEKXXXXX');
  // });
  // it('getSoundHint level 1', () => {
  //   expect(getNewHint(roundInfo, 'Sound system', 1)).toContain('SXXXXX TXXXX');
  // });
  // it('getSoundHint level 2', () => {
  //   expect(getNewHint(roundInfo, 'Sound system', 2)).toContain('SPXXXX TRXXX');
  // });
  // it('getYearHint level 1', () => {
  //   expect(getYearHint({ roundInfo, correctReponses: [] }, false, '1990', 1)).toContain('year');
  // });
  // it('getYearHint level 2', () => {
  //   expect(getYearHint({ roundInfo, correctReponses: [] }, false, '1990', 2)).toContain('1XX6');
  // });
  // it('getLastChanceHint for Party', () => {
  //   const appState = { roundInfo, correctReponses: ['Country', 'Sound system:Spiral Tribe', 'Sound system:Desert Storm', 'Year'] };
  //   expect(getLastChanceHint(appState, 'Party')).toContain('TEK');
  // });
  // it('getLastChanceHint for Country', () => {
  //   const appState = { roundInfo, correctReponses: ['Party', 'Sound system:Spiral Tribe', 'Sound system:Desert Storm', 'Year'] };
  //   expect(getLastChanceHint(appState, 'Country')).toContain('SP');
  // });

  // it('getLastChanceHint for Year', () => {
  //   const appState = { roundInfo, correctReponses: ['Party', 'Country', 'Sound system:Spiral Tribe', 'Sound system:Desert Storm'] };
  //   expect(getLastChanceHint(appState, 'Year')).toContain('1XX6');
  // });
  //  it('getLastChanceHint for Sound system', () => {
  //   const appState = { roundInfo, correctReponses: ['Party', 'Country', 'Year', 'Sound system:Spiral Tribe'] };
  //   const result = getLastChanceHint(appState, 'Sound system');
  //   expect(result).toContain('DEXXXX');
  // });
  // it('getNextUnansweredMultipleItem returns next unanswered sound system', () => {
  //   const roundInfo = {
  //     'Country': 'Spain',
  //     'Party': 'Teknival',
  //     'Sound system': ['Spiral Tribe', 'Desert Storm', 'Total Resistance'],
  //     'Year': '1996'
  //   };
  //   const correctReponses = ['Party', 'Country', 'Year', 'Sound system:Spiral Tribe'];
  //   const result = getNextUnansweredMultipleItem(roundInfo, correctReponses);
  //   expect(result).toEqual({ key: 'Sound system', item: 'Desert Storm' });
  // });
  it('getNewHint returns masked hint for first unresolved key', () => {
    const appState = {
      roundInfo,
      correctReponses: [],
      correctResObject: {},
      triesUsed: 0,
      currentImage: '',
      roundImage: 1
    };
    const result = getNewHint(appState, 1);
    expect(result).toContain('💡 Country: SXXXX');
  });
  
});
