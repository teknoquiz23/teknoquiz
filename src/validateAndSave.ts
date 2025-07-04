interface AppState {
  triesUsed: number;
  currentImage: string;
  roundInfo: { [key: string]: string | string[] };
  correctReponses: string[];
  correctResObject: { [key: string]: string | string[] };
  roundImage: number;
}

export function saveCorrReponseObject(foundKey: string, inputValue: string, appState: AppState): void {
  const { correctResObject } = appState;
  // Create or use the correctResObject from appState
  if (!correctResObject[foundKey]) {
    correctResObject[foundKey] = inputValue;
  } else {
    // If already present, push new value(s) without overwriting
    if (Array.isArray(correctResObject[foundKey])) {
      if (!(correctResObject[foundKey] as string[]).includes(inputValue)) {
        (correctResObject[foundKey] as string[]).push(inputValue);
      }
    } else if (correctResObject[foundKey] !== inputValue) {
      correctResObject[foundKey] = [correctResObject[foundKey] as string, inputValue];
    }
  }
  appState.correctResObject = correctResObject;
}


// Validate the response against the roundInfo
export function validateAndSaveResponse(inputValue: string, appState: AppState): boolean {
  const { roundInfo } = appState;
  const key = getKeyForInputValue(inputValue, roundInfo);
  if (key) {
    saveCorrReponseObject(key, inputValue, appState);
    return true;
  }
  return false;
}

// Move to validate and save the response
function normalize(str:string): string {
  return String(str)
    .toLowerCase()
    .trim();
}

// Find a matching key in the roundInfo object
export function getKeyForInputValue(inputValue: string, roundInfo: { [key: string]: string | string[] }): string | null {
  const normalizedInput = normalize(inputValue);

  for (const [key, value] of Object.entries(roundInfo)) {
    console.log('Checking key:', key, 'with value:', value, 'for input:', inputValue);
    if (Array.isArray(value)) {
      for (const item of value) {
        if (normalize(item) === normalizedInput) { 
          return key;
        }
      }
    } else {
      if (normalize(value) === normalizedInput) {
        return key;
      }
    }
  }

  return null; 
}