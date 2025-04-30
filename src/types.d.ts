declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '@fontsource/inter/*';
declare module '@fontsource/jetbrains-mono/*';

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
} 