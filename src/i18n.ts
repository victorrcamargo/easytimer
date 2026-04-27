import ptBR from "./locales/pt-BR.json";
import esLA from "./locales/es-LA.json";

export type Locale = "pt-BR" | "es-LA";

type TranslationMap = Record<string, string>;

const LOCALE_KEY = "easytimer.locale";
const DEFAULT_LOCALE: Locale = "pt-BR";

const translations: Record<Locale, TranslationMap> = {
    "pt-BR": ptBR,
    "es-LA": esLA,
};

let activeLocale: Locale = DEFAULT_LOCALE;

export function getLocale(): Locale {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored === "pt-BR" || stored === "es-LA") return stored;
    return DEFAULT_LOCALE;
}

export function setLocale(locale: Locale): void {
    activeLocale = locale;
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale;
}

export function initLocale(): void {
    activeLocale = getLocale();
    document.documentElement.lang = activeLocale;
}

export function t(key: string, params?: Record<string, string>): string {
    const map = translations[activeLocale];
    let value = map[key] ?? key;
    if (params) {
        for (const [placeholder, replacement] of Object.entries(params)) {
            value = value.replace(new RegExp(`\\{\\{${placeholder}\\}\\}`, "g"), replacement);
        }
    }
    return value;
}

export function applyTranslations(): void {
    document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
        const key = el.dataset.i18n!;
        el.textContent = t(key);
    });

    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        "[data-i18n-placeholder]",
    ).forEach((el) => {
        const key = el.dataset.i18nPlaceholder!;
        el.placeholder = t(key);
    });

    document.querySelectorAll<HTMLElement>("[data-i18n-aria-label]").forEach(
        (el) => {
            const key = el.dataset.i18nAriaLabel!;
            el.setAttribute("aria-label", t(key));
        },
    );

    document.querySelectorAll<HTMLElement>("[data-i18n-title]").forEach(
        (el) => {
            const key = el.dataset.i18nTitle!;
            el.title = t(key);
        },
    );
}
