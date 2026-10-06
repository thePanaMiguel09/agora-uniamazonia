import { useState, useEffect } from "react";
import {
  Users,
  Building2,
  Thermometer,
  AlertTriangle,
  Settings,
  Cpu,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import SummaryCard from "../components/SummaryCard";
import AlertsPanel from "../components/AlertsPanel";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

interface Alert {
  id: number;
  message: string;
  time: string;
  type: "warning" | "success" | "info";
  priority: "high" | "medium" | "low";
}

interface SystemStats {
  totalLabs: number;
  activeLabs: number;
  totalUsers: number;
  activeSensors: number;
  totalDevices: number;
  automationEnabled: number;
  systemUptime: string;
  dataAccuracy: number;
}

export default function Dashboard() {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalLabs: 0,
    activeLabs: 0,
    totalUsers: 0,
    activeSensors: 0,
    totalDevices: 0,
    automationEnabled: 0,
    systemUptime: "99.9%",
    dataAccuracy: 98.5,
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Carga inicial de datos del sistema (stats, actividades)
  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const statsRes = await api.get("/dashboard/stats");
        setSystemStats(statsRes.data);

      } catch (error) {
        console.error("Error al cargar datos del sistema:", error);
      }
    };

    fetchSystemData();
  }, []);

  // Polling de alertas cada 30 segundos
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const alertsRes = await api.get("/dashboard/alerts");
        setAlerts(alertsRes.data);
      } catch (error) {
        console.error("Error al cargar alertas:", error);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = user?.fk_id_rol === 1;
  const isOperador = user?.fk_id_rol === 2;

  const quickActions = [
    ...(!isOperador
      ? [
          {
            icon: Building2,
            label: "Gestión de Laboratorios",
            description: "Administrar laboratorios y configuraciones",
            action: () => navigate("/laboratories-management"),
            color: "bg-blue-500",
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            icon: Users,
            label: "Gestión de Usuarios",
            description: "Administrar usuarios y permisos",
            action: () => navigate("/users"),
            color: "bg-green-500",
          },
        ]
      : []),
    ...(!isOperador
      ? [
          {
            icon: Settings,
            label: "Configuración del Sistema",
            description: "Configurar parámetros del sistema",
            action: () => navigate("/settings"),
            color: "bg-gray-500",
          },
        ]
      : []),
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header del Dashboard */}
          <div className="mb-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Panel de Control General
                </h1>
                <p className="text-gray-600">
                  Resumen del sistema de gestión de laboratorios - Monitoreo en
                  tiempo real
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg ">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  Sistema Operativo
                </span>
              </div>
            </div>
          </div>

          {/* Estadísticas Principales del Sistema */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
            <SummaryCard
              title="Laboratorios"
              value={systemStats.totalLabs}
              subtitle={`${systemStats.activeLabs} activos`}
              icon={Building2}
              iconColor="#059669"
            />

            <SummaryCard
              title="Sensores"
              value={systemStats.activeSensors}
              subtitle="monitoreando"
              icon={Thermometer}
              iconColor="#059669"
            />
            <SummaryCard
              title="Accionadores"
              value={systemStats.totalDevices}
              subtitle="conectados"
              icon={Cpu}
              iconColor="#059669"
            />
            <SummaryCard
              title="Alertas"
              value={alerts.length}
              subtitle="activas"
              icon={AlertTriangle}
              iconColor="#f59e0b"
            />
            <SummaryCard
              title="Usuarios"
              value={systemStats.totalUsers}
              subtitle="activos"
              icon={Users}
              iconColor="#059669"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
            {/* Columna Izquierda: Acciones y Actividad */}
            <div className="lg:col-span-2 space-y-6">
              {/* Acciones Rápidas */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Acciones Rápidas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-200 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md group cursor-pointer transform hover:-translate-y-1"
                    >
                      <div
                        className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}
                      >
                        <action.icon size={24} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm text-center mb-1">
                        {action.label}
                      </h3>
                      <p className="text-gray-500 text-xs text-center">
                        {action.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Columna Derecha: Alertas */}
            <div className="lg:col-span-1">
              <AlertsPanel alerts={alerts} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
