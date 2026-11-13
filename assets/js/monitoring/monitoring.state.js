import { CONFIG } from "../config/app.config.js";

export function unwrapObject(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if (value.datos && typeof value.datos === "object" && !Array.isArray(value.datos)) return value.datos;
    if (value.resultado && typeof value.resultado === "object" && !Array.isArray(value.resultado)) return value.resultado;
  }
  return value;
}

export function sortHistory(records) {
  const seenIds = new Set();
  const unique = records.filter(record => {
    if (record?.id_historial == null) return true;
    const id = String(record.id_historial);
    if (seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  });
  return unique.sort((a, b) => {
    const aId = Number(a?.id_historial);
    const bId = Number(b?.id_historial);
    if (Number.isFinite(aId) && Number.isFinite(bId) && a?.id_historial != null && b?.id_historial != null) return bId - aId;
    return parseHistoryDate(b?.fecha_hora) - parseHistoryDate(a?.fecha_hora);
  });
}

function parseHistoryDate(value) {
  if (!value) return 0;
  const raw = String(value);
  // El ejemplo REST entrega fechas sin offset. Se interpretan como hora local
  // de America/Mexico_City (UTC-06:00), sin depender de la zona del navegador.
  const normalized = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(raw)
    ? `${raw}-06:00`
    : raw;
  const time = Date.parse(normalized);
  return Number.isFinite(time) ? time : 0;
}

export function formatDate(value) {
  if (!value) return "—";
  const time = parseHistoryDate(value);
  if (!time) return String(value);
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: CONFIG.timeZone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  }).format(new Date(time));
}

export function formatNow() {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: CONFIG.timeZone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  }).format(new Date());
}
