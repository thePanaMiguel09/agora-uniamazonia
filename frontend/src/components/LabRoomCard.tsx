import {
  Eye,
  Trash2,
  DoorOpen,
  Edit3,
} from "lucide-react";
import TemperatureControl from './deviceControl/TemperatureControl';
import HumidityControl from './deviceControl/HumidityControl';
import { useNavigate } from 'react-router-dom';

interface LabRoomCardProps {
  id: number;
  nombre: string;
  descripcion: string;
  status?: "activo" | "alerta" | "mantenimiento" | "inactivo";
  sensors?: { id: string; type: string; name: string }[];
  onDelete?: () => void;
  onEdit?: () => void;
  onClick?: () => void;
}

export default function LabRoomCard({
  id,
  nombre,
  descripcion,
  status = "activo",
  sensors = [],
  onDelete,
  onEdit,
  onClick,
}: LabRoomCardProps) {
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
      case "inactivo":
      case "mantenimiento":
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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/projects/${id}`, {
      state: { nombre, descripcion }
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 p-5 flex flex-col gap-5 group hover:border-gray-600 relative"
    >
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
        {onEdit && (
          <button
            onClick={handleEdit}
            className="p-2 text-gray-400 hover:text-blue-600 bg-white rounded-full transition-colors duration-300 ring-1 ring-gray-100 hover:ring-blue-200"
            title="Editar modulo"
          >
            <Edit3 size={16} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-500 bg-white rounded-full transition-colors duration-300 ring-1 ring-gray-100 hover:ring-red-100"
            title="Eliminar modulo"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="flex items-start gap-4 pr-28">
        <div className={`w-12 h-12 ${statusConfig.bg} rounded-lg flex items-center justify-center border ${statusConfig.border}`}>
          <DoorOpen size={22} className={statusConfig.text} />
        </div>

        <div className="min-w-0">
          <h3 className="text-xl font-bold text-gray-900 leading-tight break-words">
            {nombre}
          </h3>
          <p className="text-sm text-gray-500 font-medium mt-0.5 line-clamp-2 break-words">
            {descripcion}
          </p>
        </div>
      </div>

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

      <button
        onClick={handleViewDetails}
        className="mt-1 w-full flex items-center justify-center p-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 border border-gray-300 rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-100 cursor-pointer"
      >
        <span className="flex justify-center gap-2">
          <Eye size={16} />
          <span>Ver detalles</span>
        </span>
      </button>
    </div>
  );
}
