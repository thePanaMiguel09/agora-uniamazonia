// components/Navbar.tsx
import { Activity, User, Clock, Settings, LogOut, Menu, X, FileText } from 'lucide-react';
import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
//import ComponentPanel from './ComponentPanel';
import { useAppContext } from '../context/AppContext';
import LogoutModal from '../modals/LogoutModal';

export default function Navbar() {
  const { user, logout } = useAppContext(); // 2. Obtén user y logout del contexto
  const navigate = useNavigate();
  const location = useLocation();

  // Variables derivadas del contexto
  const username = user?.username || 'Usuario';
  const roleNames: Record<number, string> = {
    1: 'Administrador',
    2: 'Operador',
    3: 'Supervisor'
  };
  const roleName = roleNames[user?.fk_id_rol || 2] || 'Operador';
  const isAdmin = user?.fk_id_rol === 1;
  const isOperador = user?.fk_id_rol === 2;


  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Refs para la animación del indicador
  const navRef = useRef<HTMLElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    ...(!isOperador ? [{ name: 'Laboratorios', path: '/laboratories-management' }] : []),
    { name: 'Sensores', path: '/sensors' },
  ];

  // Calcular posición del indicador relativo al nav
  const updateIndicator = useCallback(() => {
    const activeButton = buttonRefs.current[location.pathname];
    const nav = navRef.current;
    if (activeButton && nav) {
      const navRect = nav.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - navRect.left,
        width: buttonRect.width,
        opacity: 1,
      });
    } else {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [location.pathname]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav ref={navRef} className="w-full bg-gray-900 sticky top-0 z-50">
        {/* Container principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between h-16">
            {/* Logo y título a la izquierda */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => handleNavigation('/dashboard')}
              >
                <div className="relative h-10 w-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg"></div>
                  <div className="relative h-full w-full bg-white/10 backdrop-blur-sm rounded-xl border border-emerald-400/30 flex items-center justify-center">
                    <Activity size={22} className="text-white filter drop-shadow" />
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight filter drop-shadow-lg">
                  LabControl Pro
                </h1>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-xs font-semibold text-white tracking-wider z-10">
                    UNIVERSIDAD DE LA AMAZONIA
                  </span>
                </div>
              </div>
            </div>

            {/* Centro: Navegación principal con indicador animado */}
            <div className="relative flex items-center gap-1 h-full py-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <button
                    key={link.path}
                    ref={(el) => { buttonRefs.current[link.path] = el; }}
                    onClick={() => handleNavigation(link.path)}
                    className={`relative px-4 h-12 text-sm font-medium transition-all duration-300 flex items-center justify-center rounded-lg cursor-pointer ${isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5 '
                      }`}
                  >
                    {link.name}
                    {/* Fondo activo sutil */}
                    {isActive && (
                      <div className="absolute inset-0 bg-emerald-500/10 rounded-lg pointer-events-none"></div>
                    )}
                    {/* Hover line para inactivos */}
                    {!isActive && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-1 bg-emerald-500/40 transition-all duration-300 group-hover:w-full rounded-t-full"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Derecha: Controles de usuario */}
            <div className="flex items-center gap-4">
              {/* Hora y fecha */}
              <div className=" rounded-lg px-4 h-11 flex items-center">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-emerald-400" />
                  <div className="flex flex-col justify-center">
                    <div className="text-sm font-semibold text-white font-mono leading-none mb-0.5">
                      {formatTime(currentTime)}
                    </div>
                    <div className="text-[10px] text-gray-400 leading-none">
                      {formatDate(currentTime)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Usuario */}
              <div className="flex items-center gap-3  rounded-lg px-4 h-11 border border-gray-700">
                <div className="h-7 w-7 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow">
                  <User size={14} className="text-white" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-semibold text-white block truncate max-w-[100px] leading-none mb-0.5">
                    {username}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold leading-none">
                    {roleName}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Cerrar sesión */}
              <button
                onClick={handleLogout}
                className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-gray-700 hover:border-red-400/30 transition-all duration-200 cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between h-16">
              {/* Logo y título */}
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleNavigation('/dashboard')}
                >
                  <div className="relative h-8 w-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg"></div>
                    <div className="relative h-full w-full bg-white/10 backdrop-blur-sm rounded-lg border border-emerald-400/30 flex items-center justify-center">
                      <Activity size={16} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">LabControl</h1>
                  </div>
                </div>
              </div>

              {/* Controles móviles */}
              <div className="flex items-center gap-2">
                {/* Hora */}
                <div className="bg-gray-800 rounded-lg px-3 py-1.5 border border-gray-700">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-emerald-400" />
                    <div className="text-xs font-semibold text-white font-mono">
                      {formatTime(currentTime)}
                    </div>
                  </div>
                </div>

                {/* Menú hamburguesa */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer"
                >
                  {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Línea decorativa inferior con indicador animado tipo gota */}
        <div className="relative" style={{ height: '4px' }}>
          {/* Línea base verde */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500"></div>

          {/* SVG Gota / Blob que emerge de la línea */}
          <div
            className="absolute transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
              top: '-14px',
              height: '18px',
            }}
          >
            <svg
              viewBox="0 0 100 18"
              preserveAspectRatio="none"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.5))' }}
            >
              {/* Forma de gota: la línea sube suavemente desde los lados y forma un arco */}
              <path
                d="M0,18 C5,18 15,18 20,16 C28,12 35,4 50,4 C65,4 72,12 80,16 C85,18 95,18 100,18"
                fill="url(#dropGradient)"
              />
              {/* Línea de borde luminoso */}
              <path
                d="M0,18 C5,18 15,18 20,16 C28,12 35,4 50,4 C65,4 72,12 80,16 C85,18 95,18 100,18"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
              />
              <defs>
                <linearGradient id="dropGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#10b981" stopOpacity="1" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Highlighter blanco sobre la línea base en la posición activa */}
          <div
            className="absolute top-0 h-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              left: `${indicatorStyle.left + indicatorStyle.width * 0.15}px`,
              width: `${indicatorStyle.width * 0.7}px`,
              opacity: indicatorStyle.opacity * 0.5,
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, transparent 70%)',
            }}
          ></div>
        </div>
      </nav>

      {/* Desktop Menu Dropdown */}
      <div
        className={`hidden lg:block fixed right-4 top-20 z-40 transition-all duration-300 ease-in-out cursor-pointer ${isMenuOpen
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
      >
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl p-4 w-64 backdrop-blur-sm">
          {/* Información del usuario */}
          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600 mb-3">
            <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow">
              <User size={18} className="text-white" />
            </div>
            <div>
              <span className="font-semibold text-white text-sm block">
                {username}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                {roleName}
              </span>
            </div>
          </div>

          {/* Menú de opciones */}
          <div className="space-y-2">
            {isAdmin && (
              <button
                className="w-full flex items-center gap-3 p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg border border-transparent hover:border-gray-600 transition-all duration-200 cursor-pointer"
                onClick={() => handleNavigation('/users')}
              >
                <User size={18} className="text-emerald-400" />
                <span className="font-medium text-sm">Gestión de Usuarios</span>
              </button>
            )}

            <button
              className="w-full flex items-center gap-3 p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg border border-transparent hover:border-gray-600 transition-all duration-200 cursor-pointer"
              onClick={() => { }}
            >
              <Activity size={18} className="text-emerald-400" />
              <span className="font-medium text-sm">Componentes</span>
            </button>

            {!isOperador && (
              <button
                className="w-full flex items-center gap-3 p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg border border-transparent hover:border-gray-600 transition-all duration-200 cursor-pointer"
                onClick={() => handleNavigation('/settings')}
              >
                <Settings size={18} className="text-emerald-400" />
                <span className="font-medium text-sm">Configuración</span>
              </button>
            )}

            <button
              className="w-full flex items-center gap-3 p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg border border-transparent hover:border-gray-600 transition-all duration-200 cursor-pointer"
              onClick={() => window.open('/docs', '_blank')}
            >
              <FileText size={18} className="text-emerald-400" />
              <span className="font-medium text-sm">Documentación</span>
            </button>

            {/* Separador */}
            <div className="border-t border-gray-700 my-2"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-400/30 transition-all duration-200 cursor-pointer"
            >
              <LogOut size={18} />
              <span className="font-medium text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden cursor-pointer ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="bg-gray-800 border-b border-gray-700 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-3">
            {/* Información del usuario móvil */}
            <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
              <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <div>
                <span className="font-semibold text-white text-sm block">
                  {username}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                  {roleName}
                </span>
              </div>
            </div>

            {/* Menú móvil */}
            <div className="grid grid-cols-2 gap-2">
              <button
                className="flex items-center gap-2 p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg border border-gray-600 transition-all duration-200 cursor-pointer"
                onClick={() => handleNavigation('/dashboard')}
              >
                <Activity size={16} className="text-emerald-400" />
                <span className="text-sm font-medium">Dashboard</span>
              </button>

              <button
                className="flex items-center gap-2 p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg border border-gray-600 transition-all duration-200 cursor-pointer"
                onClick={() => handleNavigation('/laboratories')}
              >
                <Activity size={16} className="text-emerald-400" />
                <span className="text-sm font-medium">Laboratorios</span>
              </button>

              <button
                className="flex items-center gap-2 p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg border border-gray-600 transition-all duration-200 cursor-pointer"
                onClick={() => { }}
              >
                <Activity size={16} className="text-emerald-400" />
                <span className="text-sm font-medium">Componentes</span>
              </button>

              {isAdmin && (
                <button
                  className="flex items-center gap-2 p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg border border-gray-600 transition-all duration-200 cursor-pointer"
                  onClick={() => handleNavigation('/users')}
                >
                  <User size={16} className="text-emerald-400" />
                  <span className="text-sm font-medium">Usuarios</span>
                </button>
              )}

              {!isOperador && (
                <button
                  className="flex items-center gap-2 p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg border border-gray-600 transition-all duration-200 cursor-pointer"
                  onClick={() => handleNavigation('/settings')}
                >
                  <Settings size={16} className="text-emerald-400" />
                  <span className="text-sm font-medium">Configuración</span>
                </button>
              )}
            </div>

            {/* Cerrar sesión móvil */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-red-400/30 transition-all duration-200 cursor-pointer"
            >
              <LogOut size={16} />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Panel de Componentes */}
      {/*
      <ComponentPanel
        isOpen={isComponentsPanelOpen}
        onClose={handleCloseComponentsPanel}
      />
      */}

      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:block hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}