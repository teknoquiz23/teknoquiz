declare function gtag(...args: any[]): void;
import './style.css'
import { loadAndTriggerConfetti } from './confetti'
import { setupRoundInfo } from './setupRoundInfo';
import { getYearHint, getLastChanceHint, getNewHint, getRemainingItems } from './getHints'
import { updateResultsUI } from './updateResultsUi'
import { validateAndSaveResponse } from './validateAndSave'
import { playErrorSound, playWinnerSound, playHintSound, playCorrectSound } from './playSounds'
import { parties } from './parties';



interface AppState {
  triesUsed: number;
  currentImage: string;
  roundInfo: { [key: string]: string | string[] };
  correctResObject: { [key: string]: string | string[] };
  roundImage: number;
}

const appState: AppState = {
  triesUsed: 0,
  currentImage: '',
  roundInfo: {},
  correctResObject: {},
  roundImage: 1
}

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

const playedIds = getPlayedGameIds();
const unplayedParties = parties.filter(p => !playedIds.includes(p.id));

if (unplayedParties.length === 0) {
  // Show the "you won all games" message and do not call setupRoundInfo
  displayYouWonAllGamesMessage();
} else {
  setupRoundInfo(appState);
}

const MAX_TRIES = getMaxTries();  // MAx tries depends on the number of items in roundInfo
const MAX_IMAGES = 3; // Maximum number of images per round
const IMAGE_ERRORS_THRESHOLD = 3; // Show next image after every 3 incorrect tries

function getMaxTries(): number {
  // Calculate max tries based on the number of items in roundInfo
  const numItems = Object.keys(appState.roundInfo).length;
  return Math.max(10, numItems * 3); // Ensure at least 10 tries
}

function shakeText(element: HTMLElement) {
  element.classList.remove('shake', 'text-red')
  void element.offsetWidth // force reflow
  element.classList.add('shake', 'text-red')
  const removeShake = () => {
    element.classList.remove('shake', 'text-red')
    element.removeEventListener('animationend', removeShake)
  }
  element.addEventListener('animationend', removeShake)
}

export function updateTriesUsed() {
    appState.triesUsed++;
    const triesEl = document.getElementById('tries-used');
    if (triesEl) {
      triesEl.textContent = `${appState.triesUsed}`;
    }
    const triesWrap = document.getElementById('tries-wrap');
    if (triesWrap) {
      shakeText(triesWrap);
    }
}

function showNextImage(appState: AppState) {
    appState.roundImage++
    // Update image number counter
    const imgCounter = document.getElementById('round-image-counter')
    if (imgCounter) {
      imgCounter.textContent = `Image ${appState.roundImage} of ${MAX_IMAGES}`
    }
    // Next image logic
    const img = document.querySelector('.game img') as HTMLImageElement
    if (img) img.src = `/parties/${appState.currentImage}-${appState.roundImage}.png`
}


// --- Rendering ---
function renderGameUI(appState: AppState) {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div class="game">
      
      <img src="/parties/${appState.currentImage}-${appState.roundImage}.png" alt="Random party" style="max-width: 500px; width: 100%; border-radius: 8px; " />
      
      <p id="round-image-counter" style="text-align: center; margin:0; margin-bottom: 0; text-align: center; font-size: 12px;">Image ${appState.roundImage} of ${MAX_IMAGES}</p>
      <p id="tries-wrap" style="margin:0;margin-bottom:20px; font-size: 12px;"><span id="tries-used">0</span>/${getMaxTries()} tries used</p>
      <div id="guess-wrap">
        <div style="display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">
          <input id="guess-input" type="text" placeholder="Guess party name, sound system, year or country" style="padding: 0.5em; font-size: 1em;" />
          <button id="guess-btn" type="button">Go</button>
        </div>
          
      </div>
      <div id="hints-wrap" style="margin:0;margin-bottom: 2rem;"></div>
      <div>
        <div id="party-data" style="text-align:left;" class="text-left w-full max-w-md space-y-2">
          ${generateRoundHTML(appState.roundInfo)}
        </div>
      </div>
    </div>
  `
}

// Call rendering
renderGameUI(appState)

// Now set up event listeners and dynamic content
const guessBtn = document.getElementById('guess-btn')
const guessInput = document.getElementById('guess-input') as HTMLInputElement


function handleResponse(responseValue: string) {
  // Clear all hint messages first
  deleteHint()
  if (!responseValue || !appState.roundInfo) return
  const isCorrect = validateAndSaveResponse(responseValue, appState);
  if (isCorrect) {
    handleCorrectResponse(responseValue);
  } else {
    handleIncorrectResponse(responseValue, isCorrect);
  }
  guessInput.value = '';
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
    const hintMessage = getNewHint(appState, 1);
    playCorrectSound();
    displayHint(`✅ That\'s correct!<br>${hintMessage}`);
    updateResultsUI(appState);
  } else {
    playCorrectSound();
    displayHint('✅ That\'s correct!');
    updateResultsUI(appState);
  }
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
  
  updateTriesUsed();
  playErrorSound(appState.triesUsed, MAX_TRIES);

  // Show next image
  if (appState.triesUsed % IMAGE_ERRORS_THRESHOLD === 0 && appState.roundImage < MAX_IMAGES) {
    showNextImage(appState);
  }
  // If tries used exceeds max tries, end the game
  if (appState.triesUsed >= MAX_TRIES) {
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
  }
  // standard hint message
  else {
    let partyHint = '';
    let soundHint = '';
    let countryHint = '';
    const partyHintThreshold = Math.floor(MAX_TRIES / 3);
    const soundHintThreshold = Math.floor(MAX_TRIES / (appState.roundInfo['Party'] ? 2 : 3));
    const countryHintThreshold = Math.floor((MAX_TRIES * 2) / 3);
    
    // TODO simplify logic
    // get first roundInfo not in correctResObject
    const firstUnansweredKey = getFirstUnansweredKey(appState.roundInfo, appState.correctResObject);
    console.log('next unanswered key', firstUnansweredKey)


    if (
      appState.triesUsed === partyHintThreshold &&
      appState.roundInfo['Party'] &&
      !(Array.isArray(appState.correctResObject) && appState.correctResObject.includes('Party'))
    ) {
      partyHint = getNewHint(appState, 1);
    }
    if (
      appState.triesUsed === soundHintThreshold &&
      appState.roundInfo['Sound system'] &&
      !(Array.isArray(appState.correctResObject) && appState.correctResObject.includes('Sound system'))
    ) {
      soundHint = getNewHint(appState, 1);
    }
    if (
      appState.triesUsed === countryHintThreshold &&
      appState.roundInfo['Country'] &&
      !(Array.isArray(appState.correctResObject) && appState.correctResObject.includes('Country'))
    ) {
      countryHint = getNewHint(appState, 1);
    }
    let hintMessage = '';
    if (partyHint) hintMessage += `${partyHint} <br>`;
    if (soundHint) hintMessage += `${soundHint} <br>`;
    if (countryHint) hintMessage += `${countryHint}`;
    if (hintMessage.trim()) {
      displayHint(hintMessage.trim());
      playHintSound();
    }
  }
}



// Check if it's the last chance
function isLastChance(remainingItems: { [key: string]: string[] }): boolean {
  return appState.triesUsed === MAX_TRIES - 1 && Object.keys(remainingItems).length === 1;
}

// Update event listeners
guessBtn?.addEventListener('click', () => handleResponse(guessInput.value))
guessInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleResponse(guessInput.value)
  }
})
document.getElementById('try-again-btn')?.addEventListener('click', () => {
  window.location.reload()
})
document.getElementById('new-round-btn')?.addEventListener('click', () => {
  window.location.reload()
})

document.getElementById('reset-all-btn')?.addEventListener('click', () => {
  localStorage.removeItem('playedGameIds')
  window.location.reload()
})


// Dynamically generate content based on roundInfo keys
function generateRoundHTML(roundInfo: any): string {
  if (!roundInfo) return ''
  return Object.keys(roundInfo)
    .map(key => {
      if (key === 'Sound system') {
        const sounds = Array.isArray(roundInfo[key]) ? roundInfo[key] : [roundInfo[key]] 
        const label = sounds.length > 1 ? `Sound systems (${sounds.length}):` : 'Sound system:'
        return `<div><b>${label}</b> <span class="result-sound-system"></span></div>`
      } else {
        return `<div><b>${key}:</b> <span class="result-${key.toLowerCase().replace(/\s+/g, '-')}"></span></div>`
      }
    })
    .join('')
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
  audio.play();
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

function displayHint(hintMessage: string) {
  const hintEl = document.getElementById('hints-wrap');
  if (!hintEl) {
    console.error('Hint element not found in the DOM.');
    return;
  }
  if (!hintMessage) {
    console.error('Hint message is empty or undefined.');
    return;
  }
  hintEl.innerHTML = `<p>${hintMessage}</p>`;
}

function deleteHint() {
  const hintWrap = document.getElementById('hints-wrap');
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

function getFirstUnansweredKey(roundInfo: { [key: string]: string | string[] }, correctResObject: { [key: string]: string | string[] }): string | undefined {
  return Object.keys(roundInfo).find(key => {
    const value = roundInfo[key];
    if (Array.isArray(value)) {
      return value.some(item => !correctResObject[key] || !Array.isArray(correctResObject[key]) || !(correctResObject[key] as string[]).includes(item));
    }
    return !correctResObject[key];
  });
}

