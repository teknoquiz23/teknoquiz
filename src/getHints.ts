function maskHint(word: string, level: number, level1HintChars: number = 1, level2HintChars: number = 2): string {
  if (level === 2) {
    return word.slice(0, level2HintChars).toUpperCase() + 'X'.repeat(word.length - level2HintChars);
  } else {
    return word.slice(0, level1HintChars).toUpperCase() + 'X'.repeat(word.length - level1HintChars);
  }
}

export function getYearHintText(correctYear: number, yearResponse: number): string {

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

export function getSoundHint(roundInfo: { [key: string]: string | string[] }, correctReponses?: string[], level: number = 1): string {
   const soundVal = roundInfo['Sound system']
  const level1HintChars = 1;
  const level2HintChars = 2;

  let sound = ''
  if (Array.isArray(soundVal)) {
    // If correctReponses is provided, find the first unguessed sound
    if (correctReponses && correctReponses.length > 0) {
      const unguessed = soundVal.find(s => !correctReponses.includes('Sound system:' + s));
      if (!unguessed) return '';
      sound = unguessed;
    } else {
      sound = soundVal[0] || ''
    }
  } else {
    sound = soundVal || ''
  }
  // If the sound is already guessed, return empty string
  if (correctReponses && correctReponses.includes('Sound system:' + sound)) return '';
  

  if (sound.length > 0) {
    const words = sound.trim().split(/\s+/)
    let masked;
    if (level === 2) {
      masked = words.map(word => word.slice(0, level2HintChars).toUpperCase() + 'X'.repeat(word.length - level2HintChars));
    } else {
      masked = words.map(word => {
        return word.slice(0, level1HintChars).toUpperCase() + 'X'.repeat(word.length - level1HintChars)
      })
    }
    return `🔊 Sound system hint: ${masked.join(' ')} (${words.length} word${words.length > 1 ? 's' : ''})`
  }
  return ''
}

export function getCountryHint(roundInfo: { [key: string]: string | string[] }, level: number = 1, correctReponses?: string[]): string {
  // If the country is already guessed, return empty string
  if (correctReponses && correctReponses.includes('Country')) return '';

  // Define hint levels
  const level1HintChars = 1;
  const level2HintChars = 2;
  const countryVal = roundInfo['Country']
  const country = Array.isArray(countryVal) ? countryVal[0] : countryVal
  
  // If country is not defined or empty, return empty string
  if (country && country.length > 0) {
    const words = country.trim().split(/\s+/)
    const masked = words.map(word => maskHint(word, level, level1HintChars, level2HintChars));
    return `💡 The country: ${masked.join(' ')} (${words.length} word${words.length > 1 ? 's' : ''})`;
  }
  return ''
}

export function getPartyHint(roundInfo: { [key: string]: string | string[] }, level: number = 1, correctReponses?: string[]): string {
  // If the party is already guessed, return empty string
  if (correctReponses && correctReponses.includes('Party')) return '';

  const level1HintChars = 2;
  const level2HintChars = 3;
  const partyVal = roundInfo['Party']
  const party = Array.isArray(partyVal) ? partyVal[0] : partyVal
  
  if (party && party.length > 0) {
    const words = party.trim().split(/\s+/)
    const masked = words.map(word => maskHint(word, level, level1HintChars, level2HintChars));
    return `🕺 The party name: ${masked.join(' ')} (${words.length} word${words.length > 1 ? 's' : ''})`
  }
  return ''
}

export function getYearHint(appState: { [key: string]: any }, isCorrect?: boolean, responseValue?: string, level: number = 1): string {

  // If the year is already guessed, return empty string
  if (appState.correctReponses && appState.correctReponses.includes('Year')) return '';
  if (
    typeof isCorrect === 'boolean' &&
    responseValue !== undefined &&
    !isCorrect &&
    appState.roundInfo['Year'] &&
    !isNaN(parseInt(responseValue, 10))
  ) {
    const year = String(appState.roundInfo['Year']);
    const yearResponse = parseInt(responseValue, 10);
    if (level === 2) {
      // Mask year: first and last digit, rest as X
      if (year.length <= 2) {
        return `Year hint: ${year}`;
      } else {
        return `Year hint: ${year[0]}${'X'.repeat(year.length - 2)}${year[year.length - 1]}`;
      }
    } else {
      return getYearHintText(Number(year), yearResponse);
    }
  }
  return '';
}



export function getNextMultipleResponseHint(roundInfo: { [key: string]: string | string[] }, correctReponses: string[]): string {
    
    const nextItem = getNextUnansweredArrayItem(roundInfo, correctReponses);
    if (nextItem) {
      const { key, item } = nextItem;
      const maskedItem = maskHint(item, 1, 1, 2); // Level 1 hint
      const hint = `🔍 Next ${key}: ${maskedItem}`;
      return hint;
    }
    return '';
}

export function getLastChanceHint(appState: any): string {
  const roundInfo = appState.roundInfo;

  const remainingKeys = Object.keys(roundInfo).filter(key => {
    if (key === 'Sound system' && Array.isArray(roundInfo[key])) {
      return roundInfo[key].some((sound: string) => !appState.correctReponses.includes('Sound system:' + sound));
    }
    return !appState.correctReponses.includes(key);
  });
  if (remainingKeys.length !== 1) return '';
  const key = remainingKeys[0];
  let hint = '';
  if (key === 'Party') {
    hint = getPartyHint(roundInfo, 2);
  } else if (key === 'Sound system') {
    hint = getSoundHint(roundInfo, appState.correctReponses, 2);
  } else if (key === 'Country') {
    hint = getCountryHint(roundInfo, 2);
  } else if (key === 'Year') {
    hint = getYearHint(appState, false, String(roundInfo['Year']), 2);
  }
  return `<b>💎 LAST CHANCE!</b><br>${hint}`;
}

export function getNextUnansweredArrayItem(roundInfo: { [key: string]: string | string[] }, correctReponses: string[]): { key: string, item: string } | null {
  for (const [key, value] of Object.entries(roundInfo)) {
    if (Array.isArray(value) && value.length > 1) {
      // Busca el primer item no respondido
      const unanswered = value.find(item => !correctReponses.includes(`${key}:${item}`));
      if (unanswered) {
        return { key, item: unanswered };
      }
    }
  }
  return null;
}
