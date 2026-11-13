import { CONFIG } from "./app.config.js";

const vehicle = `/api/vehiculos/${encodeURIComponent(CONFIG.vehicleId)}`;

export const ENDPOINTS = Object.freeze({
  vehicle,
  state: `${vehicle}/estado`,
  commands: `${vehicle}/comandos`,
  history: `${vehicle}/historial`,
  demos: `${vehicle}/demos`,
  executeDemo: id => `${vehicle}/demos/${encodeURIComponent(id)}/ejecutar`
});
