// UI rendering utilities for the quiz app
import { getImageFolder } from '../initGame';
import type { AppState } from '../state/appState';
import { appConfig } from '../initGame';

export function renderGameUI(appState: AppState) {
  const MAX_IMAGES = 3;
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <p>${appState.inputDescription}</p>
    <div class="game">
      <div class="image-container">
        <img src="${getImageFolder()}${appState.currentImage}-${appState.roundImage}.png" alt="Random party" style="width: 100%; border-radius: 8px;" />
        <p id="round-image-counter" class="round-image-counter">Image ${appState.roundImage} of ${MAX_IMAGES}</p>
      </div>
      <div class="game-ui">
        <div class="game-ui-inner">
          <div class="progress-bars">
            <div id="progress-bar-tries" class="progress-bar">
              <span id="tries-used-text" class="progress-bar-text">Tries used: <b><span id="tries-used">0</span> / ${appState.maxTries}</b></span>
              <span class="progress-bar-fill tries" style="width:0"></span>
            </div>
            ${appState.roundInfoCount > 1 ? `
            <div id="progress-bar-responses" class="progress-bar">
              <span class="progress-bar-text">Correct responses: <b><span id="correct-responses">0</span> / <span id="total-responses">${appState.roundInfoCount}</span></b></span>
              <span class="progress-bar-fill responses" style="width:0"></span>
            </div>
            ` : ''}
          </div>
          <div class="guess-wrap">
            <div>
              <input id="guess-input" class="guess-input" type="text" placeholder="${appState.inputDescription}" />
              <button id="guess-btn" class="guess-btn" type="button">Go</button>
            </div>
          </div>
        </div>
      </div>
      <div id="hints-wrap" class="hints-wrap" style="margin:0;margin-bottom: 2rem;"></div>
      <div class="results-data">
        ${generateRoundHTML(appState.roundInfo)}
      </div>
    </div>
  `;
}

export function setAppNameTitleAndIcon() {
  const titleEl = document.getElementById('app-name-title');
  if (titleEl) titleEl.textContent = appConfig.appName.charAt(0).toUpperCase() + appConfig.appName.slice(1);
  const iconEl = document.getElementById('app-name-icon');
  if (iconEl) iconEl.textContent = appConfig.appIcon || '';
}

export function generateRoundHTML(roundInfo: { [key: string]: string | string[] }): string {
  if (!roundInfo) return '';
  return Object.keys(roundInfo)
    .map(key => {
      const values = Array.isArray(roundInfo[key]) ? roundInfo[key] : [roundInfo[key]];
      const label = values.length > 1 ? `${key} (${values.length}):` : `${key}:`;
      return `<div><b>${label}</b> <span class="result-${key.toLowerCase().replace(/\s+/g, '-')}" ></span></div>`;
    })
    .join('');
}

export function generateInputDescription(roundInfo: { [key: string]: string | string[] }): string {
  const keys = Object.keys(roundInfo).map(key => key.toLowerCase());
  if (keys.length === 0) return '';
  if (keys.length === 1) return `Guess the ${keys[0]} based on the image`;
  if (keys.length === 2) return `Guess the ${keys[0]} and ${keys[1]} based on the image`;
  // For 3 or more keys, join with commas and 'and' before the last
  const allButLast = keys.slice(0, -1).join(', ');
  const last = keys[keys.length - 1];
  return `Guess the ${allButLast}, and ${last} based on the image`;
}
