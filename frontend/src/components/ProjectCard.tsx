import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Edit3, Trash2, LayoutGrid, Eye } from "lucide-react";

interface ProjectCardProps {
  id: number;
  nombre: string;
  descripcion: string;
  status?: "activo" | "alerta" | "mantenimiento" | "inactivo";
  sensors?: { id: string; type: string; name: string }[];
  onDelete?: () => void;
  onEdit?: () => void;
  onClick?: () => void;
}

const ProjectCard = ({
  id,
  nombre,
  descripcion,
  status = "activo",
  onDelete,
  onEdit,
  onClick,
}: ProjectCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(`Navigating from ${nombre} to /stand`);
    navigate(`/stands/${id}`, { state: { nombre, descripcion, id } });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onEdit) onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDelete) onDelete();
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "activo":
        return {
          bg: "bg-emerald-50",
          text: "text-blue-700",
          dot: "bg-blue-400",
          border: "border-blue-200",
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

  return (
    <motion.div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 p-7 min-h-[240px] flex flex-col justify-between gap-6 group hover:border-emerald-600 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Estado para lectores de pantalla (no depender solo del color) */}
      <span className="sr-only">Estado del proyecto: {status}</span>
      <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
        {onEdit && (
          <button
            type="button"
            onClick={handleEdit}
            aria-label={`Editar proyecto ${nombre}`}
            className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-blue-600 bg-white rounded-full transition-colors duration-300 ring-1 ring-gray-100 hover:ring-blue-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            title="Editar proyecto"
          >
            <Edit3 size={20} aria-hidden="true" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            aria-label={`Eliminar proyecto ${nombre}`}
            className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-red-500 bg-white rounded-full transition-colors duration-300 ring-1 ring-gray-100 hover:ring-red-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            title="Eliminar proyecto"
          >
            <Trash2 size={20} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex items-start gap-5 pr-28">
        <div className={`w-16 h-16 shrink-0 ${statusConfig.bg} rounded-lg flex items-center justify-center border ${statusConfig.border}`}>
          <LayoutGrid size={28} className={statusConfig.text} aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <h3 className="text-2xl font-bold text-gray-900 leading-tight break-words">
            {nombre}
          </h3>
          <p className="text-base text-gray-600 font-medium mt-1.5 line-clamp-3 break-words">
            {descripcion}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleViewDetails}
        aria-label={`Ver detalles del proyecto ${nombre}`}
        className="w-full min-h-[56px] flex items-center justify-center px-4 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 border border-gray-300 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-100 cursor-pointer animate-none focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
      >
        <span className="flex justify-center items-center text-xl gap-3">
          <Eye size={26} aria-hidden="true" />
          <span>Ver detalles</span>
        </span>
      </button>
    </motion.div>
  );
};

export default ProjectCard;