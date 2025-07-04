export function updateResultsUI(appState: any) {
  console.log('updateResultsUI', appState);
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

  // --- FIX: Use correctResObject for resolved sounds ---
  // Find which sounds are in correctResObject['Sound system']
  let resolvedSounds: string[] = [];
  if (appState.correctResObject && Array.isArray(appState.correctResObject['Sound system'])) {
    resolvedSounds = appState.correctResObject['Sound system'].map((s: string) => s.toLowerCase().trim());
  } else if (appState.correctResObject && typeof appState.correctResObject['Sound system'] === 'string') {
    resolvedSounds = [appState.correctResObject['Sound system'].toLowerCase().trim()];
  }

  el.textContent = sounds
    .map(sound =>
      resolvedSounds.includes(String(sound).toLowerCase().trim())
        ? `✅ ${sound}`
        : ''
    )
    .join(' ');
}

function updateOtherResults(appState: any) {
  if (!appState.correctResObject) return;
  Object.keys(appState.correctResObject).forEach((key: string) => {
    if (key === 'Sound system') return; // Already handled
    const selector = getResultSelector(key);
    const el = document.querySelector(selector);
    if (el) el.textContent = `✅ ${appState.roundInfo[key]}`;
  });
}

function getResultSelector(key: string): string {
  return `.result-${key.toLowerCase().replace(/\s+/g, '-')}`;
}