import { commandsApi } from "../api/commands.api.js";
import { logActivity } from "../utils/dom.js";
import { friendlyError } from "../utils/errors.js";

/**
 * Mantiene un único movimiento manual activo.
 * Todas las escrituras se serializan para garantizar:
 * OFF anterior -> ON nuevo, sin comandos manuales simultáneos.
 */
export class MovementManager {
  commands = [];
  active = null;
  desired = null;
  busy = false;
  locked = false;
  tail = Promise.resolve();
  onChange = () => {};

  constructor(onChange = () => {}) {
    this.onChange = onChange;
  }

  setCommands(commands) {
    this.commands = commands;
    this.notify();
  }

  find(name) {
    return this.commands.find(c => c.nombre?.toUpperCase() === String(name).toUpperCase());
  }

  snapshot() {
    return {
      activeId: this.active ? Number(this.active.id_comando) : null,
      desiredId: this.desired ? Number(this.desired.id_comando) : null,
      busy: this.busy,
      locked: this.locked
    };
  }

  notify() {
    this.onChange(this.snapshot());
  }

  activateName(name) {
    const command = this.find(name);
    if (!command) return Promise.reject(new Error(`Comando ${name} no disponible.`));
    return this.activate(command);
  }

  // Para joystick: fija una dirección; repetirla no la desactiva.
  activate(command) {
    if (this.locked) return Promise.resolve(false);
    if (this.desired?.id_comando === command.id_comando) return this.tail;
    // También cancela una orden OFF que todavía esté en cola si el joystick
    // vuelve a señalar el mismo movimiento antes de que termine la petición.
    this.desired = command;
    this.notify();
    return this.schedule();
  }

  // Para botones: el mismo comando alterna ON/OFF.
  toggle(command) {
    if (this.locked) {
      logActivity("Control manual bloqueado mientras se ejecuta una DEMO.", "warn");
      return Promise.resolve(false);
    }
    const current = this.desired || this.active;
    this.desired = current?.id_comando === command.id_comando ? null : command;
    this.notify();
    return this.schedule();
  }

  setLocked(value) {
    this.locked = Boolean(value);
    if (this.locked) this.desired = null;
    this.notify();
    return this.locked ? this.schedule() : Promise.resolve(true);
  }

  stop() {
    // DETENER siempre sustituye cualquier intención pendiente.
    this.desired = null;
    this.notify();
    return this.schedule();
  }

  schedule() {
    const task = this.tail.then(() => this.reconcile());
    // La cola permanece utilizable aunque una petición falle.
    this.tail = task.catch(() => {});
    return task;
  }

  async reconcile() {
    this.busy = true;
    this.notify();
    try {
      while (true) {
        const target = this.desired;

        // Desactivar el movimiento anterior antes de activar otro.
        if (this.active && (!target || this.active.id_comando !== target.id_comando)) {
          const previous = this.active;
          await commandsApi.state(Number(previous.id_comando), false);
          if (this.active?.id_comando === previous.id_comando) this.active = null;
          logActivity(`Movimiento desactivado: ${previous.nombre}`, "ok");
          this.notify();
          continue; // Relee la intención más reciente antes de continuar.
        }

        if (target && !this.active) {
          await commandsApi.state(Number(target.id_comando), true);
          this.active = target;
          logActivity(`Movimiento activado: ${target.nombre}`, "ok");
          this.notify();
          continue;
        }

        // Estado alcanzado: active coincide con desired, o ambos son null.
        if ((!target && !this.active) ||
            (target && this.active?.id_comando === target.id_comando)) break;
      }
      return true;
    } catch (error) {
      // No conservar en pantalla una selección que el servidor rechazó.
      this.desired = this.active;
      logActivity(friendlyError(error), "err");
      throw error;
    } finally {
      this.busy = false;
      this.notify();
    }
  }

  // Sincronización con eventos estado_vehiculo del WebSocket.
  syncFromServer(idCommand, connected) {
    const id = Number(idCommand);
    if (connected) {
      const command = this.commands.find(c => Number(c.id_comando) === id);
      if (command) this.active = command;
    } else if (this.active && Number(this.active.id_comando) === id) {
      this.active = null;
    }
    this.notify();
  }
}
