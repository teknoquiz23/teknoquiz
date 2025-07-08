export interface AppState {
  triesUsed: number;
  currentImage: string;
  roundInfo: { [key: string]: string | string[] };
  roundInfoCount: number;
  correctResObject: { [key: string]: string | string[] };
  roundImage: number;
  maxTries: number;
  inputDescription: string;
}

export const appState: AppState = {
  triesUsed: 0,
  currentImage: '',
  roundInfo: {},
  roundInfoCount: 0, // will be set after roundInfo is set
  correctResObject: {},
  roundImage: 1,
  maxTries: 10, // will be set after roundInfo is set
  inputDescription: ''
};
