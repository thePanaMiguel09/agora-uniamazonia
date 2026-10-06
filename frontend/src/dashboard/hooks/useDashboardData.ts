import { useEffect, useState } from "react";

import { getStats } from "../services/dashboard.service";

import { EMPTY_STATS } from "../utils/dashboard.config";
import type { SystemStats } from "../types/dashboard.types";

/** Carga inicial de las estadísticas del sistema (cancelable al desmontar). */
export function useDashboardData() {
    const [stats, setStats] = useState<SystemStats>(EMPTY_STATS);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const load = async () => {
            try {
                
                setStats(await getStats(signal));
            } catch (err) {
                if (signal.aborted) return;
                console.error("Error al cargar las estadísticas:", err);
                setError("No se pudieron cargar las estadísticas del sistema.");
            } finally {
                if (!signal.aborted) setIsLoading(false);
            }
        };

        load();
        return () => controller.abort();
    }, []);

    return { stats, isLoading, error };
}