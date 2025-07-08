// Shims for importing .vue files in TypeScript
// This allows TypeScript to understand .vue imports

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
