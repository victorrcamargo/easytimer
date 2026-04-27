import { invoke } from "@tauri-apps/api/core";
import type { Activity } from "./activity";
import type { TimerState } from "./timer";
import { formatClockHms } from "./time";
import { t } from "./i18n";
import { setStatus } from "./status";

export interface ExportParams {
    exportDir: string;
    timer: TimerState;
    activity: Activity;
    comentarioApontamento: string;
    comentarioAtividade: string;
}

export async function exportEntry(params: ExportParams): Promise<string> {
    const {
        exportDir,
        timer,
        activity,
        comentarioApontamento,
        comentarioAtividade,
    } = params;

    if (!exportDir) {
        setStatus(t("status.noExportDir"), "error");
        return "";
    }
    if (timer.wallClockStartMs == null || timer.wallClockEndMs == null) {
        setStatus(t("status.noTimes"), "error");
        return "";
    }

    const inicio = formatClockHms(timer.wallClockStartMs);
    const fim = formatClockHms(timer.wallClockEndMs);

    setStatus(t("status.exporting"));
    try {
        const savedPath = await invoke<string>("save_entry", {
            exportDir,
            inicio,
            fim,
            task: activity.task,
            funcao: activity.funcao,
            etapa: activity.etapa,
            comentarioApontamento,
            comentarioAtividade,
        });
        return savedPath;
    } catch (e) {
        setStatus(t("status.exportFailed", { error: String(e) }), "error");
        return "";
    }
}
