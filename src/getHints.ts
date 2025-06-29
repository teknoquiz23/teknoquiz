export function getYearHintText(correctYear: number, yearResponse: number): string {
    console.log('getYearHintText', correctYear, yearResponse);
    
  const diff = Math.abs(correctYear - yearResponse)
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

export function getSoundHint(roundInfo: { [key: string]: string | string[] }, correctReponses?: string[]): string {
  const soundVal = roundInfo['Sound system']
  let sound = ''
  if (Array.isArray(soundVal)) {
    // If correctReponses is provided, find the first unguessed sound
    if (correctReponses && correctReponses.length > 0) {
      const unguessed = soundVal.find(s => !correctReponses.includes('Sound system:' + s));
      sound = unguessed || soundVal[0] || ''
    } else {
      sound = soundVal[0] || ''
    }
  } else {
    sound = soundVal || ''
  }
  if (sound.length > 0) {
    const words = sound.trim().split(/\s+/)
    const masked = words.map(word => {
      if (word.length <= 1) return word.toUpperCase()
      return word.slice(0, 1).toUpperCase() + 'X'.repeat(word.length - 1)
    })
    return `🔊 Sound system hint: ${masked.join(' ')} (${words.length} word${words.length > 1 ? 's' : ''})`
  }
  return ''
}

export function getCountryHint(roundInfo: { [key: string]: string | string[] }): string {
  const countryVal = roundInfo['Country']
  const country = Array.isArray(countryVal) ? countryVal[0] : countryVal
  if (country && country.length > 0) {
    const wordCount = country.trim().split(/\s+/).length
    return `💡 The country starts with "${country[0].toUpperCase()}" and has ${country.length} letters and ${wordCount} word${wordCount > 1 ? 's' : ''}.`
  }
  return ''
}

export function getPartyHint(roundInfo: { [key: string]: string | string[] }): string {
  const partyVal = roundInfo['Party']
  const party = Array.isArray(partyVal) ? partyVal[0] : partyVal
  if (party && party.length > 0) {
    const words = party.trim().split(/\s+/)
    const masked = words.map(word => {
      if (word.length <= 2) return word.toUpperCase()
      return word.slice(0, 2).toUpperCase() + 'X'.repeat(word.length - 2)
    })
    return `🕺 The party name: ${masked.join(' ')} (${words.length} word${words.length > 1 ? 's' : ''})`
  }
  return ''
}

export function getYearHint(appState: { [key: string]: any }, isCorrect?: boolean, responseValue?: string): string {
    
    if (
    typeof isCorrect === 'boolean' &&
    responseValue !== undefined &&
    !isCorrect &&
    appState.roundInfo['Year'] &&
    !isNaN(parseInt(responseValue, 10))
  ) {
    const year = Number(appState.roundInfo['Year'])
    const yearResponse = parseInt(responseValue, 10)
    
    return getYearHintText(year, yearResponse)
  }
  return ''
}

export function shouldShowNextSoundHint(roundInfo: { [key: string]: string | string[] }, correctReponses: string[], responseValue: string): { isSoundSystem: boolean, moreToGuess: boolean } {
  const soundSystems = roundInfo['Sound system'];
  // Check if responseValue matches a sound system
  let isSoundSystem = false;
  if (Array.isArray(soundSystems)) {
    isSoundSystem = soundSystems.some(s => s.toLowerCase() === responseValue.trim().toLowerCase());
  } else if (typeof soundSystems === 'string') {
    isSoundSystem = soundSystems.toLowerCase() === responseValue.trim().toLowerCase();
  }
  // Count how many sound systems are left to guess
  const totalSounds = Array.isArray(soundSystems) ? soundSystems.length : soundSystems ? 1 : 0;
  const guessedSounds = Array.isArray(soundSystems)
    ? soundSystems.filter(s => correctReponses.includes('Sound system:' + s)).length
    : (correctReponses.includes('Sound system:' + soundSystems) ? 1 : 0);
  const moreToGuess = totalSounds > 1 && guessedSounds < totalSounds;
  return { isSoundSystem, moreToGuess };
}
