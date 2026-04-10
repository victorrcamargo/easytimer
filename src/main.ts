import { defaultActivity, type Activity } from "./activity";
import { formatDurationHms } from "./time";
import {
  createTimer,
  finalizeTimer,
  getElapsedMs,
  resetTimer,
  startTimer,
  type TimerState,
} from "./timer";
import { getExportDir } from "./exportDir";
import {
  populateSelects,
  readActivity,
  setExportPathText,
  setStatus,
  writeActivity,
} from "./form";
import { exportEntry } from "./export";
import { pickExportDir } from "./folder";

function requireElement<T extends Element>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Element ${selector} not found`);
  return el;
}

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

function render(): void {
  timeDisplay.textContent = formatDurationHms(getElapsedMs(timer));
  btnStart.disabled = timer.isRunning;
  btnFinish.disabled = !timer.isRunning;
  btnExport.disabled = !canExport();
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
  await exportEntry({
    exportDir: getExportDir(),
    timer,
    activity: readActivity(),
    comentarioApontamento: commentApontamento.value,
    comentarioAtividade: commentAtividade.value,
  });
  resetTimer(timer);
  commentApontamento.value = "";
  commentAtividade.value = "";
  setStatus("Pronto para novo apontamento.");
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
