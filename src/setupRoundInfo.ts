import { parties } from './parties'

export function setupRoundInfo(appState: {
  currentImage: string;
  roundInfo: { [key: string]: string | string[] };
}) {
  const randomParty = parties[Math.floor(Math.random() * parties.length)]
  appState.currentImage = randomParty.id

  const filtered: { [key: string]: string | string[] } = {}
  for (const [k, v] of Object.entries(randomParty)) {
    if (k === 'id') continue
    if (typeof v === 'string' || (Array.isArray(v) && v.every(x => typeof x === 'string'))) {
      filtered[k] = v
    }
  }
  appState.roundInfo = filtered
}
©