import { appState } from '../state/appState';
import { getAppDataModule, appConfig } from '../initGame';
import { getPlayedGameIds } from '../utils/storage';
import { setupRoundInfo } from './setupRoundInfo.ts';
import { renderGameUI, setAppNameTitleAndIcon } from '../ui/renderGameUI.ts';
import { setupEventListeners } from '../ui/eventListeners.ts';

export async function initGame() {
  // Set up app name and icon in the UI
  setAppNameTitleAndIcon();
  const playedIds = getPlayedGameIds();
  const module = await getAppDataModule();
  const items = module.items;
  const unplayedParties = items.filter((p: any) => !playedIds.includes(p.id));

  if (unplayedParties.length === 0) {
    // TODO: Implement displayYouWonAllGamesMessage or import and call it here
    return;
  }

  await setupRoundInfo(appState, unplayedParties);
  appState.maxTries = getMaxTries(appState.roundInfo);
  appState.roundInfoCount = Object.values(appState.roundInfo).reduce((acc: number, val) => acc + (Array.isArray(val) ? val.length : 1), 0);
  renderGameUI(appState);
}

function getMaxTries(roundInfo: { [key: string]: string | string[] }): number {
  const numItems = Object.values(roundInfo).reduce((acc: number, val) => acc + (Array.isArray(val) ? val.length : 1), 0);
  return Math.max(10, numItems * 3);
}
