import { open } from "@tauri-apps/plugin-dialog";
import { setExportDir } from "./exportDir";
import { setExportPathText, setStatus } from "./form";

export async function pickExportDir(): Promise<string> {
  try {
    const selected = await open({ directory: true, multiple: false });
    if (typeof selected === "string" && selected.trim().length > 0) {
      setExportDir(selected);
      setExportPathText(selected);
      setStatus("Pasta de exportação atualizada.");
      return selected;
    }
    setStatus("Seleção de pasta cancelada.");
    return "";
  } catch (e) {
    setStatus(`Falha ao abrir seletor de pasta: ${String(e)}`, "error");
    return "";
  }
}
