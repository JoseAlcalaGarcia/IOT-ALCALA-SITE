import { SocketClient } from "../websocket/websocket.client.js";
import { setStatus } from "../ui/connectivity.view.js";
import { MonitoringHistory } from "./monitoring.history.js";
import { markCurrentView } from "../navigation/navigation.js";

async function init() {
  markCurrentView();
  const monitoring = new MonitoringHistory();
  setStatus("rds", "unknown");
  const socket = new SocketClient(null, status => setStatus("websocket", status), null, event => monitoring.onSocketEvent(event));
  socket.connect();
  try {
    await monitoring.loadInitial();
  } catch {
    // El estado de error queda reflejado en los indicadores y mensajes de la vista.
  }
}

init();
