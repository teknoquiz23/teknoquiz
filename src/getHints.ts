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


// Only executed if response was correct
export function getNextMultipleResponseHint(roundInfo: { [key: string]: string | string[] }, correctReponses: string[]): string {
    
    const nextItem = getNextUnansweredMultipleItem(roundInfo, correctReponses);
    if (nextItem) {
      const { key, item } = nextItem;
      const maskedItem = maskHint(item, 1, 1, 2); // Level 1 hint
      const hint = `🔍 Next ${key}: ${maskedItem}`;
      return hint;
    }
    return '';
}

export function getLastChanceHint(appState: any, key: string): string {
  const roundInfo = appState.roundInfo;

  let hint = '';
  if (isRemainingKeyInsideMultiple(roundInfo, key)) {
    // If the key is an array, provide a hint for the next unanswered item
    const nextItem = getNextUnansweredMultipleItem(roundInfo, appState.correctReponses);
    if (nextItem) {
      // mask the item for the hint
      const maskedItem = maskHint(nextItem.item, 2); // Level 2 hint
      hint = `🔍 Next ${nextItem.key}: ${maskedItem}`;
    }
  }
  else if (key === 'Year') {
    // check if roundInfo's year is a number by using key var
    const value = roundInfo[key];
    if (isNumber(value)) {
      hint = getYearHint(appState, false, String(value), 2);
    }
  }
  else {
    hint = getSingleHint(roundInfo, key, 2, appState.correctReponses);
  }
  return `<b>💎 LAST CHANCE!</b><br>${hint}`;
}

export function getNextUnansweredMultipleItem(roundInfo: { [key: string]: string | string[] }, correctReponses: string[]): { key: string, item: string } | null {
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

export function isRemainingKeyInsideMultiple(roundInfo: { [key: string]: string | string[] }, key: string): boolean {
  return Array.isArray(roundInfo[key]);
}

function maskHint(word: string, level: number, level1HintChars: number = 1, level2HintChars: number = 2): string {
  if (level === 2) {
    return word.slice(0, level2HintChars).toUpperCase() + 'X'.repeat(word.length - level2HintChars);
  } else {
    return word.slice(0, level1HintChars).toUpperCase() + 'X'.repeat(word.length - level1HintChars);
  }
}

export function getSingleHint(
  roundInfo: { [key: string]: string | string[] },
  key: string,
  level: number = 1,
  correctResObject?: { [key: string]: string | string[] }
): string {
  // If the item is already guessed, return empty string
  if (correctResObject && correctResObject[key]) return '';

  // Define hint levels
  let level1HintChars = 1;
  let level2HintChars = 2;
  if (key === 'Party') {
    level1HintChars = 2;
    level2HintChars = 3;
  }
  const value = roundInfo[key];
  const item = Array.isArray(value) ? value[0] : value;
  if (item && item.length > 0) {
    const words = item.trim().split(/\s+/);
    const masked = words.map(word => maskHint(word, level, level1HintChars, level2HintChars));
    return `💡 ${key}: ${masked.join(' ')} (${words.length} word${words.length > 1 ? 's' : ''})`;
  }
  return '';
}

export function isNumber(value: any): boolean {
  return typeof value === 'number' || (!isNaN(Number(value)) && value !== undefined && value !== null && value !== '');
}