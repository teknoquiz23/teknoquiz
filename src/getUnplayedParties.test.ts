import { describe, it, expect } from 'vitest';

function getUnplayedParties(parties: any[], playedIds: string[]): any[] {
  return parties.filter(p => !playedIds.includes(p.id));
}

describe('getUnplayedParties', () => {
  const testParties = [
    { id: 'a', name: 'Party A' },
    { id: 'b', name: 'Party B' },
    { id: 'c', name: 'Party C' }
  ];

  it('returns all parties if playedIds is empty', () => {
    expect(getUnplayedParties(testParties, [])).toEqual(testParties);
  });

  it('returns only unplayed parties', () => {
    expect(getUnplayedParties(testParties, ['a'])).toEqual([
      { id: 'b', name: 'Party B' },
      { id: 'c', name: 'Party C' }
    ]);
  });

  it('returns empty array if all parties are played', () => {
    expect(getUnplayedParties(testParties, ['a', 'b', 'c'])).toEqual([]);
  });
});
