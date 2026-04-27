// TODO: import { post } from "./http";

export interface AuthResult {
    success: boolean;
    email?: string;
}

// Mock credentials — replace with real API call when backend is ready.
const MOCK_EMAIL = import.meta.env.VITE_MOCK_EMAIL;
const MOCK_PASSWORD = import.meta.env.VITE_MOCK_PASSWORD;

export async function authenticate(
    email: string,
    password: string,
): Promise<AuthResult> {
    // TODO: return post<AuthResult>("/auth/login", { email, password });
    const success = email === MOCK_EMAIL && password === MOCK_PASSWORD;
    return Promise.resolve(success ? { success: true, email } : { success: false });
}
