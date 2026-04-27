import { invoke } from "@tauri-apps/api/core";
import { defaultActivity } from "./activity";
import { isAuthenticated, logout } from "./auth";
import { requireElement } from "./dom";
import { applyTranslations, getLocale, initLocale, t } from "./i18n";
import { initLoginView, showAppView, showLoginView } from "./login";
import { fetchActivityOptions } from "./services/activityService";
import { formatDurationHms } from "./time";
import {
    createTimer,
    finalizeTimer,
    getElapsedMs,
    resetTimer,
    startTimer,
} from "./timer";
import type { TimerState } from "./timer";
import { getExportDir } from "./exportDir";
import { populateSelects, readActivity, setSelectsLocked, writeActivity } from "./form";
import { setExportedPath, setExportPathText, setStatus } from "./status";
import { exportEntry } from "./export";
import { pickExportDir } from "./folder";

const timer: TimerState = createTimer();
let appSetupDone = false;

// ─── DOM refs (queried once; only valid after #view-app is visible) ───────────

function getAppElements() {
    return {
        timeDisplay: requireElement<HTMLElement>("#time-display"),
        btnStart: requireElement<HTMLButtonElement>("#btn-start"),
        btnFinish: requireElement<HTMLButtonElement>("#btn-finish"),
        btnExport: requireElement<HTMLButtonElement>("#btn-export"),
        btnPickFolder: requireElement<HTMLButtonElement>("#btn-pick-folder"),
        btnLogout: requireElement<HTMLButtonElement>("#btn-logout"),
        commentApontamento: requireElement<HTMLTextAreaElement>("#comment-apontamento"),
        commentAtividade: requireElement<HTMLTextAreaElement>("#comment-atividade"),
    };
}

// ─── Timer & render ───────────────────────────────────────────────────────────

function canExport(): boolean {
    return timer.accumulatedMs > 0 && timer.wallClockEndMs != null;
}

function syncTrayTimer(): void {
    if (timer.isRunning) {
        const timeText = formatDurationHms(getElapsedMs(timer));
        invoke("update_tray_timer", { taskId: readActivity().task, timeText }).catch(console.error);
    } else {
        invoke("clear_tray_timer").catch(console.error);
    }
}

function renderUI(els: ReturnType<typeof getAppElements>): void {
    els.timeDisplay.textContent = formatDurationHms(getElapsedMs(timer));
    els.btnStart.disabled = timer.isRunning;
    els.btnFinish.disabled = !timer.isRunning;
    els.btnExport.disabled = !canExport();
    setSelectsLocked(timer.isRunning);
}

// ─── Event handlers ───────────────────────────────────────────────────────────

function handleStartClick(els: ReturnType<typeof getAppElements>): void {
    startTimer(timer);
    setStatus(t("status.counting"));
    renderUI(els);
    syncTrayTimer();
}

function handleFinishClick(els: ReturnType<typeof getAppElements>): void {
    finalizeTimer(timer);
    setStatus(t("status.finished"));
    renderUI(els);
    syncTrayTimer();
}

async function handlePickFolderClick(els: ReturnType<typeof getAppElements>): Promise<void> {
    await pickExportDir();
    renderUI(els);
    syncTrayTimer();
}

async function handleExportClick(els: ReturnType<typeof getAppElements>): Promise<void> {
    if (!canExport()) return;
    if (!els.commentApontamento.value.trim()) {
        els.commentApontamento.setCustomValidity(t("validation.required"));
        els.commentApontamento.reportValidity();
        return;
    }
    els.commentApontamento.setCustomValidity("");
    const savedPath = await exportEntry({
        exportDir: getExportDir(),
        timer,
        activity: readActivity(),
        comentarioApontamento: els.commentApontamento.value,
        comentarioAtividade: els.commentAtividade.value,
    });
    resetTimer(timer);
    els.commentApontamento.value = "";
    els.commentAtividade.value = "";
    if (savedPath) {
        setExportedPath(savedPath);
    }
    renderUI(els);
    syncTrayTimer();
}

function handleLogout(): void {
    logout();
    showLoginView();
}

// ─── App bootstrap ────────────────────────────────────────────────────────────

async function initApp(): Promise<void> {
    showAppView();
    applyTranslations();

    let activityOptions;
    try {
        activityOptions = await fetchActivityOptions();
    } catch (e) {
        setStatus(t("status.loadFailed", { error: String(e) }), "error");
        console.error("Failed to load activity options:", e);
        return;
    }

    const els = getAppElements();

    populateSelects(activityOptions);
    writeActivity(defaultActivity(activityOptions));
    setExportPathText(getExportDir());

    if (!appSetupDone) {
        appSetupDone = true;

        setInterval(() => {
            renderUI(els);
            syncTrayTimer();
        }, 250);

        els.btnStart.addEventListener("click", () => handleStartClick(els));
        els.btnFinish.addEventListener("click", () => handleFinishClick(els));
        els.btnPickFolder.addEventListener("click", () => void handlePickFolderClick(els));
        els.btnExport.addEventListener("click", () => void handleExportClick(els));
        els.btnLogout.addEventListener("click", handleLogout);
        els.commentApontamento.addEventListener("input", () => {
            els.commentApontamento.setCustomValidity("");
        });
    }

    renderUI(els);
    syncTrayTimer();
}

// ─── Entry point ──────────────────────────────────────────────────────────────

initLocale();
applyTranslations();

if (isAuthenticated()) {
    void initApp();
} else {
    initLoginView(() => void initApp(), getLocale());
}
