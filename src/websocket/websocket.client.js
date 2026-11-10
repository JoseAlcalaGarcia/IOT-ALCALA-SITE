import { CONFIG } from "../config/app.config.js";
import { onSocketMessage } from "./websocket.events.js";
import { logActivity } from "../utils/dom.js";

export class SocketClient {
  socket = null;
  timer = null;
  attempt = 0;
  stopped = false;

  constructor(demo, setStatus, movement) {
    this.demo = demo;
    this.setStatus = setStatus;
    this.movement = movement;
  }

  connect() {
    this.stopped = false;
    if (this.socket && [WebSocket.CONNECTING, WebSocket.OPEN].includes(this.socket.readyState)) return;

    this.setStatus("connecting");
    try {
      const socket = new WebSocket(CONFIG.websocketUrl);
      this.socket = socket;

      socket.onopen = () => {
        if (this.socket !== socket) return;
        this.attempt = 0;
        this.setStatus("online");
        logActivity("Sesión WSS abierta.", "ok");
      };

      socket.onmessage = event => onSocketMessage(event, this.demo, this.movement);
      socket.onerror = () => {
        if (this.socket === socket) this.setStatus("reconnecting");
        logActivity("Error en WSS.", "err");
      };
      socket.onclose = () => {
        if (this.socket !== socket) return;
        this.socket = null;
        if (this.stopped) return this.setStatus("offline");
        this.setStatus("reconnecting");
        this.retry();
      };
    } catch {
      this.setStatus("offline");
      this.retry();
    }
  }

  retry() {
    clearTimeout(this.timer);
    const delay = Math.min(CONFIG.reconnectBaseMs * 2 ** this.attempt++, CONFIG.reconnectMaxMs);
    this.timer = setTimeout(() => this.connect(), delay);
  }

  disconnect() {
    this.stopped = true;
    clearTimeout(this.timer);
    this.socket?.close();
    this.socket = null;
    this.setStatus("offline");
  }
}
