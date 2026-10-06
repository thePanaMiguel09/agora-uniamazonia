import { Activity, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import type { MenuItemConfig, NavLinkConfig } from "../utils/Navbar.config";
import { UserBadge } from "./UserBadge";

/* ---------------------------- Item de menú --------------------------- */

interface MenuItemLinkProps {
  item: MenuItemConfig;
  variant: "desktop" | "mobile";
  onNavigate: () => void;
}

const ITEM_BASE =
  "flex items-center p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg border transition-all duration-200";

function MenuItemLink({ item, variant, onNavigate }: MenuItemLinkProps) {
  const isDesktop = variant === "desktop";
  const Icon = item.icon;

  const className = `${ITEM_BASE} ${
    isDesktop
      ? "w-full gap-3 border-transparent hover:border-gray-600"
      : "gap-2 border-gray-600"
  }`;

  const content = (
    <>
      <Icon size={isDesktop ? 18 : 16} className="text-emerald-400" />
      <span className="text-sm font-medium">
        {isDesktop ? item.label : (item.shortLabel ?? item.label)}
      </span>
    </>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onNavigate}
      >
        {content}
      </a>
    );
  }

  return (
    <Link to={item.to!} className={className} onClick={onNavigate}>
      {content}
    </Link>
  );
}

/* ----------------------------- Desktop ------------------------------- */

interface DesktopMenuProps {
  id: string;
  isOpen: boolean;
  username: string;
  roleName: string;
  items: readonly MenuItemConfig[];
  onNavigate: () => void;
  onLogout: () => void;
}

export function DesktopMenu({
  id,
  isOpen,
  username,
  roleName,
  items,
  onNavigate,
  onLogout,
}: DesktopMenuProps) {
  return (
    <div
      id={id}
      aria-hidden={!isOpen}
      className={`hidden lg:block fixed right-4 top-20 z-40 transition-[opacity,transform,visibility] duration-300 ease-in-out ${
        isOpen
          ? "opacity-100 translate-y-0 visible"
          : "opacity-0 -translate-y-4 invisible"
      }`}
    >
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl p-4 w-64 backdrop-blur-sm">
        <UserBadge
          variant="card"
          userName={username}
          roleName={roleName}
          className="mb-3"
        />

        <div className="space-y-2">
          {items.map((item) => (
            <MenuItemLink
              key={item.id}
              item={item}
              variant="desktop"
              onNavigate={onNavigate}
            />
          ))}

          <div className="border-t border-gray-700 my-2" />

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-400/30 transition-all duration-200 cursor-pointer"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Móvil -------------------------------- */

interface MobileMenuProps {
  id: string;
  isOpen: boolean;
  username: string;
  roleName: string;
  links: readonly NavLinkConfig[];
  items: readonly MenuItemConfig[];
  onNavigate: () => void;
  onLogout: () => void;
}

export function MobileMenu({
  id,
  isOpen,
  username,
  roleName,
  links,
  items,
  onNavigate,
  onLogout,
}: MobileMenuProps) {
  return (
    <div
      id={id}
      aria-hidden={!isOpen}
      className={`lg:hidden overflow-hidden transition-[max-height,opacity,visibility] duration-300 ease-in-out ${
        isOpen
          ? "max-h-[28rem] opacity-100 visible"
          : "max-h-0 opacity-0 invisible"
      }`}
    >
      <div className="bg-gray-800 border-b border-gray-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-3">
          <UserBadge variant="card" userName={username} roleName={roleName} />

          <div className="grid grid-cols-2 gap-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={onNavigate}
                className={`${ITEM_BASE} gap-2 border-gray-600`}
              >
                <Activity size={16} className="text-emerald-400" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            ))}

            {items.map((item) => (
              <MenuItemLink
                key={item.id}
                item={item}
                variant="mobile"
                onNavigate={onNavigate}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-red-400/30 transition-all duration-200 cursor-pointer"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
