import api from "../../api/api";
import type { Alert, SystemStats } from "../types/dashboard.types";

export const getStats = (signal?: AbortSignal) =>
    api.get<SystemStats>("/dashboard/stats", { signal }).then((res) => res.data);

export const getAlerts = (signal?: AbortSignal) =>
    api.get<Alert[]>("/dashboard/alerts", { signal }).then((res) => res.data);