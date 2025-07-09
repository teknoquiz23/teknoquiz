interface AppState {
  triesUsed: number;
  currentImage: string;
  roundInfo: { [key: string]: string | string[] };
  correctResObject: { [key: string]: string | string[] };
  roundImage: number;
}

export function saveCorrReponseObject(foundKey: string, inputValue: string, appState: AppState): void {
  const { correctResObject } = appState;
  if (!correctResObject[foundKey]) {
    correctResObject[foundKey] = inputValue;
  } else {
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

export function validateAndSaveResponse(inputValue: string, appState: AppState): boolean {
  const { roundInfo } = appState;
  const key = getKeyForInputValue(inputValue, roundInfo);
  if (key) {
    saveCorrReponseObject(key, inputValue, appState);
    return true;
  }
  return false;
}

function normalize(str:string): string {
  return String(str)
    .toLowerCase()
    .trim();
}

export function getKeyForInputValue(inputValue: string, roundInfo: { [key: string]: string | string[] }): string | null {
  const normalizedInput = normalize(inputValue);
  for (const [key, value] of Object.entries(roundInfo)) {
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
