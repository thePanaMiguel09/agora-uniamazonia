import { useEffect, useState } from "react";

import { getAlerts } from "../services/dashboard.service";

import { ALERTS_POLL_INTERVAL_MS } from "../utils/dashboard.config";
import type { Alert } from "../types/dashboard.types";


/**
 * Polling de alertas.
 * - Cancela la petición anterior si sigue en curso.
 * - No consulta mientras la pestaña está oculta y refresca al volver a ella.
 */
export function useAlerts(intervalMs = ALERTS_POLL_INTERVAL_MS) {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        let controller: AbortController | null = null;

        const load = async () => {
            if (document.hidden) return;

            controller?.abort();
            controller = new AbortController();
            const { signal } = controller;

            try {
                const data = await getAlerts(signal);
                if (!signal.aborted) setAlerts(data);
            } catch (error) {
                if (!signal.aborted) console.error("Error al cargar alertas:", error);
            }
        };

        const onVisibilityChange = () => {
            if (!document.hidden) load();
        };

        load();
        const id = setInterval(load, intervalMs);
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            clearInterval(id);
            document.removeEventListener("visibilitychange", onVisibilityChange);
            controller?.abort();
        };
    }, [intervalMs]);

    return alerts;
}