import { Edit2, Trash2, Mail, Calendar } from 'lucide-react';
import type { User as UserType } from '../types/index';

interface UserCardProps {
  user: UserType;
  onEdit: (user: UserType) => void;
  onDelete: (userId: number) => void;
}

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {

  // Mapeo para mostrar nombres amigables según el ID de rol
  const getRoleLabel = (roleId: number) => {
    switch (roleId) {
      case 1: return 'Administrador';
      case 2: return 'Operador';
      case 3: return 'Supervisor';
      default: return 'Usuario';
    }
  };

  const getRoleConfig = (roleId: number) => {
    switch (roleId) {
      case 1: return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      case 3: return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' };
      case 2:
      default: return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
    }
  };

  const roleConfig = getRoleConfig(user.fk_id_rol);
 

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{user.username}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${roleConfig.bg} ${roleConfig.text} ${roleConfig.border}`}>
                {getRoleLabel(user.fk_id_rol)}
              </div>
              <div className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${user.estado === 'activo' ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(user)}
            className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(user.id_usuario)} // Usamos id_usuario
            className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Mail size={16} className="text-gray-400" />
          <span>{user.email}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Calendar size={16} className="text-gray-400" />
          <span>Creado: {user.creado_en ? formatDate(user.creado_en) : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}