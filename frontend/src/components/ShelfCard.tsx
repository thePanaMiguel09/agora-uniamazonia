import { motion } from 'framer-motion';
import { Edit3, Trash2, Layers } from "lucide-react";
import LightControl from './deviceControl/LightControl';
import { useHomeAssistant } from '../hooks/useHomeAssistant';

interface SensorItem {
  id: string;
  type: string;
  name: string;
  entityId?: string;
  haState?: string;
}

interface ShelfCardProps {
  nombre: string;
  status: "active" | "maintenance" | "inactive";
  sensors?: SensorItem[];
  onDelete?: () => void;
  onEdit?: () => void;
  onAddDevice?: (type: string, name: string) => void;
  onDeleteDevice?: (deviceId: string) => void;
}

const ShelfCard = ({
  nombre,
  status,
  sensors = [],
  onDelete,
  onEdit,
  onAddDevice,
  onDeleteDevice,
}: ShelfCardProps) => {
  const { haStates, sendHACommand } = useHomeAssistant();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { bg: "bg-slate-50", text: "text-slate-700", dot: "bg-slate-400", border: "border-slate-200" };
      case "maintenance":
        return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "border-amber-200" };
      case "inactive":
      default:
        return { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400", border: "border-gray-200" };
    }
  };

  const statusConfig = getStatusConfig(status);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDelete) onDelete();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onEdit) onEdit();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    try {
      const componentData = JSON.parse(data);
      if (onAddDevice) {
        onAddDevice(componentData.type, componentData.name);
      }
    } catch (error) {
      console.error('Error al procesar componente:', error);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 p-5 flex flex-col gap-5 group hover:border-gray-600 relative cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Botones de acción superiores */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
        {onEdit && (
          <button
            onClick={handleEdit}
            className="p-2 text-gray-400 hover:text-gray-900 bg-white rounded-full transition-colors duration-300 ring-1 ring-gray-100 hover:ring-gray-200"
            title="Editar estantería"
          >
            <Edit3 size={16} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-500 bg-white rounded-full transition-colors duration-300 ring-1 ring-gray-100 hover:ring-red-100"
            title="Eliminar estantería"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="flex items-start gap-4 pr-28">
        <div className={`w-12 h-12 ${statusConfig.bg} rounded-lg flex items-center justify-center border ${statusConfig.border}`}>
          <Layers size={22} className={statusConfig.text} />
        </div>

        <div className="min-w-0">
          <h3 className="text-xl font-bold text-gray-900 leading-tight break-words">
            {nombre}
          </h3>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            Zona de Actuadores de luz
          </p>
        </div>
      </div>

      {/* --- Sensores y Actuadores Asignados --- */}
      {sensors && sensors.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {sensors.map((sensor) => (
            <div key={sensor.id} className="group/sensor h-[165px] relative overflow-hidden rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:border-red-200 transition-colors">
              {/* Botón de eliminar dispositivo */}
              {onDeleteDevice && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDevice(sensor.id);
                  }}
                  className="absolute top-2 right-2 z-50 bg-red-500 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover/sensor:opacity-100 transition-all duration-200"
                  title="Eliminar dispositivo"
                >
                  <span className="text-xs font-bold">✕</span>
                </button>
              )}

              <div className="absolute top-0 left-0 w-[115%] transform scale-[0.85] origin-top-left -ml-1 -mt-1">
                {sensor.type === 'light' ? (
                  <LightControl entityId={`light.${sensor.name}`} haStates={haStates} onToggle={sendHACommand} />
                ) : sensor.type === 'valve' ? (
                  <div className="p-4 bg-white rounded-xl shadow-sm text-center border border-gray-100 flex flex-col items-center justify-center h-full">
                    <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>
                    </div>
                    <span className="font-semibold text-gray-700">{sensor.name}</span>
                    <span className="text-xs text-gray-500">Válvula de Riego</span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ShelfCard;