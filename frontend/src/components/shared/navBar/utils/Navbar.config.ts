import { FileText, Settings, User, type LucideIcon } from "lucide-react";

/* ------------------------------ Roles ------------------------------ */

export const ROLES = { ADMIN: 1, OPERADOR: 2, SUPERVISOR: 3 } as const;
export type RoleId = (typeof ROLES)[keyof typeof ROLES];

export const DEFAULT_ROLE: RoleId = ROLES.OPERADOR;

export const ROLE_LABELS: Record<RoleId, string> = {
  [ROLES.ADMIN]: "Administrador",
  [ROLES.OPERADOR]: "Operador",
  [ROLES.SUPERVISOR]: "Supervisor",
};

/* ------------------------------ Tipos ------------------------------ */

interface Restricted {
  /** Si se omite, el elemento es visible para todos los roles. */
  roles?: readonly RoleId[];
}

export interface NavLinkConfig extends Restricted {
  label: string;
  to: string;
  /** Prefijos adicionales que también marcan este link como activo. */
  matchPrefixes?: readonly string[];
}

type MenuTarget =
  | { to: string; href?: never } // navegación interna
  | { href: string; to?: never }; // enlace externo (nueva pestaña)

export type MenuItemConfig = MenuTarget &
  Restricted & {
    id: string;
    label: string;
    /** Etiqueta corta para el menú móvil (grid de 2 columnas). */
    shortLabel?: string;
    icon: LucideIcon;
  };

/* --------------------------- Configuración -------------------------- */

export const NAV_LINKS: readonly NavLinkConfig[] = [
  { label: "Dashboard", to: "/" },
  {
    label: "Laboratorios",
    to: "/laboratories",
    matchPrefixes: ["/laboratory", "/projects", "/stands"],
    roles: [ROLES.ADMIN, ROLES.SUPERVISOR],
  },
  { label: "Sensores", to: "/sensors" },
];

export const MENU_ITEMS: readonly MenuItemConfig[] = [
  {
    id: "users",
    label: "Gestión de Usuarios",
    shortLabel: "Usuarios",
    icon: User,
    to: "/users",
    roles: [ROLES.ADMIN],
  },
  {
    id: "settings",
    label: "Configuración",
    icon: Settings,
    to: "/settings",
    roles: [ROLES.ADMIN, ROLES.SUPERVISOR],
  },
  {
    id: "docs",
    label: "Documentación",
    icon: FileText,
    href: "/docs",
  },
];

/* ------------------------------ Helpers ----------------------------- */

export const canAccess = (item: Restricted, roleId: RoleId) =>
  !item.roles || item.roles.includes(roleId);

/** Coincidencia por segmento: "/laboratory/3" activa "/laboratory", pero "/" solo coincide exacto. */
export const isLinkActive = (pathname: string, link: NavLinkConfig) => {
  if (link.to === "/") return pathname === "/";

  return [link.to, ...(link.matchPrefixes ?? [])].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
};