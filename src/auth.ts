import { authenticate } from "./services/authService";

export interface Session {
    email: string;
    loginAt: number;
}

const SESSION_KEY = "easytimer.session";
const SESSION_EXPIRY_MS = 3_600_000; // 1 hour

export function isAuthenticated(): boolean {
    return getSession() !== null;
}

export function getSession(): Session | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    let session: Session;
    try {
        session = JSON.parse(raw) as Session;
    } catch {
        return null;
    }

    const isExpired = Date.now() - session.loginAt > SESSION_EXPIRY_MS;
    if (isExpired) {
        localStorage.removeItem(SESSION_KEY);
        return null;
    }

    return session;
}

export async function login(email: string, password: string): Promise<boolean> {
    const result = await authenticate(email, password);
    if (!result.success) return false;

    const session: Session = { email: result.email ?? email, loginAt: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
}

export function logout(): void {
    localStorage.removeItem(SESSION_KEY);
}
