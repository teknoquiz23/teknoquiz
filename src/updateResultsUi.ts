export function updateResultsUI(appState: any) {
  if (!appState.roundInfo) return;
  updateSoundSystemResults(appState);
  updateOtherResults(appState);
}

function updateSoundSystemResults(appState: any) {
  const soundSystems = appState.roundInfo['Sound system'];
  if (!soundSystems) return;
  const selector = `.result-sound-system`;
  const el = document.querySelector(selector);
  if (!el) return;
  const sounds = Array.isArray(soundSystems) ? soundSystems : [soundSystems];
  el.textContent = sounds
    .map(sound =>
      Array.isArray(appState.correctReponses) && appState.correctReponses.includes('Sound system:' + sound)
        ? `✅ ${sound}`
        : ''
    )
    .join(' ');
}

function updateOtherResults(appState: any) {
  if (!Array.isArray(appState.correctReponses)) return;
  appState.correctReponses.forEach((key: string) => {
    if (key.startsWith('Sound system:')) return; // Already handled
    const selector = getResultSelector(key);
    const el = document.querySelector(selector);
    if (el) el.textContent = `✅ ${appState.roundInfo[key]}`;
  });
}

function getResultSelector(key: string): string {
  return `.result-${key.toLowerCase().replace(/\s+/g, '-')}`;
}