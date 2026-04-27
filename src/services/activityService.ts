// TODO: import { get } from "./http";

export interface ActivityOptions {
    tasks: string[];
    funcoes: string[];
    etapas: string[];
}

// Mock data — replace with real API call when backend is ready.
const MOCK_OPTIONS: ActivityOptions = {
    tasks: ["22199", "22196", "22465"],
    funcoes: ["apoio", "gerencia", "principal", "tester"],
    etapas: [
        "helpdesk",
        "recusado",
        "itens pendentes",
        "em andamento",
        "parado",
        "parado consultoria",
        "em testes",
        "homologação (teste consultoria)",
        "aprovado (CodeReview)",
        "Produção",
    ],
};

export async function fetchActivityOptions(): Promise<ActivityOptions> {
    // TODO: return get<ActivityOptions>("/activity/options");
    return Promise.resolve(MOCK_OPTIONS);
}
