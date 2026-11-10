# Control Vehículo IoT · Excavadora Alcalá

Frontend estático modular para controlar el vehículo IoT mediante REST y WebSocket.

## Ejecutar localmente

Desde la carpeta del proyecto:

```bash
python -m http.server 5500
```

Abrir `http://localhost:5500`.

## Configuración

Editar `src/config/app.config.js` para configurar la URL HTTPS de la API, la URL WSS y el identificador del vehículo. No se incluyen credenciales privadas.

## Control manual

- Los botones del catálogo alternan activación/desactivación.
- Un solo movimiento manual puede permanecer activo.
- Al cambiar de comando se envía primero `conectado: false` para el anterior y después `conectado: true` para el nuevo.
- DETENER reemplaza cualquier intención pendiente.
- Joystick y botones usan el mismo `MovementManager`.
- El estado visual se actualiza al confirmarse la operación HTTP y se sincroniza con eventos `estado_vehiculo` recibidos por WSS.
- Durante una DEMO se bloquean los controles manuales. Se liberan al recibir `demo/finalizada` o `demo/cancelada`.

## Limitación del backend

La API descrita no dispone de una ruta de cancelación de DEMO. El botón CANCELAR DEMO permanece deshabilitado y no se simula una cancelación. Tampoco se afirma que RDS esté disponible, ya que no existe un endpoint de salud/diagnóstico confirmado para ese servicio.

## Publicación

El proyecto puede alojarse como sitio estático en GitHub Pages. Conserva las rutas relativas (`./`) para permitir publicación en una subruta.
