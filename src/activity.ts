export const TASKS = ["22199", "22196", "22465"] as const;
export type Task = (typeof TASKS)[number];

export const FUNCOES = ["apoio", "gerencia", "principal", "tester"] as const;
export type Funcao = (typeof FUNCOES)[number];

export const ETAPAS = [
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
] as const;
export type Etapa = (typeof ETAPAS)[number];

export interface Activity {
  task: Task;
  funcao: Funcao;
  etapa: Etapa;
}

export function defaultActivity(): Activity {
  return {
    task: TASKS[0],
    funcao: FUNCOES[0],
    etapa: ETAPAS[0],
  };
}
