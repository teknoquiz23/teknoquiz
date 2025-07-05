import { describe, it, expect } from 'vitest';
import { getLastChanceHint, getNewHint, maskHint, getRemainingItems, getHintItemByPosition, getHintPosition, shouldDisplayHint } from './getHints';

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
    } as any;
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




describe('getHintItemByPosition', () => {
  
  const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe', 'Desert Storm'],
        Year: '1996'
      },
      correctResObject: {
      Party: 'Teknival'
      },
      triesUsed: 0,
      currentImage: '',
      roundImage: 1
  };
  const hint1 = {Country: 'Spain'}
  const hint2 = {'Sound system': 'Spiral Tribe'}
  const hint3 = {'Sound system': 'Desert Storm'}
  const hint4 = {'Year': '1996'}

  it('should find the first roundInfo item that can\'t be found on correctResObject', () => {
    expect(getHintItemByPosition(1, appState)).toEqual(hint1);
  });

  it('should find the second roundInfo item that can\'t be found on correctResObject', () => {
    expect(getHintItemByPosition(2, appState)).toEqual(hint2);
  });

  it('should find the third roundInfo item that can\'t be found on correctResObject', () => {
    expect(getHintItemByPosition(3, appState)).toEqual(hint3);
  });

  it('should find the fourth roundInfo item that can\'t be found on correctResObject', () => {
    expect(getHintItemByPosition(4, appState)).toEqual(hint4);
  });
});


describe('getHintPosition', () => {
  it('Should return the correct hint position based on triesUsed, num items roundInfo (including values in arrays) in  and MAX_TRIES', () => {
    const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe', 'Desert Storm'],
        Year: '1996'
      },
      correctResObject: {
        Party: 'Teknival'
      },
      triesUsed: 0,
      currentImage: '',
      roundImage: 1
    } as any; // <-- Add "as any" to avoid type issues
    const MAX_TRIES = 15;
    expect(getHintPosition(appState, MAX_TRIES)).toEqual(1);
  });
  it('Should return the correct hint position based on triesUsed and MAX_TRIES', () => {
    const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe', 'Desert Storm'],
        Year: '1996'
      },
      correctResObject: {
        Party: 'Teknival'
      },
      triesUsed: 4,
      currentImage: '',
      roundImage: 1
    } as any; // <-- Add "as any" to avoid type issues
    const MAX_TRIES = 15;
    expect(getHintPosition(appState, MAX_TRIES)).toEqual(2);
  });
  it('Should return the correct hint position based on triesUsed and MAX_TRIES', () => {
    const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe', 'Desert Storm'],
        Year: '1996'
      },
      correctResObject: {
        Party: 'Teknival'
      },
      triesUsed: 7,
      currentImage: '',
      roundImage: 1
    } as any; // <-- Add "as any" to avoid type issues
    const MAX_TRIES = 15;
    expect(getHintPosition(appState, MAX_TRIES)).toEqual(3);
  });
    it('Should return the correct hint position based on triesUsed and MAX_TRIES', () => {
    const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe', 'Desert Storm'],
        Year: '1996'
      },
      correctResObject: {
        Party: 'Teknival'
      },
      triesUsed: 10,
      currentImage: '',
      roundImage: 1
    } as any; // <-- Add "as any" to avoid type issues
    const MAX_TRIES = 15;
    expect(getHintPosition(appState, MAX_TRIES)).toEqual(4);
  });
  it('Should return the correct hint position based on triesUsed and MAX_TRIES', () => {
    const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        Year: '1996'
      },
      correctResObject: {
        Party: 'Teknival'
      },
      triesUsed: 7,
      currentImage: '',
      roundImage: 1
    } as any; // <-- Add "as any" to avoid type issues
    const MAX_TRIES = 12;
    expect(getHintPosition(appState, MAX_TRIES)).toEqual(2);
  });
});

describe('shouldDisplayHint', () => {

  it('Should use triesUsed, MAX_TRIES and roundInfo to understand if we should show a hint', () => {
    const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe', 'Desert Storm']
     },
      triesUsed: 0
    }as any;
    const MAX_TRIES = 12;

    expect(shouldDisplayHint(appState, MAX_TRIES)).toEqual(false);
  });

  it('Should use triesUsed, MAX_TRIES and roundInfo to understand if we should show a hint', () => {
    const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe', 'Desert Storm']
     },
      triesUsed: 3
    }as any;
    const MAX_TRIES = 12;
    expect(shouldDisplayHint(appState, MAX_TRIES)).toEqual(false);
  });

  it('Should use triesUsed, MAX_TRIES and roundInfo to understand if we should show a hint', () => {
    const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe', 'Desert Storm']
     },
      triesUsed: 6
    }as any; // <-- Add "as any" to avoid type issues;
    const MAX_TRIES = 12;
    expect(shouldDisplayHint(appState, MAX_TRIES)).toEqual(false);
  });

  it('Should use triesUsed, MAX_TRIES and roundInfo to understand if we should show a hint', () => {
    const appState = {
        roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe', 'Desert Storm']
     },
      triesUsed: 4
    }as any;
    const MAX_TRIES = 12;
    expect(shouldDisplayHint(appState, MAX_TRIES)).toEqual(false);
  });
  it('Should use triesUsed, MAX_TRIES and roundInfo to understand if we should show a hint', () => {
    const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        'Sound system': ['Spiral Tribe', 'Desert Storm']
     },
      triesUsed: 7
    }as any;
    const MAX_TRIES = 12;
    expect(shouldDisplayHint(appState, MAX_TRIES)).toEqual(true);
  });
  it('Should use triesUsed, MAX_TRIES and roundInfo to understand if we should show a hint', () => {
    const appState = {
      roundInfo: {
        Party: 'Teknival',
        Country: 'Spain',
        Year: '1996'

     },
      triesUsed: 3
    }as any;
    const MAX_TRIES = 12;
    expect(shouldDisplayHint(appState, MAX_TRIES)).toEqual(true);
  });
});
