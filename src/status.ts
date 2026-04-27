import { requireElement } from "./dom";
import { t } from "./i18n";

export type StatusKind = "info" | "error";

const statusEl = requireElement<HTMLElement>("#status");
const statusMsgEl = requireElement<HTMLElement>("#status-msg");
const statusPathEl = requireElement<HTMLElement>("#status-exported-path");
const exportPathEl = requireElement<HTMLElement>("#export-path");

export function setStatus(text: string, kind: StatusKind = "info"): void {
    statusEl.dataset.kind = kind;
    statusMsgEl.textContent = text;
    statusPathEl.hidden = true;
    statusPathEl.textContent = "";
    statusPathEl.removeAttribute("title");
}

export function setExportPathText(path: string): void {
    exportPathEl.textContent = path || t("exportPath.empty");
}

export function setExportedPath(path: string): void {
    statusEl.dataset.kind = "info";
    statusMsgEl.textContent = t("status.exported");
    statusPathEl.hidden = false;
    statusPathEl.textContent = path;
    statusPathEl.setAttribute("title", path);
}
