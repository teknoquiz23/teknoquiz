import { getHint, shouldDisplayHint, getLastChanceHint, getYearHint, getRemainingItems } from './getHints';
import { playCorrectSound, playErrorSound, playHintSound } from '../ui/playSounds';
import { updateResultsUI } from '../ui/updateResults';
import { updateCorrectResponsesProgressBar, updateTriesProgressBar, showNextImage, isMultipleResponse, increaseTriesUsed } from '../ui/utils';
import { deleteHint, isWinner, gameWinner, displayHint, gameOver } from '../main'
import { validateAndSaveResponse } from './validateAndSave';
import type { AppState } from '../state/appState';


export function handleResponse(responseValue: string, appState: AppState) {
  deleteHint();
  if (!responseValue || !appState.roundInfo) return;
  const isCorrect = validateAndSaveResponse(responseValue, appState);
  if (isCorrect) {
    handleCorrectResponse(responseValue, appState);
  } else {
    handleIncorrectResponse(responseValue, isCorrect, appState);
  }
}

export function handleCorrectResponse(responseValue: string, appState: AppState) {
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
//   gtag('event', 'CorrectResponse', {
//     event_category: 'Responses',
//     event_label: appState.roundInfo['id'] || '',
//     value: 1
//   });
}

export function handleIncorrectResponse(responseValue: string, isCorrect: boolean, appState: AppState) {
//   gtag('event', 'IncorrectResponse', {
//     event_category: 'Responses',
//     event_label: appState.roundInfo['id'] || '',
//     value: 1
//   });
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
