import type { ActivityOptions } from "./services/activityService";

export interface Activity {
    task: string;
    funcao: string;
    etapa: string;
}

export function defaultActivity(options: ActivityOptions): Activity {
    return {
        task: options.tasks[0] ?? "",
        funcao: options.funcoes[0] ?? "",
        etapa: options.etapas[0] ?? "",
    };
}
