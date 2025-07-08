declare function gtag(...args: any[]): void;

import './style.css'
import { createApp } from 'vue'
import { getAppDataModule } from './initGame';
import { appState } from './state/appState';
import type { AppState } from './state/appState';
import { loadAndTriggerConfetti } from './confetti'
import { getYearHint, getLastChanceHint, getRemainingItems, getHint, shouldDisplayHint } from './getHints'
import { updateResultsUI } from './ui/updateResults'
import { validateAndSaveResponse } from './validateAndSave'
import { playErrorSound, playWinnerSound, playHintSound, playCorrectSound } from './playSounds'
import Hint from './components/Hint.vue';
import { renderGameUI, setAppNameTitleAndIcon, generateInputDescription } from './ui/renderGameUI';
import { increaseTriesUsed, showNextImage, updateCorrectResponsesProgressBar, updateTriesProgressBar } from './ui/utils';



function getPlayedGameIds(): string[] {
  const key = 'playedGameIds';
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}
function displayYouWonAllGamesMessage() {
  const youWonAllGamesEl = document.getElementById('you-won-all-games');
  const gameDiv = document.getElementById('app');
  if (gameDiv) gameDiv.style.display = 'none';
  if (youWonAllGamesEl) youWonAllGamesEl.style.display = 'block';
  gtag('event', 'WonAllGames', {
    event_category: 'gameplay',
    value: 1
  });
}

function setupEventListeners() {
  const guessBtn = document.getElementById('guess-btn');
  const guessInput = document.getElementById('guess-input') as HTMLInputElement;
  guessBtn?.addEventListener('click', () => {
    handleResponse(guessInput.value);
    guessInput.value = '';
  });
  guessInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleResponse(guessInput.value);
      guessInput.value = '';
    }
  });
  document.getElementById('try-again-btn')?.addEventListener('click', () => {
    window.location.reload();
  });
  document.getElementById('new-round-btn')?.addEventListener('click', () => {
    window.location.reload();
  });
  document.getElementById('reset-all-btn')?.addEventListener('click', () => {
    localStorage.removeItem('playedGameIds');
    window.location.reload();
  });
}

async function setupRoundInfo(appState: AppState, availableParties: any[]) {
  // Pick a random party from availableParties
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

async function initGame() {
  setAppNameTitleAndIcon();
  const playedIds = getPlayedGameIds();
  const module = await getAppDataModule();
  const items = module.items;
  const unplayedParties = items.filter((p: any) => !playedIds.includes(p.id));

  if (unplayedParties.length === 0) {
    displayYouWonAllGamesMessage();
    return;
  }

  await setupRoundInfo(appState, unplayedParties);
  appState.maxTries = getMaxTries(appState.roundInfo);
  appState.roundInfoCount = Object.values(appState.roundInfo).reduce((acc, val) => acc + (Array.isArray(val) ? val.length : 1), 0);
  renderGameUI(appState);
  setupEventListeners();
}

initGame();

function getMaxTries(roundInfo: { [key: string]: string | string[] }): number {
  // Calculate max tries based on the number of items in roundInfo, counting each array element
  const numItems = Object.values(roundInfo).reduce((acc, val) => acc + (Array.isArray(val) ? val.length : 1), 0);
  const maxTries = Math.max(10, numItems * 3); // Ensure at least 10 tries
  return maxTries;
}
const MAX_IMAGES = 3; // Maximum number of images per round
const IMAGE_ERRORS_THRESHOLD = 3; // Show next image after every 3 incorrect tries

// Now set up event listeners and dynamic content
function handleResponse(responseValue: string) {
  console.log('handleResponse triggered');
  // Clear all hint messages first
  deleteHint()
  if (!responseValue || !appState.roundInfo) return
  const isCorrect = validateAndSaveResponse(responseValue, appState);
  if (isCorrect) {
    handleCorrectResponse(responseValue);
  } else {
    handleIncorrectResponse(responseValue, isCorrect);
  }
}



function isMultipleResponse (roundInfo: { [key: string]: string | string[] }, responseValue: string): boolean {
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


function handleCorrectResponse(responseValue: string) {
  if (isWinner()) {
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

function handleIncorrectResponse(responseValue: string, isCorrect: boolean = false) {
  
  gtag('event', 'IncorrectResponse', {
    event_category: 'Responses',
    event_label: appState.roundInfo['id'] || '',
    value: 1
  });
  
  increaseTriesUsed();
  playErrorSound(appState.triesUsed, appState.maxTries);
  updateTriesProgressBar(appState)

  // Show next image
  if (appState.triesUsed % IMAGE_ERRORS_THRESHOLD === 0 && appState.roundImage < MAX_IMAGES) {
    showNextImage(appState);
  }
  // If tries used exceeds max tries, end the game
  if (appState.triesUsed >= appState.maxTries) {
    gameOver(appState);
    return;
  }
  handleHint(responseValue, isCorrect);  
}

function handleHint(responseValue: string, isCorrect: boolean = false) {
  const remainingItems = getRemainingItems(appState);
  // If the response is last chance
  if (isLastChance(remainingItems)) {
    displayHint(getLastChanceHint(appState));
    playHintSound();
    return;
  }
  // If the response is a number
  else if (Number(responseValue)) { // TODO, check if is a valid year
    console.log(responseValue, 'is a number');
    const yearHint = getYearHint(appState, isCorrect, responseValue);
    displayHint(`${yearHint}`);
    playHintSound();
    return
  } else if (shouldDisplayHint(appState)) {
    const hintMessage = getHint(appState, 1);
    displayHint(hintMessage.trim());
    playHintSound();
  }
}



// Check if it's the last chance
function isLastChance(remainingItems: { [key: string]: string[] }): boolean {
  return appState.triesUsed === appState.maxTries - 1 && Object.keys(remainingItems).length === 1;
}



function gameWinner(appState: AppState) {
  // Game winner logic
  const gameDiv = document.querySelector('.game') as HTMLElement
  const youWin = document.getElementById('you-win') as HTMLElement
  if (gameDiv) gameDiv.style.display = 'none'
  if (youWin) youWin.style.display = 'block'
  loadAndTriggerConfetti()
  playWinnerSound();
  savePlayedGameId(appState.currentImage);
  
  gtag('event', 'gameWinner', {
    event_category: 'gameplay',
    event_label: appState.roundInfo['id'] || '', 
    value: 1
  });
}

function gameOver(appState: AppState) {
  // Game over logic
  const gameDiv = document.querySelector('.game') as HTMLElement;
  const tryAgain = document.getElementById('try-again') as HTMLButtonElement;
  if (gameDiv) gameDiv.style.display = 'none';
  if (tryAgain) tryAgain.style.display = 'block';
  // Play game over sound
  const audio = new Audio('/sounds/game-over-sound.mp3');
  audio.loop = true;
  //audio.play();
  gtag('event', 'gameOver', {
    event_category: 'gameplay',
    event_label: appState.roundInfo['id'] || '',
    value: 1
  });
}


export function isWinner(): boolean {
  const remainingItems = getRemainingItems(appState);
  // Check if object is empty
  for (const prop in remainingItems) {
    if (Object.hasOwn(remainingItems, prop)) {
      return false;
    }
  }
  return true;
}

let hintApp: any = null;

function displayHint(hintMessage: string) {
  if (!hintMessage) return;
  const hintWrap = document.getElementById('hints-wrap');
  if (!hintWrap) return;
  // Remove any previous Vue app
  if (hintApp) {
    hintApp.unmount();
    hintApp = null;
    hintWrap.innerHTML = '';
  }
  // Use the already imported createApp from Vue
  hintApp = createApp(Hint, { message: hintMessage });
  hintApp.mount(hintWrap);
}

function deleteHint() {
  const hintWrap = document.getElementById('hints-wrap');
  if (hintWrap) {
    hintWrap.classList.remove('visible');
  }
  if (hintWrap) hintWrap.innerHTML = '';
}


function savePlayedGameId(id: string) {  
  const key = 'playedGameIds';
  const stored = localStorage.getItem(key);
  let ids: string[] = stored ? JSON.parse(stored) : [];
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(key, JSON.stringify(ids));
  }
}


