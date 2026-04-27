export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class HttpError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
        this.name = "HttpError";
    }
}

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new HttpError(
            response.status,
            `HTTP ${response.status}: ${response.statusText}`,
        );
    }
    return response.json() as Promise<T>;
}

export async function get<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    return parseResponse<T>(response);
}

export async function post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return parseResponse<T>(response);
}
