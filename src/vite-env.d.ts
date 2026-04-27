/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_MOCK_EMAIL: string;
    readonly VITE_MOCK_PASSWORD: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
