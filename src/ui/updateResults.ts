export function updateResultsUI(appState: any) {
  if (!appState.roundInfo || !appState.correctResObject) return;
  Object.keys(appState.correctResObject).forEach((key: string) => {
    const selector = getResultSelector(key);
    const el = document.querySelector(selector);
    if (!el) return;
    const correctValues = Array.isArray(appState.correctResObject[key])
      ? appState.correctResObject[key].map((v: string) => v.toLowerCase().trim())
      : [String(appState.correctResObject[key]).toLowerCase().trim()];
    const roundValues = appState.roundInfo[key];
    const values = Array.isArray(roundValues) ? roundValues : [roundValues];
    el.textContent = values
      .map((val: string) =>
        correctValues.includes(String(val).toLowerCase().trim()) ? `✅ ${val}` : ''
      )
      .join(' ');
  });
}

export function getResultSelector(key: string): string {
  return `.result-${key.toLowerCase().replace(/\s+/g, '-')}`;
}
