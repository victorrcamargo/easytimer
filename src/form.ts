import { ETAPAS, FUNCOES, TASKS, type Activity } from "./activity";

export type StatusKind = "info" | "error";

function requireElement<T extends Element>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Element ${selector} not found`);
  return el;
}

const statusEl = requireElement<HTMLElement>("#status");
const statusMsgEl = requireElement<HTMLElement>("#status-msg");
const statusPathEl = requireElement<HTMLElement>("#status-exported-path");
const exportPathEl = requireElement<HTMLElement>("#export-path");
const selTaskEl = requireElement<HTMLSelectElement>("#sel-task");
const selFuncaoEl = requireElement<HTMLSelectElement>("#sel-funcao");
const selEtapaEl = requireElement<HTMLSelectElement>("#sel-etapa");

function fillSelect(el: HTMLSelectElement, options: readonly string[]): void {
  el.innerHTML = "";
  for (const value of options) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    el.appendChild(opt);
  }
}

export function populateSelects(): void {
  fillSelect(selTaskEl, TASKS);
  fillSelect(selFuncaoEl, FUNCOES);
  fillSelect(selEtapaEl, ETAPAS);
}

export function readActivity(): Activity {
  return {
    task: selTaskEl.value as Activity["task"],
    funcao: selFuncaoEl.value as Activity["funcao"],
    etapa: selEtapaEl.value as Activity["etapa"],
  };
}

export function writeActivity(activity: Activity): void {
  selTaskEl.value = activity.task;
  selFuncaoEl.value = activity.funcao;
  selEtapaEl.value = activity.etapa;
}

export function setStatus(text: string, kind: StatusKind = "info"): void {
  statusEl.dataset.kind = kind;
  statusMsgEl.textContent = text;
  statusPathEl.hidden = true;
  statusPathEl.textContent = "";
  statusPathEl.removeAttribute("title");
}

export function setExportPathText(path: string): void {
  exportPathEl.textContent = path || "Nenhuma pasta selecionada";
}

export function setExportedPath(path: string): void {
  statusEl.dataset.kind = "info";
  statusMsgEl.textContent = "Exportado:";
  statusPathEl.hidden = false;
  statusPathEl.textContent = path;
  statusPathEl.setAttribute("title", path);
}
