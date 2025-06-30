import './style.css'
import { loadAndTriggerConfetti } from './confetti'
import { setupRoundInfo } from './setupRoundInfo'
import { getYearHint, getSoundHint, getCountryHint, getPartyHint, shouldShowNextSoundHint, getLastChanceHint } from './getHints'
import { updateResultsUI } from './updateResultsUi'



interface AppState {
  triesUsed: number;
  currentImage: string;
  roundInfo: { [key: string]: string | string[] };
  correctReponses: string[];
  roundImage: number;
  maxImages: number;
}

const appState: AppState = {
  triesUsed: 0,
  currentImage: '',
  roundInfo: {},
  correctReponses: [],
  roundImage: 1,
  maxImages: 3
}

setupRoundInfo(appState)

const MAX_TRIES = getMaxTries();
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

function updateTriesUsed() {
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
      imgCounter.textContent = `Image ${appState.roundImage} of ${appState.maxImages}`
    }
    // Next image logic
    const img = document.querySelector('.game img') as HTMLImageElement
    if (img) img.src = `/parties/${appState.currentImage}-${appState.roundImage}.png`
  
}


// --- Rendering ---
function renderGameUI(appState: AppState) {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <h1>🔊 Tekno Quiz</h1>
    <div class="game">
      <p>Guess the party name, sound system, year or country based on the image:</p>
      <img src="/parties/${appState.currentImage}-${appState.roundImage}.png" alt="Random party" style="max-width: 500px; width: 100%; border-radius: 8px; " />
      
      <p id="round-image-counter" style="text-align: center; margin:0; margin-bottom: 0; text-align: center; font-size: 12px;">Image ${appState.roundImage} of ${appState.maxImages}</p>
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
          ${getPartyDataHTML(appState.roundInfo)}
        </div>
      </div>
    </div>
    <div id="try-again" style="display:none;">
      <h2 style="text-align:center; color:rgb(255, 0, 0);">🚓 You failed! 🚨</h2>
      <button id="try-again-btn" style="margin:0 auto;" type="button">Try again</button>
    </div>
    <h2 style="display:none; margin:0 auto; color:#50C878" id="you-win">🎉 You win!!! 🎉</h2>
    <footer class="footer">
      <a href="https://underave.net"><img src="/underave.png" alt="underave" style="max-width: 150px; width: 100%; margin: 1rem auto; display: block; border-radius: 8px;" /></a>
    </footer>
  `
}

// Call rendering
renderGameUI(appState)

// Now set up event listeners and dynamic content
const guessBtn = document.getElementById('guess-btn')
const guessInput = document.getElementById('guess-input') as HTMLInputElement
const hintEl = document.getElementById('hint')

function handleResponse(responseValue: string) {
  // Clear all hint messages first
  const hintWrap = document.getElementById('hints-wrap');
  if (hintWrap) hintWrap.innerHTML = '';

  if (!responseValue || !appState.roundInfo) return

  const isCorrect = validateInputValue(responseValue, appState.roundInfo);
  
  if (!isCorrect) {
    handleIncorrectResponse(responseValue, isCorrect);
  } else {
    handleCorrectResponse();
  }
  guessInput.value = '';

}

function handleCorrectResponse(){
  // If the guess is correct, check if it's a winner // Check if the user has won
    if (isWinner()) {
      gameWinner();
    }
    updateResultsUI(appState);
}


function handleIncorrectResponse(responseValue: string, isCorrect: boolean = false) {
  updateTriesUsed();
    if (appState.triesUsed % IMAGE_ERRORS_THRESHOLD === 0 && appState.roundImage < appState.maxImages) {
      showNextImage(appState);
    }
    // If tries used exceeds max tries, end the game
    if (appState.triesUsed >= MAX_TRIES) {
      gameOver();
    }

    // Handle numeric guess
    if (!isNaN(Number(responseValue))) {
      const yearHint = getYearHint(appState, isCorrect, responseValue);
      if (isCorrect) {
        displayHint('✅ That\'s correct!');
      } else {
        displayHint(`${yearHint}`);
      }
    } else {
      // Handle text hint
      handleTextHint(responseValue, isCorrect);
      if (hintEl) hintEl.textContent = '';
    }
}

function handleTextHint(responseValue: string, isCorrect: boolean) {
  // If the guess is correct, check if it's a sound system and if more remain to be guessed
  if (isCorrect) {
    const correct = Array.isArray(appState.correctReponses) ? appState.correctReponses : [];
    const { isSoundSystem, moreToGuess } = shouldShowNextSoundHint(appState.roundInfo, correct, responseValue);
    if (isSoundSystem && moreToGuess) {
      const nextHint = getSoundHint(appState.roundInfo, correct);
      displayHint(`✅ That\'s correct!<br>${nextHint}`);
      return;
    } else {
      displayHint('✅ That\'s correct!');
      return;
    }
  }
  handleIncorrectResponseTextHint(responseValue);
}

function handleIncorrectResponseTextHint(responseValue: string) {
  if (isLastChance()) {
    displayHint(getLastChanceHint(appState));
    return;
  }
  console.log(`Incorrect guess: ${responseValue}`);
  let partyHint = '';
  let soundHint = '';
  let countryHint = '';
  const partyHintThreshold = Math.floor(MAX_TRIES / 3);
  const soundHintThreshold = Math.floor(MAX_TRIES / (appState.roundInfo['Party'] ? 2 : 3));
  const countryHintThreshold = Math.floor((MAX_TRIES * 2) / 3);
  console.log(`Tries used: ${appState.triesUsed}, Party hint threshold: ${partyHintThreshold}, Sound hint threshold: ${soundHintThreshold}, Country hint threshold: ${countryHintThreshold}`);
  if (
    appState.triesUsed === partyHintThreshold &&
    appState.roundInfo['Party'] &&
    !(Array.isArray(appState.correctReponses) && appState.correctReponses.includes('Party'))
  ) {
    partyHint = getPartyHint(appState.roundInfo);
  }
  if (
    appState.triesUsed === soundHintThreshold &&
    appState.roundInfo['Sound system'] &&
    !(Array.isArray(appState.correctReponses) && appState.correctReponses.includes('Sound system'))
  ) {
    soundHint = getSoundHint(appState.roundInfo, appState.correctReponses);
  }
  if (
    appState.triesUsed === countryHintThreshold &&
    appState.roundInfo['Country'] &&
    !(Array.isArray(appState.correctReponses) && appState.correctReponses.includes('Country'))
  ) {
    countryHint = getCountryHint(appState.roundInfo);
  }
  console.log(`Hints - Party: ${partyHint}, Country: ${countryHint}, Sound: ${soundHint}`);
  let hintMessage = '';
  if (partyHint) hintMessage += `${partyHint} <br>`;
  if (soundHint) hintMessage += `${soundHint} <br>`;
  if (countryHint) hintMessage += `${countryHint}`;
  if (hintMessage.trim()) displayHint(hintMessage.trim());
}

function isLastChance(): boolean {
  const remainingKeys = Object.keys(appState.roundInfo).filter(key => {
    if (key === 'Sound system' && Array.isArray(appState.roundInfo[key])) {
      return appState.roundInfo[key].some((sound: string) => !appState.correctReponses.includes('Sound system:' + sound));
    }
    return !appState.correctReponses.includes(key);
  });
  return appState.triesUsed === MAX_TRIES - 1 && remainingKeys.length === 1;
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


// Dynamically generate #party-data content based on roundInfo keys
function getPartyDataHTML(roundInfo: any): string {
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

function gameWinner() {
  // Game winner logic
  const gameDiv = document.querySelector('.game') as HTMLElement
  const youWin = document.getElementById('you-win') as HTMLElement
  if (gameDiv) gameDiv.style.display = 'none'
  if (youWin) youWin.style.display = 'block'
  loadAndTriggerConfetti()
}

function gameOver() {
// Game over logic
  const gameDiv = document.querySelector('.game') as HTMLElement;
  const tryAgain = document.getElementById('try-again') as HTMLButtonElement;
  if (gameDiv) gameDiv.style.display = 'none';
  if (tryAgain) tryAgain.style.display = 'block';
}

function validateInputValue(inputValue: string, infoObj: any): boolean {
  // Normalize input for comparison
  const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '');
  const value = normalize(inputValue.trim());
  if (!value) return false; // Prevent empty input from matching any value

  // Try to find a matching key in roundInfo
  const foundKey = findMatchingKey(value, infoObj, normalize);
  if (!foundKey) return false;

  // Update correct responses if not already present
  if (!Array.isArray(appState.correctReponses)) appState.correctReponses = [];
  if (!appState.correctReponses.includes(foundKey)) {
    appState.correctReponses.push(foundKey);
  }
  return true;
}

function findMatchingKey(value: string, infoObj: any, normalize: (str: string) => string): string | null {
  for (const [key, v] of Object.entries(infoObj)) {
    if (key === 'Sound system' && Array.isArray(v)) {
      for (const sound of v) {
        if (normalize(String(sound)) === value) {
          return key + ':' + sound; // unique key for each sound
        }
      }
    } else if (normalize(String(v)) === value) {
      return key;
    }
  }
  return null;
}

function isWinner(): boolean {
  // For sound system, check if all are guessed
  if (
    appState.roundInfo['Sound system'] &&
    Array.isArray(appState.roundInfo['Sound system']) &&
    appState.roundInfo['Sound system'].length > 1
  ) {
    const allGuessed = appState.roundInfo['Sound system'].every(sound =>
      appState.correctReponses.includes('Sound system:' + sound)
    );
    const allOther = Object.keys(appState.roundInfo)
      .filter(k => k !== 'Sound system')
      .every(k => appState.correctReponses.includes(k));
    return allGuessed && allOther;
  } else if (
    appState.roundInfo &&
    appState.correctReponses.length === Object.keys(appState.roundInfo).length
  ) {
    return true;
  }
  return false;
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



