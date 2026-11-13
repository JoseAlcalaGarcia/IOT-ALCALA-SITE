export function byId(id) {
  const element = document.getElementById(id);
  if (!element) throw Error(`Falta #${id}`);
  return element;
}

export function logActivity(message, kind = "info") {
  // La vista MONITOREO no contiene la bitácora de CONTROL; los mensajes WSS
  // deben poder procesarse sin que la ausencia de ese elemento interrumpa el flujo.
  const list = document.getElementById("activity-log");
  if (!list) return;
  if (list.children.length === 1 && list.firstElementChild.textContent === "Esperando actividad…") list.replaceChildren();
  const item = document.createElement("li");
  const time = document.createElement("time");
  const content = document.createElement("span");
  time.textContent = new Date().toLocaleTimeString("es-MX");
  content.textContent = message;
  item.className = kind;
  item.append(time, content);
  list.prepend(item);
  while (list.children.length > 30) list.lastElementChild.remove();
}
