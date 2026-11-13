import {commandsApi} from "../api/commands.api.js";
import {setStatus} from "../ui/connectivity.view.js";
import {CONFIG} from "../config/app.config.js";
import {logActivity} from "../utils/dom.js";

// Comprueba una operación REST funcional; no certifica los 21 servicios de la API.
export function startApiCheck(){let busy=false;const check=async()=>{if(busy)return;busy=true;setStatus("api","checking");try{const vehicle=await commandsApi.vehicle();if(typeof vehicle?.nombre==="string"&&document.getElementById("vehicle-name"))document.getElementById("vehicle-name").textContent=vehicle.nombre;setStatus("api","available")}catch(e){setStatus("api","unavailable");logActivity(`Comprobación REST: ${e.message}`,"err")}finally{busy=false}};check();return setInterval(check,CONFIG.apiCheckMs);}
