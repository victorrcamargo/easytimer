import { login } from "./auth";
import { requireElement } from "./dom";
import { applyTranslations, setLocale, t, type Locale } from "./i18n";

const viewLogin = requireElement<HTMLElement>("#view-login");
const viewApp = requireElement<HTMLElement>("#view-app");
const formLogin = requireElement<HTMLFormElement>("#form-login");
const inputEmail = requireElement<HTMLInputElement>("#login-email");
const inputPassword = requireElement<HTMLInputElement>("#login-password");
const loginStatus = requireElement<HTMLElement>("#login-status");
const btnLangPtBR = requireElement<HTMLButtonElement>("#btn-lang-ptbr");
const btnLangEsLA = requireElement<HTMLButtonElement>("#btn-lang-esla");

function showLoginError(message: string): void {
    loginStatus.textContent = message;
    loginStatus.hidden = false;
}

function clearLoginError(): void {
    loginStatus.textContent = "";
    loginStatus.hidden = true;
}

function updateLangButtons(locale: Locale): void {
    btnLangPtBR.setAttribute("aria-pressed", String(locale === "pt-BR"));
    btnLangEsLA.setAttribute("aria-pressed", String(locale === "es-LA"));
}

function handleLangSwitch(locale: Locale): void {
    setLocale(locale);
    applyTranslations();
    updateLangButtons(locale);
    clearLoginError();
}

async function handleLoginSubmit(event: SubmitEvent, onSuccess: () => void): Promise<void> {
    event.preventDefault();
    clearLoginError();

    const submitBtn = event.submitter instanceof HTMLButtonElement ? event.submitter : null;
    if (submitBtn) submitBtn.disabled = true;

    try {
        const email = inputEmail.value.trim();
        const password = inputPassword.value;
        const success = await login(email, password);

        if (!success) {
            showLoginError(t("login.errorInvalid"));
            return;
        }

        onSuccess();
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

export function showAppView(): void {
    viewLogin.classList.add("hidden");
    viewApp.classList.remove("hidden");
}

export function showLoginView(): void {
    viewApp.classList.add("hidden");
    viewLogin.classList.remove("hidden");
    inputEmail.value = "";
    inputPassword.value = "";
    clearLoginError();
}

export function initLoginView(
    onSuccess: () => void,
    currentLocale: Locale,
): void {
    updateLangButtons(currentLocale);

    formLogin.addEventListener("submit", (e) =>
        void handleLoginSubmit(e as SubmitEvent, onSuccess),
    );

    btnLangPtBR.addEventListener("click", () => handleLangSwitch("pt-BR"));
    btnLangEsLA.addEventListener("click", () => handleLangSwitch("es-LA"));
}
