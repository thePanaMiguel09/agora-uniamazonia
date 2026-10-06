import { LogOut, Menu, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAppContext } from "../../../context/AppContext";

import LogoutModal from "../../../modals/LogoutModal";
import { useNavIndicator } from "./hooks/useNavIndicator";
import { NavBrand } from "./components/NavBrand";
import { NavClock } from "./components/NavClock";
import { NavIndicator } from "./components/NavIndicator";
import { DesktopMenu, MobileMenu } from "./components/NavMenus";
import { UserBadge } from "./components/UserBadge";

import {
  canAccess,
  DEFAULT_ROLE,
  isLinkActive,
  MENU_ITEMS,
  NAV_LINKS,
  ROLE_LABELS,
  type RoleId,
} from "./utils/Navbar.config";

const DESKTOP_MENU_ID = "navbar-desktop-menu";
const MOBILE_MENU_ID = "navbar-mobile-menu";

export default function Navbar() {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  /* ----------------------- Datos derivados del usuario ---------------------- */

  const username = user?.username || "Usuario";
  const roleId = (user?.fk_id_rol ?? DEFAULT_ROLE) as RoleId;
  const roleName = ROLE_LABELS[roleId] ?? ROLE_LABELS[DEFAULT_ROLE];

  const links = useMemo(
    () => NAV_LINKS.filter((link) => canAccess(link, roleId)),
    [roleId],
  );
  const menuItems = useMemo(
    () => MENU_ITEMS.filter((item) => canAccess(item, roleId)),
    [roleId],
  );

  const activeLink = links.find((link) => isLinkActive(pathname, link));
  const {
    containerRef,
    registerItem,
    style: indicatorStyle,
  } = useNavIndicator(activeLink?.to);

  /* ------------------------------- Handlers -------------------------------- */

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen((open) => !open), []);
  const requestLogout = useCallback(() => setShowLogoutModal(true), []);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    setIsMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  // Cerrar el menú con Escape
  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  /* -------------------------------- Render --------------------------------- */

  return (
    <>
      <nav
        ref={containerRef}
        aria-label="Navegación principal"
        className="w-full bg-gray-900 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop */}
          <div className="hidden lg:flex items-center justify-between h-16">
            <NavBrand variant="desktop" />

            <div className="relative flex items-center gap-1 h-full py-2">
              {links.map((link) => {
                const isActive = activeLink?.to === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    ref={registerItem(link.to)}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative px-4 h-12 text-sm font-medium transition-all duration-300 flex items-center justify-center rounded-lg ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                    {isActive ? (
                      <div className="absolute inset-0 bg-emerald-500/10 rounded-lg pointer-events-none" />
                    ) : (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-1 bg-emerald-500/40 transition-all duration-300 group-hover:w-full rounded-t-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
              <NavClock variant="full" />
              <UserBadge
                variant="bar"
                userName={username}
                roleName={roleName}
              />

              <button
                type="button"
                onClick={toggleMenu}
                aria-expanded={isMenuOpen}
                aria-controls={DESKTOP_MENU_ID}
                aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <button
                type="button"
                onClick={requestLogout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-gray-700 hover:border-red-400/30 transition-all duration-200 cursor-pointer"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Móvil */}
          <div className="lg:hidden flex items-center justify-between h-16">
            <NavBrand variant="mobile" />

            <div className="flex items-center gap-2">
              <NavClock variant="compact" />
              <button
                type="button"
                onClick={toggleMenu}
                aria-expanded={isMenuOpen}
                aria-controls={MOBILE_MENU_ID}
                aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer"
              >
                {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        <NavIndicator style={indicatorStyle} />
      </nav>

      <DesktopMenu
        id={DESKTOP_MENU_ID}
        isOpen={isMenuOpen}
        username={username}
        roleName={roleName}
        items={menuItems}
        onNavigate={closeMenu}
        onLogout={requestLogout}
      />

      <MobileMenu
        id={MOBILE_MENU_ID}
        isOpen={isMenuOpen}
        username={username}
        roleName={roleName}
        links={links}
        items={menuItems}
        onNavigate={closeMenu}
        onLogout={requestLogout}
      />

      {/* Overlay para cerrar el menú al hacer clic fuera (solo desktop) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 hidden lg:block"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
