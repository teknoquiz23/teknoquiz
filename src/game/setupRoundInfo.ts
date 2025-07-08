export function generateInputDescription(roundInfo : { [key: string]: string | string[] }): string {
  const keys = Object.keys(roundInfo).map(key => key.toLowerCase());
  if (keys.length === 0) return '';
  if (keys.length === 1) return `Guess the ${keys[0]} based on the image`;
  if (keys.length === 2) return `Guess the ${keys[0]} and ${keys[1]} based on the image`;
  // For 3 or more keys, join with commas and 'and' before the last
  const allButLast = keys.slice(0, -1).join(', ');
  const last = keys[keys.length - 1];
  return `Guess the ${allButLast}, and ${last} based on the image`;
}

export async function setupRoundInfo(appState: any, availableParties: any[]) {
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
  appState.inputDescription = generateInputDescription(appState.roundInfo);
}
