export function getYearHint(correctYear: number, guessYear: number): string {
  const diff = Math.abs(correctYear - guessYear)
  if (diff > 10) {
    return 'You are more than 10 years away from the correct year.'
  } else if (diff > 5) {
    return 'You are within 10 years, but more than 5 years away.'
  } else if (diff > 1) {
    return 'You are close! Within 5 years.'
  } else if (diff === 1) {
    return 'Very close! Just 1 year away.'
  } else {
    return 'Correct!'
  }
}

export function getSoundHint(roundInfo: { [key: string]: string }): string {
  const sound = roundInfo['Sound system']
  if (sound && sound.length > 0) {
    return `The Sound system starts with "${sound[0].toUpperCase()}".`
  }
  return ''
}

export function getCountryHint(roundInfo: { [key: string]: string }): string {
  const country = roundInfo['Country']
  if (country && country.length > 0) {
    const wordCount = country.trim().split(/\s+/).length
    return `💡 The country starts with "${country[0].toUpperCase()}" and has ${country.length} letters and ${wordCount} word${wordCount > 1 ? 's' : ''}.`
  }
  return ''
}

export function getPartyHint(roundInfo: { [key: string]: string }): string {
  const party = roundInfo['Party']
  if (party && party.length > 0) {
    const wordCount = party.trim().split(/\s+/).length
    return `The party name starts with "${party[0].toUpperCase()}" and has ${wordCount} word${wordCount > 1 ? 's' : ''}.`
  }
  return ''
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
