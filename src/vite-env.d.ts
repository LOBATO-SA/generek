/// <reference types="vite/client" />

declare module 'swiper/css';
declare module 'swiper/css/*';

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_BYTESCALE_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
