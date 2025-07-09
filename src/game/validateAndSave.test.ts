// LEGACY FILE - safe to delete, logic moved to /game/validateAndSave.test.ts

import { describe, it, expect } from 'vitest';
import { getKeyForInputValue } from './validateAndSave';

describe('getKeyForInputValue', () => {
  const roundInfo = {
    Party: 'Teknival',
    Country: 'Spain',
    'Sound system': ['Spiral Tribe', 'Desert Storm'],
    Year: '1996'
  };

  it('should return the key for a direct string match', () => {
    expect(getKeyForInputValue('Teknival', roundInfo)).toBe('Party');
    expect(getKeyForInputValue('spain', roundInfo)).toBe('Country');
    expect(getKeyForInputValue('1996', roundInfo)).toBe('Year');
  });

  it('should return the key for a match in an array', () => {
    expect(getKeyForInputValue('Spiral Tribe', roundInfo)).toBe('Sound system');
    expect(getKeyForInputValue('desert storm', roundInfo)).toBe('Sound system');
  });

  it('should return null if no match is found', () => {
    expect(getKeyForInputValue('France', roundInfo)).toBeNull();
    expect(getKeyForInputValue('Unknown', roundInfo)).toBeNull();
  });

  it('should be case and whitespace insensitive', () => {
    expect(getKeyForInputValue('  teknival  ', roundInfo)).toBe('Party');
    expect(getKeyForInputValue('  spiral tribe ', roundInfo)).toBe('Sound system');
  });
});
