export function getYearHint(correctYear: number, guessYear: number): string {
  const diff = Math.abs(correctYear - guessYear)
  if (diff > 10) {
    return '🤨 You are more than 10 years away from the correct year.'
  } else if (diff > 5) {
    return '🤔 You are within 10 years, but more than 5 years away.'
  } else if (diff > 1) {
    return '😅 You are close! Within 5 years.'
  } else if (diff === 1) {
    return '😳 Very close! Just 1 year away.'
  } else {
    return '🎉 Correct!'
  }
}

export function handleYearHint(isCorrect: boolean, guessValue: string, roundInfo: { [key: string]: string }) {
  const year = roundInfo['Year']
  const hintEl = document.getElementById('hint')
  const guessYear = parseInt(guessValue, 10)
  if (!isCorrect && year && !isNaN(guessYear)) {
    if (hintEl) hintEl.textContent = getYearHint(Number(year), guessYear)
  } else if (hintEl) {
    hintEl.textContent = ''
  }
}
