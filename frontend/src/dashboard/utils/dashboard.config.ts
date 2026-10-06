import { Building2, Settings, Users, type LucideIcon } from "lucide-react";
// Idealmente ROLES/RoleId/canAccess viven en un módulo compartido (p. ej. auth/roles.ts)
import { ROLES, type RoleId } from "../../components/shared/navBar/utils/Navbar.config";
import type { SystemStats } from "../types/dashboard.types";

/* --------------------------- Acciones rápidas ----------------------- */

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  to: string;
  /** Clase de Tailwind para el fondo del icono. */
  color: string;
  /** Si se omite, visible para todos los roles. */
  roles?: readonly RoleId[];
}

export const QUICK_ACTIONS: readonly QuickAction[] = [
  {
    id: "laboratories",
    label: "Gestión de Laboratorios",
    description: "Administrar laboratorios y configuraciones",
    icon: Building2,
    to: "/laboratories",
    color: "bg-blue-500",
    roles: [ROLES.ADMIN, ROLES.SUPERVISOR],
  },
  {
    id: "users",
    label: "Gestión de Usuarios",
    description: "Administrar usuarios y permisos",
    icon: Users,
    to: "/users",
    color: "bg-green-500",
    roles: [ROLES.ADMIN],
  },
  {
    id: "settings",
    label: "Configuración del Sistema",
    description: "Configurar parámetros del sistema",
    icon: Settings,
    to: "/settings",
    color: "bg-gray-500",
    roles: [ROLES.ADMIN, ROLES.SUPERVISOR],
  },
];

/* ------------------------------ Estado inicial ----------------------- */

export const EMPTY_STATS: SystemStats = {
  totalLabs: 0,
  activeLabs: 0,
  totalUsers: 0,
  activeSensors: 0,
  totalDevices: 0,
  automationEnabled: 0,
  systemUptime: "99.9%",
  dataAccuracy: 98.5,
};

export const ALERTS_POLL_INTERVAL_MS = 30_000;