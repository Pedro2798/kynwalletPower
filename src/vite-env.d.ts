/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_USERS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
