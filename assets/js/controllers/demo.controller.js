import { byId, logActivity } from "../utils/dom.js";

export function bindDemo(demos, demoManager, movementManager) {
  const start = byId("demo-start");
  const select = byId("demo-select");
  const state = byId("demo-state");

  start.addEventListener("click", async () => {
    const selected = demos.find(d => Number(d.id_demo) === Number(select.value));
    if (!selected || demoManager.runningId !== null) return;

    start.disabled = true;
    select.disabled = true;
    try {
      // Bloquea nuevos mandos manuales y espera a que OFF quede confirmado.
      await movementManager.setLocked(true);
      await movementManager.stop();
      await demoManager.start(selected);
      state.textContent = demoManager.runningId === null
        ? `DEMO ${selected.nombre} finalizada.`
        : `DEMO ${selected.nombre} solicitada. Esperando confirmación del servidor…`;
      if (demoManager.runningId === null) {
        select.disabled = false;
        start.disabled = !select.value;
      }
    } catch (error) {
      await movementManager.setLocked(false);
      select.disabled = false;
      start.disabled = !select.value;
      state.textContent = error.message;
      logActivity(error.message, "err");
    }
  });

  select.addEventListener("change", () => {
    start.disabled = !select.value || demoManager.runningId !== null;
  });

  byId("demo-cancel").disabled = true;
  byId("demo-cancel").addEventListener("click", () => {
    logActivity("Cancelación no disponible en el backend; no se simuló.", "warn");
  });
}
