import { logActivity } from "../utils/dom.js";

export function onSocketMessage(event, demo, movement, onMonitoringEvent = () => {}) {
  let message;
  try {
    message = JSON.parse(event.data);
  } catch {
    logActivity("Mensaje WSS no es JSON válido.", "warn");
    return;
  }

  if (!message || typeof message.tipo !== "string") {
    logActivity("Estructura WSS no reconocida.", "warn");
    return;
  }

  if (message.tipo === "conexion") {
    logActivity(message.mensaje || "Conexión WSS confirmada.", "ok");
    onMonitoringEvent({ kind: "connection", message });
    return;
  }

  if (message.tipo === "estado_vehiculo") {
    const data = message.datos || {};
    movement?.syncFromServer(data.id_comando, data.conectado);
    onMonitoringEvent({ kind: "vehicle-state", data, message });
    logActivity(`Estado ${data.comando || data.id_comando || "?"}: conectado=${String(data.conectado)}`);
    return;
  }

  if (message.tipo === "demo") {
    const data = message.datos || {};
    if (message.accion === "ejecutar_movimiento") {
      logActivity(`DEMO ${data.id_demo}: orden ${data.orden}, comando ${data.id_comando}`);
    } else if (message.accion === "finalizada") {
      demo?.finish(data.id_demo, data.mensaje);
      movement?.setLocked(false);
      restoreDemoControls(data.mensaje || "DEMO finalizada según el servidor.");
      logActivity("Control manual habilitado nuevamente.", "ok");
    } else if (message.accion === "cancelada") {
      demo?.cancelled(data.id_demo);
      movement?.setLocked(false);
      restoreDemoControls("DEMO cancelada según el servidor.");
      logActivity("Control manual habilitado nuevamente.", "ok");
    } else {
      logActivity(`Evento DEMO: ${message.accion || "sin acción"}`);
    }
    // Los eventos de ejecución DEMO no se convierten en registros de historial.
    return;
  }

  logActivity(`Evento WSS: ${message.tipo}`);
}

function restoreDemoControls(message) {
  const select = document.getElementById("demo-select");
  const start = document.getElementById("demo-start");
  const state = document.getElementById("demo-state");
  if (select) select.disabled = false;
  if (start) start.disabled = !select?.value;
  if (state) state.textContent = message;
}
