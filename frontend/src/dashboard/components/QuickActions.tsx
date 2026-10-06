import { Link } from "react-router-dom";
import type { QuickAction } from "../utils/dashboard.config";

interface QuickActionsProps {
  actions: readonly QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  // Un operador no tiene acciones disponibles: no mostramos una tarjeta vacía
  if (actions.length === 0) return null;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Acciones Rápidas
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map(({ id, to, label, description, color, icon: Icon }) => (
          <Link
            key={id}
            to={to}
            className="group flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-200 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md transform hover:-translate-y-1"
          >
            <div
              className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}
            >
              <Icon size={24} className="text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm text-center mb-1">
              {label}
            </h3>
            <p className="text-gray-500 text-xs text-center">{description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}