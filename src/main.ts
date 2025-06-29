import './style.css'
import { loadAndTriggerConfetti } from './confetti'
import { setupRoundInfo } from './setupRoundInfo'
import { getYearHint, getSoundHint, getCountryHint, getPartyHint } from './getHints'

const IMAGE_ERRORS_LIMIT = 3;

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

function updateTriesUsed(isCorrect: boolean) {
  if (!isCorrect) {
    appState.triesUsed++;

    const triesEl = document.getElementById('tries-used');
    if (triesEl) {
      triesEl.textContent = `${appState.triesUsed}`;
    }
    const triesWrap = document.getElementById('tries-wrap');
    if (triesWrap) {
      shakeText(triesWrap);
    }
    showNextImage(appState);
  }

  if (appState.triesUsed >= getMaxTries()) {
    // Game over logic
    const gameDiv = document.querySelector('.game') as HTMLElement;
    const tryAgain = document.getElementById('try-again') as HTMLButtonElement;
    if (gameDiv) gameDiv.style.display = 'none';
    if (tryAgain) tryAgain.style.display = 'block';
  }
}

function showNextImage(appState: AppState) {
  if (appState.triesUsed % IMAGE_ERRORS_LIMIT === 0 && appState.roundImage < appState.maxImages) {
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

function handleGuess(guessValue: string) {
  
  if (!guessValue || !appState.roundInfo) return

  const isCorrect = validateInputValue(guessValue, appState.roundInfo);

  // Handle numeric guess
  if (!isNaN(Number(guessValue))) {
    const yearHint = getYearHint(appState, isCorrect, guessValue);
    displayHint(`${yearHint}`);
  } else {
    // Handle text hint
    handleTextHint(guessValue, isCorrect);
    if (hintEl) hintEl.textContent = '';
  }

  updateTriesUsed(isCorrect);
  guessInput.value = '';

}

function handleTextHint(guessValue: string, isCorrect: boolean) {
  if (isCorrect) {
    // If the guess is correct, we can provide a positive feedback
    displayHint('✅ Correct!');
  } else {
    console.log(`Incorrect guess: ${guessValue}`);
    // TODO define max-tries en funció de num d'items a round info
    // dividir error thresholds en funció num d'items a round info
    // if sound party exists, and guess used are 3, provide party hint
    // if sound system exists, and guess used are 6, provide sound system hint
    // if sound country exists, and guess used are 9, provide country hint

    const partyHint = getPartyHint(appState.roundInfo);
    const countryHint = getCountryHint(appState.roundInfo);
    const soundHint = getSoundHint(appState.roundInfo);

    console.log(`Hints - Party: ${partyHint}, Country: ${countryHint}, Sound: ${soundHint}`);

    let hintMessage = '';
    if (partyHint) hintMessage += `${partyHint} <br>`;
    if (countryHint) hintMessage += `${countryHint} <br>`;
    if (soundHint) hintMessage += `${soundHint}`;

    displayHint(hintMessage.trim() || '❌ Incorrect guess, try again!');
  }
}
// Update event listeners
guessBtn?.addEventListener('click', () => handleGuess(guessInput.value))
guessInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleGuess(guessInput.value)
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

function updateResultsUI() {
  if (!appState.roundInfo) return
  // Always show all sound systems if present
  if (appState.roundInfo['Sound system']) {
    const selector = `.result-sound-system`
    const el = document.querySelector(selector)
    if (el) {
      const sounds = Array.isArray(appState.roundInfo['Sound system'])
        ? appState.roundInfo['Sound system']
        : [appState.roundInfo['Sound system']]
      el.textContent = sounds
        .map(sound =>
          Array.isArray(appState.correctReponses) && appState.correctReponses.includes('Sound system:' + sound)
            ? `✅ ${sound}`
            : ''
        )
        .join(' ')
    }
  }
  if (!Array.isArray(appState.correctReponses)) return
  appState.correctReponses.forEach(key => {
    if (key.startsWith('Sound system:')) {
      // Already handled above
      return
    } else {
      const selector = `.result-${key.toLowerCase().replace(/\s+/g, '-')}`
      const el = document.querySelector(selector)
      if (el) el.textContent = `✅ ${appState.roundInfo[key]}`
    }
  })
}

function winner() {
  const gameDiv = document.querySelector('.game') as HTMLElement
  const youWin = document.getElementById('you-win') as HTMLElement
  if (gameDiv) gameDiv.style.display = 'none'
  if (youWin) youWin.style.display = 'block'
  loadAndTriggerConfetti()
}

function validateInputValue(inputValue: string, infoObj: any): boolean {
  const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '')
  const value = normalize(inputValue.trim())
  if (!value) return false // Prevent empty input from matching any value
  let foundKey = null
  for (const [key, v] of Object.entries(infoObj)) {
    if (key === 'Sound system' && Array.isArray(v)) {
      for (const sound of v) {
        if (normalize(String(sound)) === value) {
          foundKey = key + ':' + sound // unique key for each sound
          break
        }
      }
    } else if (normalize(String(v)) === value) {
      foundKey = key
      break
    }
  }
  if (foundKey) {
    if (!Array.isArray(appState.correctReponses)) appState.correctReponses = []
    if (!appState.correctReponses.includes(foundKey)) {
      appState.correctReponses.push(foundKey)
      updateResultsUI()
    }
    // For sound system, check if all are guessed
    if (
      appState.roundInfo['Sound system'] &&
      Array.isArray(appState.roundInfo['Sound system']) &&
      appState.roundInfo['Sound system'].length > 1
    ) {
      const allGuessed = appState.roundInfo['Sound system'].every(sound =>
        appState.correctReponses.includes('Sound system:' + sound)
      )
      const allOther = Object.keys(appState.roundInfo)
        .filter(k => k !== 'Sound system')
        .every(k => appState.correctReponses.includes(k))
      if (allGuessed && allOther) {
        winner()
      }
    } else if (
      appState.roundInfo &&
      appState.correctReponses.length === Object.keys(appState.roundInfo).length
    ) {
      winner()
    }
    return true
  } else {
    return false
  }
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

console.log(appState)



