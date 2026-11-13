import { formatDate } from "./monitoring.state.js";

const byId = id => document.getElementById(id);
const setText = (id, value) => { const element = byId(id); if (element) element.textContent = value ?? "—"; };

export function renderCurrentState(state, receivedAt = null) {
  if (!state || typeof state !== "object") {
    setText("current-command", "Estado no disponible");
    setText("current-connected", "Sin datos");
    return;
  }
  setText("current-command", state.comando || (state.id_comando != null ? `Comando ${state.id_comando}` : "Sin comando reportado"));
  setText("current-connected", typeof state.conectado === "boolean" ? (state.conectado ? "Conectado" : "Desconectado") : "Sin dato");
  setText("current-vehicle", state.vehiculo || state.nombre || "—");
  setText("current-origin", state.origen || "—");
  setText("current-updated", state.fecha_hora ? formatDate(state.fecha_hora) : (receivedAt || "—"));
}

export function renderHistory(records) {
  const tbody = byId("history-rows");
  const message = byId("history-message");
  if (!tbody) return;
  tbody.replaceChildren();
  if (!records.length) {
    const row = tbody.insertRow();
    const cell = row.insertCell(); cell.colSpan = 5; cell.textContent = "El servidor no devolvió movimientos registrados.";
    if (message) message.textContent = "No hay registros de historial para mostrar.";
    renderLatest(null);
    return;
  }
  records.slice(0, 10).forEach(record => {
    const row = tbody.insertRow();
    [record.id_historial ?? "—", record.comando ?? "—", record.codigo ?? "—", formatDate(record.fecha_hora), record.origen ?? "—"].forEach(value => {
      const cell = row.insertCell(); cell.textContent = String(value);
    });
  });
  if (message) message.textContent = `Se muestran ${Math.min(records.length, 10)} de ${records.length} registros recibidos del historial.`;
  renderLatest(records[0]);
}

function renderLatest(record) {
  if (!record) {
    setText("latest-command", "Sin movimientos registrados");
    setText("latest-code", "—"); setText("latest-date", "—");
    setText("latest-origin", "—"); setText("latest-id", "—");
    return;
  }
  setText("latest-command", record.comando || "Movimiento sin nombre");
  setText("latest-code", record.codigo ?? "—");
  setText("latest-date", formatDate(record.fecha_hora));
  setText("latest-origin", record.origen || "—");
  setText("latest-id", record.id_historial ?? "No proporcionado");
}

export function setHistoryError(message) {
  const target = byId("history-message");
  if (target) target.textContent = message;
  const tbody = byId("history-rows");
  if (tbody) {
    tbody.replaceChildren();
    const row = tbody.insertRow(); const cell = row.insertCell();
    cell.colSpan = 5; cell.textContent = "No fue posible consultar el historial.";
  }
}
