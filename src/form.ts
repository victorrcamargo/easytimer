import { ETAPAS, FUNCOES, TASKS, type Activity } from "./activity";
import { requireElement } from "./dom";

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


