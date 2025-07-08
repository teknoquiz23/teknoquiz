export function updateCorrectResponsesProgressBar(appState: any) {
  const roundInfoCount = Object.values(appState.roundInfo).reduce((acc: number, val: any) => acc + (Array.isArray(val) ? val.length : 1), 0);
  const countCorrectResObject = Object.values(appState.correctResObject).reduce((acc: number, val: any) => acc + (Array.isArray(val) ? val.length : 1), 0);
  const correctResponsesEl = document.getElementById('correct-responses');
  correctResponsesEl && (correctResponsesEl.textContent = `${countCorrectResObject}`);
  const progressBarResponses = document.querySelector('#progress-bar-responses .progress-bar-fill');
  if (progressBarResponses) {
    const percentage = Math.round((countCorrectResObject / roundInfoCount) * 100);
    (progressBarResponses as HTMLElement).style.width = `${percentage}%`;
  }
}

export function updateTriesProgressBar(appState: any) {
  const countTriesUsed = appState.triesUsed;
  const triesEl = document.getElementById('tries-used');
  triesEl && (triesEl.textContent = `${countTriesUsed}`);
  const progressBarTries = document.querySelector('#progress-bar-tries .progress-bar-fill');
  if (progressBarTries) {
    const percentage = Math.round((countTriesUsed / appState.maxTries) * 100);
    (progressBarTries as HTMLElement).style.width = `${percentage}%`;
  }
}

export function shakeText(element: HTMLElement) {
  element.classList.remove('shake', 'text-red');
  void element.offsetWidth;
  element.classList.add('shake', 'text-red');
  const removeShake = () => {
    element.classList.remove('shake', 'text-red');
    element.removeEventListener('animationend', removeShake);
  };
  element.addEventListener('animationend', removeShake);
}
