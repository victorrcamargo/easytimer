export interface TimeEntry {
  data: string; // "DD/MM/YYYY"
  inicio: string; // "HH:MM:SS"
  fim: string; // "HH:MM:SS"
  task: string;
  funcao: string;
  etapa: string;
  comentario_apontamento: string;
  comentario_atividade: string;
}
