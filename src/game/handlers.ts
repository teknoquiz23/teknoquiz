// Handler and helper functions migrated from main.ts for modularization
import { getYearHint, getLastChanceHint, getRemainingItems, getHint, shouldDisplayHint } from '../getHints';
import { updateResultsUI } from '../updateResultsUi';
import { validateAndSaveResponse } from '../validateAndSave';
import { playErrorSound, playWinnerSound, playHintSound, playCorrectSound } from '../playSounds';
import { loadAndTriggerConfetti } from '../confetti';
import Hint from '../components/Hint.vue';
import { createApp } from 'vue';
import { getImageFolder } from '../initGame';

const MAX_IMAGES = 3;
const IMAGE_ERRORS_THRESHOLD = 3;
let hintApp: any = null;

declare function gtag(...args: any[]): void;

export function handleResponse(responseValue: string, appState: any) {
  deleteHint();
  if (!responseValue || !appState.roundInfo) return;
  const isCorrect = validateAndSaveResponse(responseValue, appState);
  if (isCorrect) {
    handleCorrectResponse(responseValue, appState);
  } else {
    handleIncorrectResponse(responseValue, appState, isCorrect);
  }
}

export function handleCorrectResponse(responseValue: string, appState: any) {
  if (isWinner(appState)) {
    gameWinner(appState);
  } else if (isMultipleResponse(appState.roundInfo, responseValue)) {
    const hintMessage = getHint(appState, 1);
    playCorrectSound();
    displayHint(`<b>✅ Correct!</b><br>${hintMessage}`);
    updateResultsUI(appState);
  } else {
    playCorrectSound();
    displayHint(`<b>✅ Correct!</b>`);
    updateResultsUI(appState);
  }
  updateCorrectResponsesProgressBar(appState);
  gtag('event', 'CorrectResponse', {
    event_category: 'Responses',
    event_label: appState.roundInfo['id'] || '',
    value: 1
  });
}

export function handleIncorrectResponse(responseValue: string, appState: any, isCorrect: boolean = false) {
  gtag('event', 'IncorrectResponse', {
    event_category: 'Responses',
    event_label: appState.roundInfo['id'] || '',
    value: 1
  });
  increaseTriesUsed(appState);
  playErrorSound(appState.triesUsed, appState.maxTries);
  updateTriesProgressBar(appState);
  if (appState.triesUsed % IMAGE_ERRORS_THRESHOLD === 0 && appState.roundImage < MAX_IMAGES) {
    showNextImage(appState);
  }
  if (appState.triesUsed >= appState.maxTries) {
    gameOver(appState);
    return;
  }
  handleHint(responseValue, appState, isCorrect);
}

export function handleHint(responseValue: string, appState: any, isCorrect: boolean = false) {
  const remainingItems = getRemainingItems(appState);
  if (isLastChance(appState, remainingItems)) {
    displayHint(getLastChanceHint(appState));
    playHintSound();
    return;
  } else if (Number(responseValue)) {
    const yearHint = getYearHint(appState, isCorrect, responseValue);
    displayHint(`${yearHint}`);
    playHintSound();
    return;
  } else if (shouldDisplayHint(appState)) {
    const hintMessage = getHint(appState, 1);
    displayHint(hintMessage.trim());
    playHintSound();
  }
}

export function isWinner(appState: any): boolean {
  const remainingItems = getRemainingItems(appState);
  for (const prop in remainingItems) {
    if (Object.hasOwn(remainingItems, prop)) {
      return false;
    }
  }
  return true;
}

export function isMultipleResponse(roundInfo: { [key: string]: string | string[] }, responseValue: string): boolean {
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

export function updateCorrectResponsesProgressBar(appState: any) {
  const roundInfoCount = Object.values(appState.roundInfo).reduce((acc: number, val) => acc + (Array.isArray(val) ? val.length : 1), 0);
  const countCorrectResObject = Object.values(appState.correctResObject).reduce((acc: number, val) => acc + (Array.isArray(val) ? val.length : 1), 0);
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

export function showNextImage(appState: any) {
  appState.roundImage++;
  const imgCounter = document.getElementById('round-image-counter');
  if (imgCounter) {
    imgCounter.textContent = `Image ${appState.roundImage} of ${MAX_IMAGES}`;
  }
  const img = document.querySelector('.game img') as HTMLImageElement;
  if (img) img.src = `${getImageFolder()}${appState.currentImage}-${appState.roundImage}.png`;
}

export function gameWinner(appState: any) {
  const gameDiv = document.querySelector('.game') as HTMLElement;
  const youWin = document.getElementById('you-win') as HTMLElement;
  if (gameDiv) gameDiv.style.display = 'none';
  if (youWin) youWin.style.display = 'block';
  loadAndTriggerConfetti();
  playWinnerSound();
  savePlayedGameId(appState.currentImage);
  gtag('event', 'gameWinner', {
    event_category: 'gameplay',
    event_label: appState.roundInfo['id'] || '',
    value: 1
  });
}

export function gameOver(appState: any) {
  const gameDiv = document.querySelector('.game') as HTMLElement;
  const tryAgain = document.getElementById('try-again') as HTMLButtonElement;
  if (gameDiv) gameDiv.style.display = 'none';
  if (tryAgain) tryAgain.style.display = 'block';
  const audio = new Audio('/sounds/game-over-sound.mp3');
  audio.loop = true;
  gtag('event', 'gameOver', {
    event_category: 'gameplay',
    event_label: appState.roundInfo['id'] || '',
    value: 1
  });
}

export function displayHint(hintMessage: string) {
  if (!hintMessage) return;
  const hintWrap = document.getElementById('hints-wrap');
  if (!hintWrap) return;
  if (hintApp) {
    hintApp.unmount();
    hintApp = null;
    hintWrap.innerHTML = '';
  }
  hintApp = createApp(Hint, { message: hintMessage });
  hintApp.mount(hintWrap);
}

export function deleteHint() {
  const hintWrap = document.getElementById('hints-wrap');
  if (hintWrap) {
    hintWrap.classList.remove('visible');
    hintWrap.innerHTML = '';
  }
}

export function isLastChance(appState: any, remainingItems: { [key: string]: string[] }): boolean {
  return appState.triesUsed === appState.maxTries - 1 && Object.keys(remainingItems).length === 1;
}

export function generateRoundHTML(roundInfo: any): string {
  if (!roundInfo) return '';
  return Object.keys(roundInfo)
    .map(key => {
      const values = Array.isArray(roundInfo[key]) ? roundInfo[key] : [roundInfo[key]];
      const label = values.length > 1 ? `${key} (${values.length}):` : `${key}:`;
      return `<div><b>${label}</b> <span class="result-${key.toLowerCase().replace(/\s+/g, '-')}" ></span></div>`;
    })
    .join('');
}

export function generateInputDescription(roundInfo: { [key: string]: string | string[] }): string {
  const keys = Object.keys(roundInfo).map(key => key.toLowerCase());
  if (keys.length === 0) return '';
  if (keys.length === 1) return `Guess the ${keys[0]} based on the image`;
  if (keys.length === 2) return `Guess the ${keys[0]} and ${keys[1]} based on the image`;
  const allButLast = keys.slice(0, -1).join(', ');
  const last = keys[keys.length - 1];
  return `Guess the ${allButLast}, and ${last} based on the image`;
}

export function increaseTriesUsed(appState: any) {
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
  void element.offsetWidth;
  element.classList.add('shake', 'text-red');
  const removeShake = () => {
    element.classList.remove('shake', 'text-red');
    element.removeEventListener('animationend', removeShake);
  };
  element.addEventListener('animationend', removeShake);
}

export function savePlayedGameId(id: string) {
  const key = 'playedGameIds';
  const stored = localStorage.getItem(key);
  let ids: string[] = stored ? JSON.parse(stored) : [];
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(key, JSON.stringify(ids));
  }
}
