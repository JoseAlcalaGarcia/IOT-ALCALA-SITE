# Control Vehículo IoT · Excavadora Alcalá

Frontend estático modular para operar y monitorear el vehículo IoT mediante API REST y WebSocket seguro (WSS). Incluye dos vistas en el mismo proyecto: **CONTROL** (`index.html`) y **MONITOREO** (`monitoreo.html`).

## Ejecutar localmente

Desde la carpeta raíz del proyecto:

```bash
python -m http.server 5500
```

Abrir `http://localhost:5500`. La vista de monitoreo está disponible en `http://localhost:5500/monitoreo.html`.

## Configuración

Editar `assets/js/config/app.config.js` para configurar:

- `apiBaseUrl`: URL HTTPS de la API.
- `websocketUrl`: URL WSS.
- `vehicleId`: identificador del vehículo.
- `timeZone`: zona de visualización de fechas (`America/Mexico_City`).
- Tiempos de espera y reconexión.

La API y WSS se configuran como públicos según la confirmación del contrato de este proyecto. `publicAccessToken` permanece vacío y no se envía encabezado Authorization. No se incluyen credenciales privadas.

## Vista CONTROL

- Los botones del catálogo alternan activación/desactivación.
- Un solo movimiento manual puede permanecer activo.
- Al cambiar de comando se envía primero `conectado: false` para el anterior y después `conectado: true` para el nuevo.
- DETENER reemplaza cualquier intención pendiente.
- Joystick y botones usan el mismo `MovementManager`.
- Durante una DEMO se bloquean los controles manuales. Se liberan al recibir `demo/finalizada` o `demo/cancelada`.
- El botón CANCELAR DEMO permanece deshabilitado: el contrato proporcionado no documenta una ruta de cancelación.

## Vista MONITOREO

- Consulta el estado actual mediante `GET /api/vehiculos/{id_vehiculo}/estado`.
- Consulta el historial mediante `GET /api/vehiculos/{id_vehiculo}/historial`.
- No envía parámetros de límite u orden al historial. Ordena en el navegador y presenta los 10 registros más recientes.
- Los eventos WSS `estado_vehiculo` actualizan el estado visible y provocan una nueva consulta del historial REST.
- El ejemplo de evento WSS no contiene `id_historial` ni `fecha_hora`; por eso no se inventan registros locales. El historial se actualiza únicamente con datos devueltos por REST.
- Los eventos internos de ejecución DEMO no se insertan en la tabla de historial.
- Las fechas REST sin offset se interpretan como hora de `America/Mexico_City` (UTC-06:00), conforme a la confirmación del proyecto. Los timestamps con offset explícito conservan su instante y se muestran en esa zona.
- Al recuperar la conexión WSS, la vista vuelve a consultar estado e historial mediante REST.

## Indicadores de conectividad

- **WSS:** refleja el estado de la conexión WebSocket.
- **API REST:** refleja si alguna consulta REST utilizada por la vista responde. No es una prueba de los 21 servicios ni un endpoint de salud general.
- **RDS:** permanece como `Sin verificar`; no se proporcionó una ruta de diagnóstico de base de datos.

No se implementan endpoints de salud, parámetros de historial, autenticación ni cancelación DEMO que no estén presentes en el contrato proporcionado.

## Estructura

```text
assets/
  css/             estilos de CONTROL y MONITOREO
  favicon.svg
  js/
    api/           cliente HTTP y endpoints REST
    config/        configuración y rutas
    controllers/   controladores de CONTROL
    domain/        gestores de movimiento y DEMO
    monitoring/    estado, historial y vista de monitoreo
    navigation/    navegación entre vistas
    ui/            componentes visuales
    utils/         validaciones y utilidades
    websocket/     cliente WSS y distribución de eventos
index.html         vista CONTROL
monitoreo.html     vista MONITOREO
README.md
tests/test-cases.md
```

## Publicación en GitHub Pages

El proyecto utiliza rutas relativas (`./`) para que HTML, CSS, favicon y módulos funcionen cuando el repositorio se publica dentro de una subruta. Publicar la carpeta raíz del proyecto como sitio estático.

## Validación

Los casos de `tests/test-cases.md` describen las verificaciones manuales y técnicas pendientes. No se afirma que las pruebas contra el servidor remoto se hayan ejecutado desde este entorno.


## Diseño de vistas sin desplazamiento

Las vistas CONTROL y MONITOREO utilizan una distribución ajustada al alto visible (`100dvh`) para evitar barras de desplazamiento vertical y horizontal en las resoluciones de trabajo habituales. En escritorio, CONTROL organiza joystick, movimientos y DEMO en tres columnas; la actividad queda en una franja compacta. MONITOREO distribuye conectividad, estado actual, último movimiento e historial en paneles que comparten el espacio disponible. En pantallas estrechas se compactan los indicadores, controles, tarjetas y tabla.

La distribución está pensada para escritorio de 1366×768 o superior y móvil moderno en orientación vertical (por ejemplo, 390×844). En pantallas excepcionalmente pequeñas, con zoom del navegador elevado o escalado del sistema alto, algunos textos pueden requerir ajustes de escala para conservar la legibilidad. El contenido de actividad de CONTROL se mantiene en memoria visual, pero solo se muestran las entradas recientes para aprovechar el espacio sin introducir una barra de desplazamiento interna.


### Ajuste compacto de la vista CONTROL

La vista CONTROL utiliza un joystick reducido, un botón DETENER compacto y tres indicadores de conectividad discretos. Se eliminaron las dos leyendas redundantes bajo el joystick y el botón DETENER. El encabezado y los controles reducen sus márgenes y alturas para aprovechar mejor el viewport sin introducir desplazamiento horizontal o vertical.
