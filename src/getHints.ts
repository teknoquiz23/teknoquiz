interface AppState {
  triesUsed: number;
  currentImage: string;
  roundInfo: { [key: string]: string | string[] };
  correctReponses: string[];
  correctResObject: { [key: string]: string | string[] };
  roundImage: number;
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



export function getLastChanceHint(appState: AppState): string {
  const hint = getNewHint(appState, 2);
  return `<b>💎 LAST CHANCE!</b> ${hint}`;
}



export function maskHint(word: string, level: number, level1HintChars: number = 1, level2HintChars: number = 2): string {
  if (level === 2) {
    return word.slice(0, level2HintChars).toUpperCase() + 'X'.repeat(word.length - level2HintChars);
  } else {
    return word.slice(0, level1HintChars).toUpperCase() + 'X'.repeat(word.length - level1HintChars);
  }
}


export function getNewHint(appState: AppState, level: number = 1): string{

  // TODO if is year, use getYearhint
  const remainingItems = getRemainingItems(appState);
  console.log('getNewHint remainingItems', remainingItems)

  const firstKey = Object.keys(remainingItems)[0];
  if (firstKey) {
    // Define hint levels
    let level1HintChars = 1;
    let level2HintChars = 2;
    if (firstKey === 'Party') {
      level1HintChars = 2;
      level2HintChars = 3;
    }

    const firstValue = remainingItems[firstKey][0]; // Use only the first array item
    console.log('getNewHint firstValue', firstValue);

    const maskedHint = firstValue
      .split(/\s+/) // Split by spaces
      .map(word => maskHint(word, level, level1HintChars, level2HintChars))
      .join(' ');

    return `💡 ${firstKey}: ${maskedHint}`;
  }

  return 'No more hints available';
}

export function isNumber(value: any): boolean {
  return typeof value === 'number' || (!isNaN(Number(value)) && value !== undefined && value !== null && value !== '');
}


// Get remaining items that have not been answered
// This function checks the appState.roundInfo and compares it with appState.correctResObject
// It returns an array of keys that have not been answered yet
// It also handles nested objects and arrays in the roundInfo
// make sure to normalize the strings for comparison

export function getRemainingItems(appState: AppState): { [key: string]: string[] } {
  const normalize = (str: string) => str.toLowerCase().trim();
  const { roundInfo, correctResObject } = appState;

  // Step 1: Copy roundInfo into filtered (deep copy for arrays)
  const filtered: { [key: string]: string[] } = {};
  Object.keys(roundInfo).forEach(key => {
    const value = roundInfo[key];
    if (Array.isArray(value)) {
      filtered[key] = [...value];
    } else {
      filtered[key] = [value as string];
    }
  });

  // Step 2: Delete every value that you can find in correctResObject
  Object.keys(filtered).forEach(key => {
    const correctValue = correctResObject[key];
    if (Array.isArray(filtered[key])) {
      if (Array.isArray(correctValue)) {
        // Remove values present in correctResObject (normalize for comparison)
        filtered[key] = filtered[key].filter(
          v => !correctValue.map(x => normalize(String(x))).includes(normalize(String(v)))
        );
      } else if (typeof correctValue === 'string') {
        filtered[key] = filtered[key].filter(
          v => normalize(String(v)) !== normalize(correctValue)
        );
      }
    }
    // Remove key if nothing left
    if (filtered[key].length === 0) {
      delete filtered[key];
    }
  });
  console.log('getRemainingItems filtered', filtered);

  return filtered;
}