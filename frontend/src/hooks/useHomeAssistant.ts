import { useState, useEffect, useRef } from 'react';
import { wsUrl } from '../../config';
import api from '../api/api';

export const useHomeAssistant = () => {
    const [haStates, setHaStates] = useState<Record<string, string>>({});
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Cargar estado inicial de switches y luces
        const fetchInitialStates = async () => {
            try {
                const res = await api.get('/switches');
                const states: Record<string, string> = {};
                res.data.forEach((device: any) => {
                    states[device.entityId] = device.estado;
                });
                setHaStates(prev => ({ ...prev, ...states }));
            } catch (error) {
                console.error('Error fetching initial switches state:', error);
            }
        };
        fetchInitialStates();

        // Cargar estado inicial de sensores (Temperatura y Humedad)
        const fetchSensores = async () => {
            try {
                const res = await api.get('/sensores');
                const states: Record<string, string> = {};
                res.data.forEach((sensor: any) => {
                    states[sensor.entityId] = sensor.valor;
                });
                setHaStates(prev => ({ ...prev, ...states }));
            } catch (error) {
                console.error('Error fetching initial sensors state:', error);
            }
        };
        fetchSensores();

        // Conectar al WebSocket
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => console.log('Conectado al servidor WebSocket local (HA Bridge)');

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'state_change') {
                    setHaStates(prev => ({ ...prev, [msg.entity]: msg.state }));
                }
            } catch (e) {
                console.error('Error parseando mensaje WS:', e);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    const sendHACommand = async (entity: string, turnOn: boolean) => {
        try {
            const endpoint = turnOn ? '/luz/on' : '/luz/off';
            await api.post(endpoint, { entityId: entity });
            console.log(`Comando enviado: ${endpoint} para la entidad ${entity}`);
        } catch (error) {
            console.error('Error enviando comando a HA por API:', error);
        }
    };

    return { haStates, sendHACommand };
};
