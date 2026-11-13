import { historyApi } from "../api/history.api.js";
import { CONFIG } from "../config/app.config.js";
import { asList } from "../utils/validators.js";
import { unwrapObject, sortHistory, formatNow } from "./monitoring.state.js";
import { renderCurrentState, renderHistory, setHistoryError } from "./monitoring.view.js";
import { setStatus } from "../ui/connectivity.view.js";

export class MonitoringHistory {
  refreshing = false;
  refreshAgain = false;
  debounceTimer = null;

  async loadInitial() {
    setStatus("api", "checking");
    const results = await Promise.allSettled([historyApi.state(), historyApi.history()]);
    const stateResult = results[0];
    const historyResult = results[1];
    if (stateResult.status === "fulfilled") renderCurrentState(unwrapObject(stateResult.value));
    else renderCurrentState(null);
    if (historyResult.status === "fulfilled") {
      try { this.applyHistory(historyResult.value); }
      catch (error) { setHistoryError(error.message); }
    } else {
      setHistoryError(`Error REST: ${historyResult.reason?.message || "consulta fallida"}`);
    }
    const anySuccess = results.some(result => result.status === "fulfilled");
    setStatus("api", anySuccess ? "available" : "unavailable");
    if (!anySuccess) throw new Error("No fue posible consultar estado ni historial mediante REST.");
  }

  applyHistory(payload) {
    const records = asList(payload, "historial");
    const ordered = sortHistory(records);
    renderHistory(ordered);
  }

  async refreshHistory() {
    if (this.refreshing) { this.refreshAgain = true; return; }
    this.refreshing = true;
    try {
      const payload = await historyApi.history();
      this.applyHistory(payload);
    } catch (error) {
      setHistoryError(`No se pudo actualizar el historial: ${error.message}`);
    } finally {
      this.refreshing = false;
      if (this.refreshAgain) {
        this.refreshAgain = false;
        this.refreshHistory();
      }
    }
  }

  onSocketEvent(event) {
    if (event.kind === "vehicle-state") {
      const vehicleId = Number(event.data?.id_vehiculo);
      if (Number.isFinite(vehicleId) && vehicleId !== Number(CONFIG.vehicleId)) return;
      // WSS no entrega id_historial ni fecha_hora en el ejemplo contractual.
      // Actualiza el estado con los campos recibidos y consulta el historial
      // real para no fabricar registros locales.
      renderCurrentState(event.data, `Evento WSS recibido · ${formatNow()} (hora CDMX)`);
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.refreshHistory(), 300);
    } else if (event.kind === "reconnected") {
      this.loadInitial().catch(() => {});
    }
  }
}
