import {
  ChevronRight,
  Activity,
  Trash2,
  ShieldOff,
  Microscope,
  Wifi,
  Edit3,
} from "lucide-react";
import TemperatureControl from './deviceControl/TemperatureControl';
import HumidityControl from './deviceControl/HumidityControl';

import { useNavigate } from 'react-router-dom';


// NUEVAS PROPS BASADAS EN LOS REQUERIMIENTOS
interface LabCardProps {
  id: number;
  code?: string;
  name: string;
  activeSensors: number;
  associatedUsers: number;
  status: "activo" | "alerta" | "mantenimiento";
  automationStatus: "on" | "off";
  isZoneDisabled: boolean;
  sensors?: { id: string; type: string; name: string }[];
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function LabCard({
  id,
  code,
  name,
  activeSensors,
  status,
  isZoneDisabled,
  sensors = [],
  onDelete,
  onEdit,
}: LabCardProps) {
  const navigate = useNavigate();
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "activo":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          dot: "bg-emerald-400",
          border: "border-emerald-200",
        };
      case "alerta":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          dot: "bg-amber-400",
          border: "border-amber-200",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-600",
          dot: "bg-gray-400",
          border: "border-gray-200",
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };


  return (
    <div className="bg-white rounded-xl border border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 p-5 flex flex-col gap-5 group hover:border-gray-600 relative">

      {/* Botones de acción superiores */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
        {onEdit && (
          <button
            onClick={handleEdit}
            className="p-2 text-gray-400 hover:text-blue-600 bg-white rounded-full transition-colors duration-300 ring-1 ring-gray-100 hover:ring-blue-200"
            title="Editar laboratorio"
          >
            <Edit3 size={16} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-500 bg-white rounded-full transition-colors duration-300 ring-1 ring-gray-100 hover:ring-red-100"
            title="Eliminar laboratorio"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* --- Encabezado y Título --- */}
      <div className="flex items-start gap-4 pr-28">
        <div className={`w-12 h-12 ${statusConfig.bg} rounded-lg flex items-center justify-center border ${statusConfig.border}`}>
          <Microscope size={22} className={statusConfig.text} />
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {name}
          </h3>
          <p className="text-sm text-gray-500 font-medium mt-0.5">Código: {code || id}</p>
        </div>
      </div>

      {/* --- Panel de Estado y Habilitación --- */}
      <div className={`flex items-center justify-between p-3 rounded-lg border ${statusConfig.border} ${statusConfig.bg}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusConfig.dot} ${status === 'activo' ? 'animate-pulse' : ''}`}></div>
          <span className={`text-sm font-semibold uppercase ${statusConfig.text}`}>
            {status}
          </span>
        </div>

        {isZoneDisabled ? (
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-red-100 text-red-600 border border-red-200">
            <ShieldOff size={14} />
            <span className="text-xs font-semibold">INHABILITADO</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-emerald-500">
            <Wifi size={14} />
            <span className="text-xs font-semibold">Conectado</span>
          </div>
        )}
      </div>


      {/* --- Sensores Asignados --- */}
      {sensors && sensors.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {sensors.map((sensor) => (
            <div key={sensor.id} className="h-[140px] overflow-hidden rounded-lg border border-gray-100 bg-gray-50/50">
              <div className="w-[133%] transform scale-[0.75] origin-top-left">
                {sensor.type === 'temperature' ? <TemperatureControl /> : <HumidityControl />}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Botón de Acción --- */}
      <button
        onClick={() => navigate(`/laboratory/${id}`)}
        className="mt-1 w-full flex items-center justify-between p-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 border border-gray-300 rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-100 cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <Activity size={16} />
          <span>Controlar Laboratorio ({activeSensors} Sensores)</span>
        </span>
        <ChevronRight className="group-hover:translate-x-0.5 transition-transform duration-300 text-white" size={16} />
      </button>
    </div>
  );
}
