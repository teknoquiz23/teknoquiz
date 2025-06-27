export function getYearHintText(correctYear: number, guessYear: number): string {
  const diff = Math.abs(correctYear - guessYear)
  if (diff > 20) {
    return '🥶 Way off! More than 20 years away.'
  } else if (diff > 10) {
    return '❄️ You are more than 10 years away.'
  } else if (diff > 5) {
    return '🌬️ You are within 10 years.'
  } else if (diff > 2) {
    return '🔥 Getting warmer! Within 5 years.'
  } else if (diff === 2) {
    return '✨ Very close! Just 2 years away.'
  } else if (diff === 1) {
    return '🥳 Extremely close! Just 1 year away.'
  } else {
    return '✅ Correct!'
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

export function getYearHint(appState: { [key: string]: any }, isCorrect?: boolean, guessValue?: string): string {
  if (
    typeof isCorrect === 'boolean' &&
    guessValue !== undefined &&
    !isCorrect &&
    appState.roundInfo['Year'] &&
    !isNaN(parseInt(guessValue, 10))
  ) {
    const year = Number(appState.roundInfo['Year'])
    const guessYear = parseInt(guessValue, 10)
    return getYearHintText(year, guessYear)
  }
  return ''
}
