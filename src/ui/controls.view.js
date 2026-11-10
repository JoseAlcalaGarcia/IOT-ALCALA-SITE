import { byId } from "../utils/dom.js";

export function renderCommands(commands, onClick, manager) {
  const box = byId("command-buttons");
  box.replaceChildren();

  if (!commands.length) {
    box.textContent = "No hay movimientos disponibles en el catálogo.";
    return;
  }

  for (const command of commands) {
    const button = document.createElement("button");
    button.className = "command";
    button.type = "button";
    button.textContent = command.nombre;
    button.dataset.commandId = String(command.id_comando);
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => onClick(command).catch(() => {}));
    box.append(button);
  }

  updateCommandButtons(manager.snapshot());
}

export function updateCommandButtons(state) {
  const box = document.getElementById("command-buttons");
  if (!box) return;

  for (const button of box.querySelectorAll("[data-command-id]")) {
    const id = Number(button.dataset.commandId);
    const active = id === state.activeId;
    const pending = !active && id === state.desiredId;
    button.classList.toggle("is-active", active);
    button.classList.toggle("is-pending", pending);
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-busy", String(pending));
    button.title = active ? "Movimiento activo · pulsa para desactivar" :
      pending ? "Enviando solicitud…" : "Pulsa para activar este movimiento";
  }

  const stop = document.getElementById("stop-button");
  if (stop) {
    stop.classList.toggle("is-pending", state.busy && state.desiredId === null);
    stop.setAttribute("aria-busy", String(state.busy && state.desiredId === null));
  }

  if (box) box.setAttribute("aria-busy", String(state.busy));
}
