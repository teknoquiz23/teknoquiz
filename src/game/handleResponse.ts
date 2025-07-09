import { getHint, shouldDisplayHint, getLastChanceHint, getYearHint, getRemainingItems } from './getHints';
import { playCorrectSound, playErrorSound, playHintSound } from '../ui/playSounds';
import { updateResultsUI } from '../ui/updateResults';
import { updateCorrectResponsesProgressBar, updateTriesProgressBar, showNextImage } from '../ui/utils';
import type { AppState } from '../state/appState';

// These will be injected or imported as needed
// import { appState } from '../state/appState';
// import { validateAndSaveResponse } from './validateAndSave';

export function handleResponse(responseValue: string, appState: AppState, validateAndSaveResponse: (responseValue: string, appState: AppState) => boolean, isWinner: () => boolean, isMultipleResponse: (roundInfo: { [key: string]: string | string[] }, responseValue: string) => boolean, gameWinner: (appState: AppState) => void, gameOver: (appState: AppState) => void, displayHint: (hint: string) => void, deleteHint: () => void, increaseTriesUsed: () => void, gtag: (...args: any[]) => void) {
  deleteHint();
  if (!responseValue || !appState.roundInfo) return;
  const isCorrect = validateAndSaveResponse(responseValue, appState);
  if (isCorrect) {
    handleCorrectResponse(responseValue, appState, isWinner, isMultipleResponse, gameWinner, displayHint, updateResultsUI, playCorrectSound, updateCorrectResponsesProgressBar, gtag);
  } else {
    handleIncorrectResponse(responseValue, isCorrect, appState, gameOver, displayHint, playErrorSound, updateTriesProgressBar, showNextImage, getRemainingItems, getLastChanceHint, playHintSound, getYearHint, shouldDisplayHint, getHint, gtag, increaseTriesUsed);
  }
}

export function handleCorrectResponse(responseValue: string, appState: AppState, isWinner: () => boolean, isMultipleResponse: (roundInfo: { [key: string]: string | string[] }, responseValue: string) => boolean, gameWinner: (appState: AppState) => void, displayHint: (hint: string) => void, updateResultsUI: (appState: AppState) => void, playCorrectSound: () => void, updateCorrectResponsesProgressBar: (appState: AppState) => void, gtag: (...args: any[]) => void) {
  if (isWinner()) {
    gameWinner(appState);
  } else if (isMultipleResponse(appState.roundInfo, responseValue)) {
    const hintMessage = getHint(appState, 1);
    playCorrectSound();
    displayHint(`<b>✅ Correct!</b><br>${hintMessage}`);
    updateResultsUI(appState);
  } else {
    playCorrectSound();
    displayHint(`<b>✅ Correct!</b>`);
    updateResultsUI(appState);
  }
  updateCorrectResponsesProgressBar(appState);
  gtag('event', 'CorrectResponse', {
    event_category: 'Responses',
    event_label: appState.roundInfo['id'] || '',
    value: 1
  });
}

export function handleIncorrectResponse(responseValue: string, isCorrect: boolean, appState: AppState, gameOver: (appState: AppState) => void, displayHint: (hint: string) => void, playErrorSound: (triesUsed: number, maxTries: number) => void, updateTriesProgressBar: (appState: AppState) => void, showNextImage: (appState: AppState) => void, getRemainingItems: (appState: AppState) => any, getLastChanceHint: (appState: AppState) => string, playHintSound: () => void, getYearHint: (appState: AppState, isCorrect: boolean, responseValue: string) => string, shouldDisplayHint: (appState: AppState) => boolean, getHint: (appState: AppState, n: number) => string, gtag: (...args: any[]) => void, increaseTriesUsed: () => void) {
  gtag('event', 'IncorrectResponse', {
    event_category: 'Responses',
    event_label: appState.roundInfo['id'] || '',
    value: 1
  });
  increaseTriesUsed();
  playErrorSound(appState.triesUsed, appState.maxTries);
  updateTriesProgressBar(appState);
  // Show next image
  const MAX_IMAGES = 3;
  const IMAGE_ERRORS_THRESHOLD = 3;
  if (appState.triesUsed % IMAGE_ERRORS_THRESHOLD === 0 && appState.roundImage < MAX_IMAGES) {
    showNextImage(appState);
  }
  // If tries used exceeds max tries, end the game
  if (appState.triesUsed >= appState.maxTries) {
    gameOver(appState);
    return;
  }
  // Handle hint logic
  const remainingItems = getRemainingItems(appState);
  if (Object.keys(remainingItems).length === 1 && appState.triesUsed === appState.maxTries - 1) {
    displayHint(getLastChanceHint(appState));
    playHintSound();
    return;
  } else if (Number(responseValue)) {
    const yearHint = getYearHint(appState, isCorrect, responseValue);
    displayHint(`${yearHint}`);
    playHintSound();
    return;
  } else if (shouldDisplayHint(appState)) {
    const hintMessage = getHint(appState, 1);
    displayHint(hintMessage.trim());
    playHintSound();
  }
}
