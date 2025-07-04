import { describe, it, expect } from 'vitest';
import { getLastChanceHint, getNewHint, maskHint, getRemainingItems } from './getHints';

// Sample roundInfo for tests
const roundInfo = {
  'Country': 'Spain',
  'Party': 'Teknival',
  'Sound system': ['Spiral Tribe', 'Desert Storm'],
  'Year': '1996'
};

describe('Hint functions', () => {
 
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

describe('maskHint', () => {
  it('should mask with 1 char for level 1', () => {
    expect(maskHint('Spain', 1)).toBe('SXXXX');
  });

  it('should mask with 2 chars for level 2', () => {
    expect(maskHint('Spain', 2)).toBe('SPXXX');
  });

});


describe('getLastChanceHint', () => {
  it('should return a last chance hint with masked value', () => {
    const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe', 'Desert Storm'],
        Year: '1996'
      },
      correctReponses: [],
      correctResObject: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe'],
        Year: '1996'
      },
      triesUsed: 0,
      currentImage: '',
      roundImage: 1
    };
    const result = getLastChanceHint(appState);
    expect(result).toContain('💎 LAST CHANCE!');
    expect(result).toContain('Sound system');
    expect(result).toMatch(/DEXXX/i); // Should contain a masked version of "Desert Storm"
  });
});

describe('getNewHint', () => {
  it('should return a masked hint for the first unresolved key', () => {
    const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe', 'Desert Storm'],
        Year: '1996'
      },
      correctReponses: [],
      correctResObject: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe'],
        Year: '1996'
      },
      triesUsed: 0,
      currentImage: '',
      roundImage: 1
    };
    const result = getNewHint(appState, 1);
    expect(result).toContain('💡 Sound system: DXXXX');
  });

  it('should return "No more hints available" if all are resolved', () => {
    const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain'
      },
      correctReponses: [],
      correctResObject: {
        Party: 'Teknival',
        Country: 'Spain'
      },
      triesUsed: 0,
      currentImage: '',
      roundImage: 1
    };
    const result = getNewHint(appState, 1);
    expect(result).toBe('No more hints available');
  });
});

describe('getRemainingItems', () => {
  it('should return all items if nothing is resolved', () => {
    const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe', 'Desert Storm'],
        Year: '1996'
      },
      correctResObject: {}
    } as any;;
    expect(getRemainingItems(appState)).toEqual({
      Party: ['Teknival'],
      Country: ['Spain'],
      'Sound system': ['Spiral Tribe', 'Desert Storm'],
      Year: ['1996']
    });
  });

  it('should return only unresolved items', () => {
    const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe', 'Desert Storm'],
        Year: '1996'
      },
      correctResObject: {
        Party: 'Teknival',
        'Sound system': ['Spiral Tribe']
      }
    } as any;;
    expect(getRemainingItems(appState)).toEqual({
      Country: ['Spain'],
      'Sound system': ['Desert Storm'],
      Year: ['1996']
    });
  });

  it('should return empty object if all are resolved', () => {
    const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe', 'Desert Storm'],
        Year: '1996'
      },
      correctResObject: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe', 'Desert Storm'],
        Year: '1996'
      }
    } as any; // <-- Add "as any" to avoid type issues
    expect(getRemainingItems(appState)).toEqual({});
  });

  it('should be case and whitespace insensitive', () => {
    const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe', 'Desert Storm'],
        Year: '1996'
      },
      correctResObject: {
        Party: '  teknival ',
        Country: ' spain ',
        'Sound system': [' spiral tribe '],
        Year: ' 1996 '
      }
    } as any; // <-- Add "as any" to avoid type issues;
    expect(getRemainingItems(appState)).toEqual({
      'Sound system': ['Desert Storm']
    });
  });
});
