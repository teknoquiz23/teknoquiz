import { appState, type AppState } from '../state/appState';
import { getImageFolder } from '../initGame';

export function increaseTriesUsed() {
  appState.triesUsed++;
  const triesEl = document.getElementById('tries-used');
  if (triesEl) {
    triesEl.textContent = `${appState.triesUsed}`;
  }
  const triesUsedText = document.getElementById('tries-used-text');
  if (triesUsedText) {
    shakeText(triesUsedText);
  }
}

export function shakeText(element: HTMLElement) {
  element.classList.remove('shake', 'text-red');
  void element.offsetWidth; // force reflow
  element.classList.add('shake', 'text-red');
  const removeShake = () => {
    element.classList.remove('shake', 'text-red');
    element.removeEventListener('animationend', removeShake);
  };
  element.addEventListener('animationend', removeShake);
}

export function showNextImage(appState: AppState) {
  const MAX_IMAGES = 3;
  appState.roundImage++;
  // Update image number counter
  const imgCounter = document.getElementById('round-image-counter');
  if (imgCounter) {
    imgCounter.textContent = `Image ${appState.roundImage} of ${MAX_IMAGES}`;
  }
  // Next image logic
  const img = document.querySelector('.game img') as HTMLImageElement;
  if (img) img.src = `${getImageFolder()}${appState.currentImage}-${appState.roundImage}.png`;
}

export function updateCorrectResponsesProgressBar(appState: AppState) {
  const roundInfoCount = Object.values(appState.roundInfo).reduce((acc, val) => acc + (Array.isArray(val) ? val.length : 1), 0);
  const countCorrectResObject = Object.values(appState.correctResObject).reduce((acc, val) => acc + (Array.isArray(val) ? val.length : 1), 0);
  const correctResponsesEl = document.getElementById('correct-responses');
  correctResponsesEl && (correctResponsesEl.textContent = `${countCorrectResObject}`);
  const progressBarResponses = document.querySelector('#progress-bar-responses .progress-bar-fill');
  if (progressBarResponses) {
    const percentage = Math.round((countCorrectResObject / roundInfoCount) * 100);
    (progressBarResponses as HTMLElement).style.width = `${percentage}%`;
  }
}

export function updateTriesProgressBar(appState: AppState) {
  const countTriesUsed = appState.triesUsed;
  const triesEl = document.getElementById('tries-used');
  triesEl && (triesEl.textContent = `${countTriesUsed}`);
  const progressBarTries = document.querySelector('#progress-bar-tries .progress-bar-fill');
  if (progressBarTries) {
    const percentage = Math.round((countTriesUsed / appState.maxTries) * 100);
    (progressBarTries as HTMLElement).style.width = `${percentage}%`;
  }
}

export function getMaxTries(roundInfo: { [key: string]: string | string[] }): number {
  // Calculate max tries based on the number of items in roundInfo, counting each array element
  const numItems = Object.values(roundInfo).reduce((acc, val) => acc + (Array.isArray(val) ? val.length : 1), 0);
  const maxTries = Math.max(10, numItems * 3); // Ensure at least 10 tries
  return maxTries;
}

export function isMultipleResponse(roundInfo: { [key: string]: string | string[] }, responseValue: string): boolean {
  // Verifica si responseValue se encuentra dentro de algún array en roundInfo y que el array tenga más de un elemento
  const normalized = (str: string) => str.trim().toLowerCase();
  for (const value of Object.values(roundInfo)) {
    if (Array.isArray(value) && value.length > 1) {
      if (value.some(v => normalized(String(v)) === normalized(responseValue))) {
        return true;
      }
    }
  }
  return false;
}
