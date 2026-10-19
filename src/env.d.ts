// Text imports: "./card.css?raw" is the file content as a string (Vite in
// tests, the raw-text plugin in scripts/build.mjs).
declare module "*?raw" {
  const text: string;
  export default text;
}

// Set by scripts/build.mjs: package version plus the git revision.
declare const __VERSION__: string;
