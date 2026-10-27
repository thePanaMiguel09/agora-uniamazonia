import axios from "axios";

const HA_HOST = process.env.HA_HOST || "192.168.1.12:8123";
const TOKEN = process.env.HA_TOKEN || "";

/**
 * Interfaz que representa la estructura de una entidad de Home Assistant obtenida desde la API REST.
 */
export interface HAEntity {
  entity_id: string;
  state: string;
  attributes?: {
    friendly_name?: string;
    unit_of_measurement?: string;
    area_id?: string;
    device_name?: string;
    icon?: string;
    [key: string]: unknown;
  };
}

/**
 * Interfaz para el DTO de sensores devueltos al cliente.
 */
export interface SensorDTO {
  entityId: string;
  nombre: string;
  valor: string;
  unidad: string;
  tipo: "temperature" | "humidity";
  ubicacion: string;
  deviceName: string;
}

/**
 * Interfaz para el DTO de switches y luces devueltos al cliente.
 */
export interface SwitchDTO {
  entityId: string;
  nombre: string;
  estado: string;
  tipo: "light" | "switch";
  ubicacion: string;
  deviceName: string;
  icon: string;
}

/**
 * Envía una orden para encender un switch o luz en Home Assistant.
 *
 * @param {string} entityId - Identificador de la entidad (ej: switch.luz_laboratorio).
 * @returns {Promise<{ success: boolean }>} Objeto indicando el éxito de la operación.
 */
export async function prenderSwitch(
  entityId: string,
): Promise<{ success: boolean }> {
  try {
    const domain = entityId.split(".")[0] || "switch";
    await axios.post(
      `http://${HA_HOST}/api/services/${domain}/turn_on`,
      { entity_id: entityId },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    return { success: true };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    throw new Error(
      `No se pudo encender el dispositivo ${entityId}: ${errorMessage}`,
    );
  }
}

/**
 * Envía una orden para apagar un switch o luz en Home Assistant.
 *
 * @param {string} entityId - Identificador de la entidad.
 * @returns {Promise<{ success: boolean }>} Objeto indicando el éxito de la operación.
 */
export async function apagarSwitch(
  entityId: string,
): Promise<{ success: boolean }> {
  try {
    const domain = entityId.split(".")[0] || "switch";
    await axios.post(
      `http://${HA_HOST}/api/services/${domain}/turn_off`,
      { entity_id: entityId },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    return { success: true };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    throw new Error(
      `No se pudo apagar el dispositivo ${entityId}: ${errorMessage}`,
    );
  }
}

/**
 * Obtiene y filtra los sensores de temperatura y humedad desde Home Assistant.
 *
 * @returns {Promise<SensorDTO[]>} Lista estructurada de sensores.
 */
export async function obtenerSensores(): Promise<SensorDTO[]> {
  try {
    const response = await axios.get<HAEntity[]>(
      `http://${HA_HOST}/api/states`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    const sensores: SensorDTO[] = response.data
      .filter((entity: HAEntity) => {
        const entityId = entity.entity_id.toLowerCase();
        return (
          entityId.startsWith("sensor.") &&
          (entityId.includes("temperature") ||
            entityId.includes("temperatura") ||
            entityId.includes("humidity") ||
            entityId.includes("sonoff_100296c34a") ||
            entityId.includes("humedad"))
        );
      })
      .map((entity: HAEntity): SensorDTO => {
        const eId = entity.entity_id.toLowerCase();
        return {
          entityId: entity.entity_id,
          nombre: entity.attributes?.friendly_name || entity.entity_id,
          valor: entity.state,
          unidad: entity.attributes?.unit_of_measurement || "",
          tipo:
            eId.includes("temperature") || eId.includes("temperatura")
              ? "temperature"
              : "humidity",
          ubicacion: entity.attributes?.area_id || "Desconocida",
          deviceName: entity.attributes?.device_name || "",
        };
      });

    return sensores;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    throw new Error(
      `Error al obtener sensores de Home Assistant: ${errorMessage}`,
    );
  }
}

/**
 * Obtiene y filtra todas las luces y switches disponibles en Home Assistant.
 *
 * @returns {Promise<SwitchDTO[]>} Lista estructurada de switches y luces.
 */
export async function obtenerSwitches(): Promise<SwitchDTO[]> {
  try {
    const response = await axios.get<HAEntity[]>(
      `http://${HA_HOST}/api/states`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    const switches: SwitchDTO[] = response.data
      .filter((entity: HAEntity) => {
        const entityId = entity.entity_id.toLowerCase();
        return entityId.startsWith("light.") || entityId.startsWith("switch.");
      })
      .map((entity: HAEntity): SwitchDTO => {
        const eId = entity.entity_id.toLowerCase();
        return {
          entityId: entity.entity_id,
          nombre: entity.attributes?.friendly_name || entity.entity_id,
          estado: entity.state,
          tipo: eId.startsWith("light.") ? "light" : "switch",
          ubicacion: entity.attributes?.area_id || "Desconocida",
          deviceName: entity.attributes?.device_name || "",
          icon: entity.attributes?.icon || "mdi:lightbulb",
        };
      });

    return switches;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    throw new Error(
      `Error al obtener switches de Home Assistant: ${errorMessage}`,
    );
  }
}

/**
 * Obtiene y filtra específicamente los dispositivos de tipo bomba conectados a Home Assistant.
 *
 * @returns {Promise<SwitchDTO[]>} Lista estructurada de bombas.
 */
export async function obtenerBombas(): Promise<SwitchDTO[]> {
  try {
    const response = await axios.get<HAEntity[]>(
      `http://${HA_HOST}/api/states`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    const bombas: SwitchDTO[] = response.data
      .filter((entity: HAEntity) => {
        const entityId = entity.entity_id.toLowerCase();
        return entityId.startsWith("switch.bomba");
      })
      .map((entity: HAEntity): SwitchDTO => {
        return {
          entityId: entity.entity_id,
          nombre: entity.attributes?.friendly_name || entity.entity_id,
          estado: entity.state,
          tipo: "switch",
          ubicacion: entity.attributes?.area_id || "Desconocida",
          deviceName: entity.attributes?.device_name || "",
          icon: entity.attributes?.icon || "mdi:water-pump",
        };
      });

    return bombas;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    throw new Error(
      `Error al obtener bombas de Home Assistant: ${errorMessage}`,
    );
  }
}
