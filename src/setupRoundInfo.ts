import { parties } from './parties'

export function setupRoundInfo(appState: {
  currentImage: string;
  roundInfo: { [key: string]: string };
}) {
  const randomParty = parties[Math.floor(Math.random() * parties.length)]
  appState.currentImage = randomParty.id
  const roundInfo: { [key: string]: string } = {}
  Object.entries(randomParty).forEach(([k, v]) => {
    if (k !== 'id' && typeof v === 'string') roundInfo[k] = v
  })
  appState.roundInfo = roundInfo
}
