import { WebSocketServer, WebSocket } from 'ws';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const HA_TOKEN = process.env.HA_TOKEN || "";
const HA_HOST = process.env.HA_HOST || "192.168.1.12:8123";
const HA_WS_URL = `ws://${HA_HOST}/api/websocket`;
const HA_HTTP_URL = `http://${HA_HOST}/api`;

let haWs: WebSocket | null = null;
const unityClients: Set<WebSocket> = new Set();

export function broadcastToUnity(messageObj: any) {
  const jsonString = JSON.stringify(messageObj);
  unityClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      // Enviamos el objeto parseado para que Unity lo entienda
      client.send(jsonString);
    }
  });
}

function connectToHA() {
  haWs = new WebSocket(HA_WS_URL);

  haWs.on('open', () => {
    console.log('Conectado a HA WebSocket');
    // Autenticación
    haWs?.send(JSON.stringify({ type: 'auth', access_token: HA_TOKEN }));
  });

  haWs.on('message', (data: string) => {
    try {
      const msg = JSON.parse(data);

      if (msg.type === 'auth_ok') {
        console.log('Autenticación exitosa con HA');

        // 1. PRIMERO: Solicitar todos los estados actuales para conocer los sensores registrados
        haWs?.send(JSON.stringify({
          id: 1,
          type: 'get_states'
        }));

        // 2. SEGUNDO: Suscribirse a cambios futuros (usamos ID 2 para no chocar)
        haWs?.send(JSON.stringify({
          id: 2,
          type: 'subscribe_events',
          event_type: 'state_changed'
        }));
      }

      // MANEJO DE LA LISTA INICIAL DE SENSORES (Respuesta a get_states)
      else if (msg.type === 'result' && Array.isArray(msg.result)) {
        const sensoresYSwitches = msg.result.filter((entity: any) =>
          entity.entity_id.includes('sensor') || entity.entity_id.includes('switch')
        );

        // --- ESTO ES LO QUE DEBES AGREGAR PARA COMPROBAR ---
        console.log("\n=== DISPOSITIVOS DETECTADOS EN HOME ASSISTANT ===");
        console.table(sensoresYSwitches.map((s: any) => ({
          ID: s.entity_id,
          Nombre: s.attributes.friendly_name || "Sin nombre",
          Estado: s.state,
          Unidad: s.attributes.unit_of_measurement || ""
        })));
        console.log("================================================\n");
        // --------------------------------------------------

        broadcastToUnity({
          type: 'initial_state',
          data: sensoresYSwitches.map((s: any) => ({
            entity: s.entity_id,
            state: s.state,
            friendly_name: s.attributes.friendly_name
          }))
        });
      }

      // MANEJO DE CAMBIOS EN TIEMPO REAL (Respuesta a subscribe_events)
      else if (msg.type === 'event' && msg.event?.data?.new_state) {
        const entityId = msg.event.data.entity_id;

        if (entityId.includes('switch') || entityId.includes('sensor')) {
          broadcastToUnity({
            type: 'state_change',
            entity: entityId,
            state: msg.event.data.new_state?.state
          });
        }
      }
    } catch (e) {
      console.error("Error al procesar mensaje de HA WebSocket:", e);
    }
  });

  haWs.on('error', (err) => {
    console.error('Error en HA WebSocket:', err);
  });

  haWs.on('close', () => {
    console.log('Desconectado de HA WebSocket, reintentando en 5s...');
    setTimeout(connectToHA, 5000);
  });
}

export function startHAWebsocketServer(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Cliente Unity/Frontend conectado al WebSocket');
    unityClients.add(ws);

    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data);
        if (message.action === 'turn_on' || message.action === 'turn_off') {
          const entityId = message.entity;
          const service = message.action === 'turn_on' ? 'switch/turn_on' : 'switch/turn_off';
          try {
            await axios.post(`${HA_HTTP_URL}/services/${service}`,
              { entity_id: entityId },
              { headers: { Authorization: `Bearer ${HA_TOKEN}`, 'Content-Type': 'application/json' } }
            );
            console.log(`Comando ${message.action} enviado a ${entityId}`);
          } catch (err: any) {
            console.error('Error al enviar comando a HA:', err.message);
            ws.send(JSON.stringify({ type: 'error', message: err.message }));
          }
        }
      } catch (e) {
        console.error("Error al procesar mensaje de Unity/Frontend:", e);
      }
    });

    ws.on('close', () => {
      unityClients.delete(ws);
      console.log('Cliente Unity/Frontend desconectado');
    });
  });

  // Iniciar la conexión a Home Assistant
  connectToHA();
  console.log('Servidor WebSocket para Unity/Frontend adjunto al servidor HTTP principal');
}
