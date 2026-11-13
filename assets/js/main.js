import { commandsApi } from "./api/commands.api.js";
import { demosApi } from "./api/demos.api.js";
import { asList, validCommand, validDemo } from "./utils/validators.js";
import { friendlyError } from "./utils/errors.js";
import { byId, logActivity } from "./utils/dom.js";
import { MovementManager } from "./domain/movement.manager.js";
import { DemoManager } from "./domain/demo.manager.js";
import { SocketClient } from "./websocket/websocket.client.js";
import { setStatus } from "./ui/connectivity.view.js";
import { renderCommands, updateCommandButtons } from "./ui/controls.view.js";
import { renderDemos } from "./ui/demos.view.js";
import { bindJoystick } from "./controllers/joystick.controller.js";
import { bindStop } from "./controllers/buttons.controller.js";
import { bindDemo } from "./controllers/demo.controller.js";
import { startApiCheck } from "./controllers/connectivity.controller.js";
import { markCurrentView } from "./navigation/navigation.js";

async function init() {
  markCurrentView();
  const movement = new MovementManager(state => updateCommandButtons(state));
  const demo = new DemoManager();

  setStatus("rds", "unknown");
  new SocketClient(demo, status => setStatus("websocket", status), movement).connect();
  startApiCheck();
  bindJoystick(movement);
  bindStop(movement);

  try {
    const commands = asList(await commandsApi.list(), "comandos").filter(validCommand);
    movement.setCommands(commands);
    renderCommands(commands, command => movement.toggle(command), movement);
    logActivity(`Comandos válidos: ${commands.length}`, "ok");
  } catch (error) {
    byId("command-buttons").textContent = friendlyError(error);
    logActivity(friendlyError(error), "err");
  }

  try {
    const demos = asList(await demosApi.list(), "DEMO").filter(validDemo);
    renderDemos(demos);
    bindDemo(demos, demo, movement);
    logActivity(`DEMO disponibles: ${demos.length}`, "ok");
  } catch (error) {
    byId("demo-select").replaceChildren(new Option("No se pudieron cargar las DEMO", ""));
    logActivity(friendlyError(error), "err");
  }
}

init().catch(error => logActivity(friendlyError(error), "err"));
