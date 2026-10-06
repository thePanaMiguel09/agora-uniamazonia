import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { Plus, Search, Users } from "lucide-react";
import type { User, UserRoleID, UserStatus } from "../types/index";
import UserCard from "../components/UserCard";
import UserModal from "../modals/UserModal";
import Footer from "../components/Footer";
import api from "../api/api";

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRoleID | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { user } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.fk_id_rol !== 1) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Filtros
  useEffect(() => {
    let result = users;

    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((user) => user.fk_id_rol === Number(roleFilter));
    }

    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, statusFilter]);

  // 3. Operaciones CRUD sincronizadas
  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers((prev) => prev.filter((user) => user.id_usuario !== userId));
        alert("Usuario eliminado correctamente");
      } catch (error) {
        alert("Error al eliminar el usuario");
      }
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    fetchUsers(); // Recargamos la lista para ver los cambios (creación o edición)
  };

  // 4. Estadísticas con los nuevos nombres
  const stats = {
    total: users.length,

    admins: users.filter((u) => u.fk_id_rol === 1).length,
    operators: users.filter((u) => u.fk_id_rol === 2).length,
    supervisors: users.filter((u) => u.fk_id_rol === 3).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600">
              Administra los usuarios y permisos de LabControl Pro
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={<Users className="text-indigo-600" />}
              label="Total Usuarios"
              value={stats.total}
              bgColor="bg-indigo-100"
            />
            {/* <StatCard icon={<Users className="text-green-600" />} label="Usuarios Activos" value={stats.active} bgColor="bg-green-100" />*/}
            <StatCard
              icon={<Users className="text-red-600" />}
              label="Administradores"
              value={stats.admins}
              bgColor="bg-red-100"
            />
            <StatCard
              icon={<Users className="text-blue-600" />}
              label="Supervisores"
              value={stats.supervisors}
              bgColor="bg-blue-100"
            />
            <StatCard
              icon={<Users className="text-green-600" />}
              label="Operadores"
              value={stats.operators}
              bgColor="bg-green-100"
            />
          </div>

          {/* Controls / Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 justify-between">
              <div className="relative flex-1 lg:max-w-md">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar por nombre, usuario o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Todos los |</option>
                  <option value="1">Administrador</option>
                  <option value="2">Operador</option>
                  <option value="3">Supervisor</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all"
                >
                  <Plus size={20} />
                  Nuevo Usuario
                </button>
              </div>
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id_usuario}
                user={user}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No hay coincidencias
              </h3>
              <p className="text-gray-500">
                Prueba cambiando los filtros de búsqueda
              </p>
            </div>
          )}

          {/* Modal */}
          <UserModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            user={editingUser}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Componente auxiliar para las tarjetas de estadísticas
function StatCard({ icon, label, value, bgColor }: any) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
