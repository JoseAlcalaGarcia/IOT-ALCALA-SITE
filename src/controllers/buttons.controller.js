import { byId } from "../utils/dom.js";

export function bindStop(manager) {
  byId("stop-button").addEventListener("click", () => {
    manager.stop().catch(() => {});
  });
}
