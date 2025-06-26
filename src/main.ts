import './style.css'
import { parties } from './parties'
import { getRandomPartyImage } from './randomizeparty.ts'
import { loadAndTriggerConfetti } from './confetti'




const appState = {
  guessesUsed: 0,
  currentImage: null,
  roundInfo: {} as { [key: string]: string },
  correctReponses: [] as string[],
  roundImage: 1,
  maxImages: 3
}

const randomImage = getRandomPartyImage(parties)
appState.currentImage = randomImage

function fetchPartyInfo(partyName: string): Promise<any> {
  return fetch(`/parties/${partyName}-info.json`)
    .then(res => res.json())
    .then(info => {
      appState.roundInfo = info
      return info
    })
}

function triesCounter(isCorrect: boolean) {
  appState.guessesUsed++
  const guessesP = document.getElementById('guesses-used')
  if (guessesP) {
    guessesP.textContent = `${appState.guessesUsed}`
  }
  if (!isCorrect) {
    const guessWrap = document.getElementById('guesses-wrap')
    if (guessWrap) {
      //
      guessWrap.classList.remove('shake', 'text-red')
      void guessWrap.offsetWidth // force reflow
      guessWrap.classList.add('shake', 'text-red')
      const removeShake = () => {
        guessWrap.classList.remove('shake', 'text-red')
        guessWrap.removeEventListener('animationend', removeShake)
      }
      guessWrap.addEventListener('animationend', removeShake)
    }
    if (appState.guessesUsed % 3 === 0 && appState.roundImage < appState.maxImages) {
      appState.roundImage++
      // Update image number copunter
      const imgCounter = document.getElementById('round-image-counter')
      if (imgCounter) {
        imgCounter.textContent = `Image ${appState.roundImage} of ${appState.maxImages}`
      }
      
      // Next image logic
      const img = document.querySelector('.game img') as HTMLImageElement
      if (img) img.src = `/parties/${appState.currentImage}-${appState.roundImage}.png`
    }
  }
  if (appState.guessesUsed >= 10) {
    // Game over logic
    const gameDiv = document.querySelector('.game') as HTMLElement
    const tryAgain = document.getElementById('try-again') as HTMLButtonElement
    if (gameDiv) gameDiv.style.display = 'none'
    if (tryAgain) tryAgain.style.display = 'block'
  }
}



fetchPartyInfo(randomImage).then(() => {
  // Dynamically generate #party-data content based on roundInfo keys
  const partyDataDiv = document.getElementById('party-data')
  if (partyDataDiv && appState.roundInfo) {
    partyDataDiv.innerHTML = Object.keys(appState.roundInfo)
      .map(key => `<div><b>${key}:</b> <span class="result-${key.toLowerCase().replace(/\s+/g, '-')}"></span></div>`)
      .join('')
  }
  const guessBtn = document.getElementById('guess-btn')
  const guessInput = document.getElementById('guess-input') as HTMLInputElement
  guessBtn?.addEventListener('click', () => {
    if (!guessInput || !appState.roundInfo) return
    const isCorrect = validateInputValue(guessInput.value, appState.roundInfo)
    triesCounter(isCorrect)
    guessInput.value = ''
  })
  guessInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      guessBtn?.click()
    }
  })
})

function updateResultsUI() {
  if (!Array.isArray(appState.correctReponses) || !appState.roundInfo) return
  appState.correctReponses.forEach(key => {
    const selector = `.result-${key.toLowerCase().replace(/\s+/g, '-')}`
    const el = document.querySelector(selector)
    if (el) el.textContent = `✅ ${appState.roundInfo[key]}`
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
    if (normalize(String(v)) === value) {
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
    if (appState.roundInfo && appState.correctReponses.length === Object.keys(appState.roundInfo).length) {
      winner()
    }
    return true
  } else {
    return false
  }
}
console.log(appState)


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>🔊 Tekno Quiz</h1>

  <div class="game">
  <p>Guess the party name, sound system, year or country based on the image:</p>
  <img src="/parties/${randomImage}-${appState.roundImage}.png" alt="Random party" style="max-width: 500px; width: 100%; border-radius: 8px; " />
   <div id="guess-wrap">
    <div style="display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">
      <input id="guess-input" type="text" placeholder="Guess party name, sound system, year or country" style="padding: 0.5em; font-size: 1em;" />
      <button id="guess-btn" type="button">Go</button>
    </div>
      <p id="round-image-counter" style="text-align: center; margin-top: 0.5rem; margin-bottom: 0;">Image ${appState.roundImage} of ${appState.maxImages}</p>
      <p id="guesses-wrap" style="margin-bottom: 2rem; margin-top:0;"><span id="guesses-used">0</span>/10 guesses used</p>
    </div>
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
  <a href="https://underave.net"><img src="/public/underave.png" alt="underave" style="max-width: 150px; width: 100%; margin: 1rem auto; display: block; border-radius: 8px;" /></a>
  </footer>
`

document.getElementById('try-again-btn')?.addEventListener('click', () => {
  window.location.reload()
})

// Generate dynamic party-data HTML based on roundInfo keys
function getPartyDataHTML(roundInfo: any): string {
  if (!roundInfo) return ''
  return Object.keys(roundInfo)
    .map(key => `<div><b>${key}:</b> <span class="result-${key.toLowerCase().replace(/\s+/g, '-')}"></span></div>`)
    .join('')
}



