import WebSocket, { WebSocketServer } from "ws";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const HA_TOKEN = process.env.HA_TOKEN || "";
const HA_HOST = process.env.HA_HOST || "192.168.1.12:8123";
const HA_WS_URL = `ws://${HA_HOST}/api/websocket`;
const HA_HTTP_URL = `http://${HA_HOST}/api`;

let haWs: WebSocket | null = null;
const unityClients: Set<WebSocket> = new Set();

/**
 * Envía un objeto de mensaje en formato JSON a todos los clientes de Unity/Frontend conectados.
 *
 * @param {unknown} messageObj - Objeto de datos a transmitir.
 */
export function broadcastToUnity(messageObj: unknown): void {
  const jsonString = JSON.stringify(messageObj);
  unityClients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonString);
    }
  });
}

/**
 * Establece y gestiona la conexión WebSocket con Home Assistant.
 * Maneja la autenticación, la solicitud inicial de estados y la suscripción a eventos en tiempo real.
 */
function connectToHA(): void {
  haWs = new WebSocket(HA_WS_URL);

  haWs.on("open", () => {
    console.log("Conectado al WebSocket de Home Assistant");
    haWs?.send(JSON.stringify({ type: "auth", access_token: HA_TOKEN }));
  });

  haWs.on("message", (data: WebSocket.RawData) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === "auth_ok") {
        console.log("Autenticación exitosa con Home Assistant");

        haWs?.send(
          JSON.stringify({
            id: 1,
            type: "get_states",
          }),
        );

        haWs?.send(
          JSON.stringify({
            id: 2,
            type: "subscribe_events",
            event_type: "state_changed",
          }),
        );
      } else if (msg.type === "result" && Array.isArray(msg.result)) {
        const sensoresYSwitches = msg.result.filter(
          (entity: any) =>
            entity.entity_id.includes("sensor") ||
            entity.entity_id.includes("switch"),
        );

        console.log("\n=== DISPOSITIVOS DETECTADOS EN HOME ASSISTANT ===");
        console.table(
          sensoresYSwitches.map((s: any) => ({
            ID: s.entity_id,
            Nombre: s.attributes.friendly_name || "Sin nombre",
            Estado: s.state,
            Unidad: s.attributes.unit_of_measurement || "",
          })),
        );
        console.log("================================================\n");

        broadcastToUnity({
          type: "initial_state",
          data: sensoresYSwitches.map((s: any) => ({
            entity: s.entity_id,
            state: s.state,
            friendly_name: s.attributes.friendly_name,
          })),
        });
      } else if (msg.type === "event" && msg.event?.data?.new_state) {
        const entityId = msg.event.data.entity_id;

        if (entityId.includes("switch") || entityId.includes("sensor")) {
          broadcastToUnity({
            type: "state_change",
            entity: entityId,
            state: msg.event.data.new_state?.state,
          });
        }
      }
    } catch (e: unknown) {
      console.error("Error al procesar mensaje de HA WebSocket:", e);
    }
  });

  haWs.on("error", (err: Error) => {
    console.error("Error en el WebSocket de Home Assistant:", err.message);
  });

  haWs.on("close", () => {
    console.warn(
      "Desconectado del WebSocket de Home Assistant, reintentando en 5 segundos...",
    );
    setTimeout(connectToHA, 5000);
  });
}

/**
 * Inicializa el servidor WebSocket para clientes Unity y Frontend adjunto al servidor HTTP principal.
 *
 * @param {import('http').Server} server - Servidor HTTP principal de Express.
 */
export function startHAWebsocketServer(server: any): void {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    console.log("🎮 Cliente Unity/Frontend conectado al WebSocket");
    unityClients.add(ws);

    ws.on("message", async (data: WebSocket.RawData) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.action === "turn_on" || message.action === "turn_off") {
          const entityId = message.entity;
          const service =
            message.action === "turn_on" ? "switch/turn_on" : "switch/turn_off";

          try {
            await axios.post(
              `${HA_HTTP_URL}/services/${service}`,
              { entity_id: entityId },
              {
                headers: {
                  Authorization: `Bearer ${HA_TOKEN}`,
                  "Content-Type": "application/json",
                },
              },
            );
            console.log(
              `📡 Comando ${message.action} enviado exitosamente a ${entityId}`,
            );
          } catch (err: unknown) {
            const errorMessage =
              err instanceof Error ? err.message : "Error desconocido";
            console.error(
              "❌ Error al enviar comando a Home Assistant:",
              errorMessage,
            );
            ws.send(JSON.stringify({ type: "error", message: errorMessage }));
          }
        }
      } catch (e: unknown) {
        console.error(
          "❌ Error al procesar mensaje entrante de Unity/Frontend:",
          e,
        );
      }
    });

    ws.on("close", () => {
      unityClients.delete(ws);
      console.log("🔌 Cliente Unity/Frontend desconectado");
    });
  });

  connectToHA();
  console.log(
    "🚀 Servidor WebSocket para Unity/Frontend adjunto correctamente al servidor HTTP",
  );
}
