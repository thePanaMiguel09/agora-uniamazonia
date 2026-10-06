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
          bg: "bg-blue-50",
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
      className="bg-white rounded-xl border border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 p-5 flex flex-col gap-5 group hover:border-gray-600 relative cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
        {onEdit && (
          <button
            onClick={handleEdit}
            className="p-2 text-gray-400 hover:text-blue-600 bg-white rounded-full transition-colors duration-300 ring-1 ring-gray-100 hover:ring-blue-200"
            title="Editar proyecto"
          >
            <Edit3 size={16} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-500 bg-white rounded-full transition-colors duration-300 ring-1 ring-gray-100 hover:ring-red-100"
            title="Eliminar proyecto"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="flex items-start gap-4 pr-28">
        <div className={`w-12 h-12 ${statusConfig.bg} rounded-lg flex items-center justify-center border ${statusConfig.border}`}>
          <LayoutGrid size={22} className={statusConfig.text} />
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

      <button
        onClick={handleViewDetails}
        className="mt-1 w-full flex items-center justify-center p-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border border-gray-300 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-100 cursor-pointer animate-none"
      >
        <span className="flex justify-center gap-2">
          <Eye size={16} />
          <span>Ver detalles</span>
        </span>
      </button>
    </motion.div>
  );
};

export default ProjectCard;
