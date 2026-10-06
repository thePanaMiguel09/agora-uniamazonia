// components/LogoutModal.tsx
import { LogOut, X } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutModal({ isOpen, onConfirm, onCancel }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onCancel}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-[scaleIn_0.25s_ease-out]">
        {/* Línea decorativa superior */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500"></div>

        {/* Botón cerrar */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
        >
          <X size={18} />
        </button>

        {/* Contenido */}
        <div className="p-8 text-center">
          {/* Icono */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-5">
            <LogOut size={28} className="text-white" />
          </div>

          {/* Texto */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Cerrar Sesión
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            ¿Estás seguro de que deseas cerrar sesión? Tendrás que iniciar sesión nuevamente para acceder al sistema.
          </p>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl border border-gray-200 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Animaciones CSS inline */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
