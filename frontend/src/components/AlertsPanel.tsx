// components/AlertsPanel.tsx
import { Bell, AlertTriangle, CheckCircle, Activity } from "lucide-react";

interface Alert {
  id: number;
  message: string;
  time: string;
  type: "warning" | "success" | "info";
  priority?: "high" | "medium" | "low";
}

interface AlertsPanelProps {
  alerts: Alert[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  const normalizedAlerts = alerts.map(alert => ({
    ...alert,
    type: alert.type.toLowerCase() as "warning" | "success" | "info"
  }));

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority?: string) => {
    switch (priority) {
      case 'high': return 'Crítica';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Normal';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Bell size={16} className="text-white" />
          </div>
          Alertas del Sistema
        </h2>
        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
          {normalizedAlerts.filter(a => a.priority === 'high').length} críticas
        </span>
      </div>

      {/* Lista de alertas */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {normalizedAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
              alert.type === "warning"
                ? "bg-orange-50 border-orange-200"
                : alert.type === "success"
                ? "bg-green-50 border-green-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Icono */}
              <div className={`p-1.5 rounded ${
                alert.type === "warning"
                  ? "bg-orange-600 text-white"
                  : alert.type === "success"
                  ? "bg-green-600 text-white"
                  : "bg-blue-600 text-white"
              }`}>
                {alert.type === "warning" ? (
                  <AlertTriangle size={14} />
                ) : alert.type === "success" ? (
                  <CheckCircle size={14} />
                ) : (
                  <Activity size={14} />
                )}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1 leading-tight">
                  {alert.message}
                </p>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">
                    {alert.time}
                  </span>
                  
                  {alert.priority && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getPriorityColor(alert.priority)}`}>
                        {getPriorityText(alert.priority)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer con estadísticas */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Total: {normalizedAlerts.length} alertas</span>
          <div className="flex gap-2">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Críticas: {normalizedAlerts.filter(a => a.priority === 'high').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Advertencias: {normalizedAlerts.filter(a => a.type === 'warning').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}