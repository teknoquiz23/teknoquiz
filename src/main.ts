declare function gtag(...args: any[]): void;
import './style.css'
import { loadAndTriggerConfetti } from './confetti'
import { setupRoundInfo } from './setupRoundInfo';
import { getYearHint, getLastChanceHint, getRemainingItems, getHint, shouldDisplayHint } from './getHints'
import { updateResultsUI } from './updateResultsUi'
import { validateAndSaveResponse } from './validateAndSave'
import { playErrorSound, playWinnerSound, playHintSound, playCorrectSound } from './playSounds'
import { parties } from './parties';



interface AppState {
  triesUsed: number;
  currentImage: string;
  roundInfo: { [key: string]: string | string[] };
  roundInfoCount: number; 
  correctResObject: { [key: string]: string | string[] };
  roundImage: number;
  maxTries: number;
}

const appState: AppState = {
  triesUsed: 0,
  currentImage: '',
  roundInfo: {},
  roundInfoCount: 0, // will be set after roundInfo is set
  correctResObject: {},
  roundImage: 1,
  maxTries: 10 // will be set after roundInfo is set
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
  displayYouWonAllGamesMessage();
} else {
  setupRoundInfo(appState);
  // Set maxTries based on roundInfo
  appState.maxTries = getMaxTries(appState.roundInfo);
  appState.roundInfoCount = Object.values(appState.roundInfo).reduce((acc, val) => acc + (Array.isArray(val) ? val.length : 1), 0);
}

function getMaxTries(roundInfo: { [key: string]: string | string[] }): number {
  // Calculate max tries based on the number of items in roundInfo, counting each array element
  const numItems = Object.values(roundInfo).reduce((acc, val) => acc + (Array.isArray(val) ? val.length : 1), 0);
  const maxTries = Math.max(10, numItems * 3); // Ensure at least 10 tries
  return maxTries;
}
const MAX_IMAGES = 3; // Maximum number of images per round
const IMAGE_ERRORS_THRESHOLD = 3; // Show next image after every 3 incorrect tries

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
        
      <div class="image-container">
        <img src="/parties/${appState.currentImage}-${appState.roundImage}.png" alt="Random party" style="width: 100%; border-radius: 8px;" />
  
      </div>
      <p id="round-image-counter" style="text-align: center; margin:0; margin-bottom: 20px; text-align: center; font-size: 12px;">Image ${appState.roundImage} of ${MAX_IMAGES}</p>
      <div class="game-ui">
        <div class="game-ui-inner">
          <div class="progress-bars">
            <div id="progress-bar-tries" class="progress-bar">
              <span id="tries-used-text" class="progress-bar-text">Tries used: <b><span id="tries-used">0</span> / ${appState.maxTries}</b></span>
            <span class="progress-bar-fill tries" style="width:0"></span>
            </div>
            <div id="progress-bar-responses" class="progress-bar">
              <span class="progress-bar-text">Correct responses: <b><span id="correct-responses">0</span> / <span id="total-responses">${appState.roundInfoCount}</span></b></span>
              <span class="progress-bar-fill responses" style="width:0"></span>
            </div>
          </div>
          <div class="guess-wrap">
            <div>
              <input id="guess-input" class="guess-input" type="text" placeholder="Guess party name, sound system, year or country" />
              <button id="guess-btn" class="guess-btn" type="button">Go</button>
            </div>
          </div>
        </div>
      </div>
      <div id="hints-wrap" class="hints-wrap" style="margin:0;margin-bottom: 2rem;"></div>
      <div class="results-data">
          ${generateRoundHTML(appState.roundInfo)}
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


function updateCorrectResponsesProgressBar() {
  const roundInfoCount = Object.values(appState.roundInfo).reduce((acc, val) => acc + (Array.isArray(val) ? val.length : 1), 0);
  const countCorrectResObject = Object.values(appState.correctResObject).reduce((acc, val) => acc + (Array.isArray(val) ? val.length : 1), 0);
  const correctResponsesEl = document.getElementById('correct-responses');
  correctResponsesEl && (correctResponsesEl.textContent = `${countCorrectResObject}`);
  // console.log('roundInfoCount', roundInfoCount, 'countCorrectResObject', countCorrectResObject);
  const progressBarResponses = document.querySelector('#progress-bar-responses .progress-bar-fill');
  if (progressBarResponses) {
    const percentage = Math.round((countCorrectResObject / roundInfoCount) * 100);
    (progressBarResponses as HTMLElement).style.width = `${percentage}%`;
  }
}
function updateTriesProgressBar() {
  const countTriesUsed = appState.triesUsed;
  const triesEl = document.getElementById('tries-used');
  triesEl && (triesEl.textContent = `${countTriesUsed}`);
  // console.log('roundInfoCount', roundInfoCount, 'countTriesUsed', countTriesUsed);
  const progressBarTries = document.querySelector('#progress-bar-tries .progress-bar-fill');
  if (progressBarTries) {
    const percentage = Math.round((countTriesUsed / appState.maxTries) * 100);
    (progressBarTries as HTMLElement).style.width = `${percentage}%`;
  }
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
  updateCorrectResponsesProgressBar();
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
  updateTriesProgressBar()

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
      const values = Array.isArray(roundInfo[key]) ? roundInfo[key] : [roundInfo[key]];
      const label = values.length > 1 ? `${key} (${values.length}):` : `${key}:`;
      return `<div><b>${label}</b> <span class="result-${key.toLowerCase().replace(/\s+/g, '-')}" ></span></div>`;
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
  if(!!hintMessage){ // make sure there is a hint message
    console.log('Hint message:', hintMessage);
    const hintEl = document.getElementById('hints-wrap');
    // add class "visible" to hintEl
    if (hintEl) {
      hintEl.classList.add('visible');
    }
    if (!hintEl) {
      console.error('Hint element not found in the DOM.');
      return;
    }
    // delete visible after 5 seconds
    setTimeout(() => {
      if (hintEl) {
        hintEl.classList.remove('visible');
        hintEl.innerHTML = '';
      }
    }, 5000);
    // Clear previous content
    hintEl.innerHTML = `<p>${hintMessage}</p>`;
  }
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

// function getFirstUnansweredKey(roundInfo: { [key: string]: string | string[] }, correctResObject: { [key: string]: string | string[] }): string | undefined {
//   return Object.keys(roundInfo).find(key => {
//     const value = roundInfo[key];
//     if (Array.isArray(value)) {
//       return value.some(item => !correctResObject[key] || !Array.isArray(correctResObject[key]) || !(correctResObject[key] as string[]).includes(item));
//     }
//     return !correctResObject[key];
//   });
// }


