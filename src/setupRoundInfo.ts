import { parties } from './parties'

function getPlayedGameIds(): string[] {
  const key = 'playedGameIds';
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

export function setupRoundInfo(appState: {    
  currentImage: string;
  roundInfo: { [key: string]: string | string[] };
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
}
