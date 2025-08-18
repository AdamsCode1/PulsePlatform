/// <reference types="vite/client" />

interface ImportMetaEnv extends Readonly<Record<string, string>> {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  // Note: provider secrets (e.g. SendGrid keys) must NOT use VITE_-prefix or appear here.
}

interface ImportMeta {
  env: ImportMetaEnv;
}
