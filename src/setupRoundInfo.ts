import { parties } from './parties'

function getPlayedGameIds(): string[] {
  const key = 'playedGameIds';
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

export function setupRoundInfo(appState: {    
  currentImage: string;
  roundInfo: { [key: string]: string | string[] };
  maxTries?: number;
}) {
  const playedIds = getPlayedGameIds();
  const availableParties = parties.filter(p => !playedIds.includes(p.id));
  const randomParty = availableParties[Math.floor(Math.random() * availableParties.length)];
  appState.currentImage = randomParty.id;

  const filtered: { [key: string]: string | string[] } = {};
  for (const [k, v] of Object.entries(randomParty)) {
    if (k === 'id') continue;
    if (typeof v === 'string' || (Array.isArray(v) && (v as unknown[]).every((x): x is string => typeof x === 'string'))) {
      filtered[k] = v;
    }
  }
  appState.roundInfo = filtered;

  // Set maxTries based on roundInfo
  appState.maxTries = getMaxTries(filtered);
}

function getMaxTries(roundInfo: { [key: string]: string | string[] }): number {
  // Calculate max tries based on the number of items in roundInfo, counting each array element
  const numItems = Object.values(roundInfo).reduce((acc, val) => acc + (Array.isArray(val) ? val.length : 1), 0);
  const maxTries = Math.max(10, numItems * 3); // Ensure at least 10 tries
  return maxTries;
}
