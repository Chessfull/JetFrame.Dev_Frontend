declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '@fontsource/inter/*';
declare module '@fontsource/jetbrains-mono/*'; 