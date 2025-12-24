/// <reference types="vite/client" />

declare module 'swiper/css';
declare module 'swiper/css/*';

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
