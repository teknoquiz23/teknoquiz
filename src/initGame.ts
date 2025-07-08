// initGame.ts
// Centralized app configuration and initialization

export const appConfig = {
  appName: 'band', // Change this to switch app context
  appIcon: '🎸', // Icon to display in the title
  // You can add more config options here as needed
};

// export const appConfig = {
//   appName: 'tekno', // Change this to switch app context
//   appIcon: '🔊', // Icon to display in the title
//   // You can add more config options here as needed
// };

// Utility to get the data module and image folder based on appName
export function getAppDataModule() {
  // Dynamically import the data module based on appConfig.appName
  return import(`./games/${appConfig.appName}.ts`);
}

export function getImageFolder() {
  // Dynamically return the image folder based on appConfig.appName
  return `/images/${appConfig.appName}/`;
}
