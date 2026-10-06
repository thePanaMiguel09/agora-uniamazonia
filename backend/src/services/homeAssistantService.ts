import axios from "axios";

const HA_HOST = process.env.HA_HOST;
const TOKEN = process.env.HA_TOKEN;

export async function prenderSwitch(entityId: string) {
    try {
        const domain = entityId.split('.')[0] || 'switch';
        await axios.post(
`http://${HA_HOST}/api/services/${domain}/turn_on`,
            { entity_id: entityId },
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return { success: true };

    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function apagarSwitch(entityId: string) {
    try {
        const domain = entityId.split('.')[0] || 'switch';
        await axios.post(
`http://${HA_HOST}/api/services/${domain}/turn_off`,
            { entity_id: entityId },
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return { success: true };

    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function obtenerSensores() {
    try {
        const response = await axios.get(
            `http://${HA_HOST}/api/states`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // Filtrar solo sensores de temperatura y humedad
        const sensores = response.data.filter((entity: any) => {
            const entityId = entity.entity_id;
            return entityId.startsWith("sensor.") && 
                   (entityId.toLowerCase().includes("temperature") || 
                    entityId.toLowerCase().includes("temperatura") ||
                    entityId.toLowerCase().includes("humidity") || 
                    entityId.toLowerCase().includes("sonoff_100296c34a") || 
                    entityId.toLowerCase().includes("humedad"));
        }).map((entity: any) => {
            const eId = entity.entity_id.toLowerCase();
            return {
                entityId: entity.entity_id,
                nombre: entity.attributes?.friendly_name || entity.entity_id,
                valor: entity.state,
                unidad: entity.attributes?.unit_of_measurement || "",
                tipo: eId.includes("temperature") || eId.includes("temperatura") 
                    ? "temperature" 
                    : "humidity",
                ubicacion: entity.attributes?.area_id || "Desconocida",
                deviceName: entity.attributes?.device_name || ""
            };
        });

        return sensores;

    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function obtenerSwitches() {
    try {
        const response = await axios.get(
            `http://${HA_HOST}/api/states`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // Filtrar solo switches (luces, Sonoff, etc)
        const switches = response.data.filter((entity: any) => {
            const entityId = entity.entity_id.toLowerCase();
            return entityId.startsWith("light.") || entityId.startsWith("switch.");
        }).map((entity: any) => {
            const eId = entity.entity_id.toLowerCase();
            return {
                entityId: entity.entity_id,
                nombre: entity.attributes?.friendly_name || entity.entity_id,
                estado: entity.state, // "on" o "off"
                tipo: eId.startsWith("light.") ? "light" : "switch", // Tipo de dispositivo
                ubicacion: entity.attributes?.area_id || "Desconocida",
                deviceName: entity.attributes?.device_name || "",
                icon: entity.attributes?.icon || "mdi:lightbulb"
            };
        });

        return switches;

    } catch (error: any) {
        throw new Error(error.message);
    }
    
}

export async function obtenerBombas() {
    try {
        const response = await axios.get(
            `http://${HA_HOST}/api/states`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const switches = response.data.filter((entity: any) => {
            const entityId = entity.entity_id.toLowerCase();
            return entityId.startsWith("switch.bomba");
        }).map((entity: any) => {
            const eId = entity.entity_id.toLowerCase();
            return {
                entityId: entity.entity_id,
                nombre: entity.attributes?.friendly_name || entity.entity_id,
                estado: entity.state, // "on" o "off"
                tipo: "switch", // Tipo de dispositivo
                ubicacion: entity.attributes?.area_id || "Desconocida",
                deviceName: entity.attributes?.device_name || "",
                icon: entity.attributes?.icon || "mdi:lightbulb"
            };
        });

        return switches;

    } catch (error: any) {
        throw new Error(error.message);
    }

    
}
