import { invoke } from "@tauri-apps/api/core";
import { defaultActivity, type Activity } from "./activity";
import { requireElement } from "./dom";
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
import { populateSelects, readActivity, writeActivity } from "./form";
import {
    setExportedPath,
    setExportPathText,
    setStatus,
} from "./status";
import { exportEntry } from "./export";
import { pickExportDir } from "./folder";

const timeDisplay = requireElement<HTMLElement>("#time-display");
const btnStart = requireElement<HTMLButtonElement>("#btn-start");
const btnFinish = requireElement<HTMLButtonElement>("#btn-finish");
const btnExport = requireElement<HTMLButtonElement>("#btn-export");
const btnPickFolder = requireElement<HTMLButtonElement>("#btn-pick-folder");
const btnSwitchActivity = requireElement<HTMLButtonElement>(
    "#btn-switch-activity",
);
const commentApontamento = requireElement<HTMLTextAreaElement>(
    "#comment-apontamento",
);
const commentAtividade =
    requireElement<HTMLTextAreaElement>("#comment-atividade");

const timer: TimerState = createTimer();
let activeActivity: Activity = defaultActivity();

function canExport(): boolean {
    return timer.accumulatedMs > 0 && timer.wallClockEndMs != null;
}

function syncTrayTimer(): void {
    if (timer.isRunning) {
        const timeText = formatDurationHms(getElapsedMs(timer));
        invoke("update_tray_timer", { taskId: activeActivity.task, timeText }).catch(console.error);
    } else {
        invoke("clear_tray_timer").catch(console.error);
    }
}

function render(): void {
    timeDisplay.textContent = formatDurationHms(getElapsedMs(timer));
    btnStart.disabled = timer.isRunning;
    btnFinish.disabled = !timer.isRunning;
    btnExport.disabled = !canExport();
    syncTrayTimer();
}

function handleStartClick(): void {
    startTimer(timer);
    setStatus("Contando...");
    render();
}

function handleFinishClick(): void {
    finalizeTimer(timer);
    setStatus('Finalizado: revise os campos e clique em "Salvar".');
    render();
}

async function handlePickFolderClick(): Promise<void> {
    await pickExportDir();
    render();
}

async function handleExportClick(): Promise<void> {
    if (!canExport()) return;
    if (!commentApontamento.value.trim()) {
        commentApontamento.setCustomValidity("Campo obrigatório");
        commentApontamento.reportValidity();
        return;
    }
    commentApontamento.setCustomValidity("");
    const savedPath = await exportEntry({
        exportDir: getExportDir(),
        timer,
        activity: readActivity(),
        comentarioApontamento: commentApontamento.value,
        comentarioAtividade: commentAtividade.value,
    });
    resetTimer(timer);
    commentApontamento.value = "";
    commentAtividade.value = "";
    if (savedPath) {
        setExportedPath(savedPath);
    }
    render();
}

async function handleSwitchActivityClick(): Promise<void> {
    const nextActivity = readActivity();
    if (timer.accumulatedMs > 0 || timer.isRunning) {
        finalizeTimer(timer);
        await exportEntry({
            exportDir: getExportDir(),
            timer,
            activity: activeActivity,
            comentarioApontamento: commentApontamento.value,
            comentarioAtividade: commentAtividade.value,
        });
    }
    activeActivity = nextActivity;
    resetTimer(timer);
    commentAtividade.value = "";
    startTimer(timer);
    setStatus("Atividade alterada para " + activeActivity.task + ". Contando...");
    render();
}

function handleCommentApontamentoInput(): void {
    commentApontamento.setCustomValidity("");
}

populateSelects();
writeActivity(activeActivity);
setExportPathText(getExportDir());
setInterval(render, 250);
render();

btnStart.addEventListener("click", handleStartClick);
btnFinish.addEventListener("click", handleFinishClick);
btnPickFolder.addEventListener("click", handlePickFolderClick);
btnExport.addEventListener("click", handleExportClick);
btnSwitchActivity.addEventListener("click", handleSwitchActivityClick);
commentApontamento.addEventListener("input", handleCommentApontamentoInput);
