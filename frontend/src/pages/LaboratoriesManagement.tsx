// components/LaboratoriesManagement.tsx
import { useState, useEffect } from 'react';
import { Plus, Search, Building2, Users, Edit3, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import LabCard from '../components/LabCard';
import CreateLabModal from '../modals/CreateLabModal';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAppContext } from '../context/AppContext';

interface Laboratory {
    id: number;
    code: string;
    name: string;
    description: string;
    status: 'active' | 'maintenance' | 'inactive';
    associatedUsers: number;
    createdAt: string;
    automationStatus: 'on' | 'off';
    isZoneDisabled: boolean;
    activeSensors: number;
    devices: number;
    sensors?: { id: string; type: string; name: string }[];
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-800 border-green-200';
        case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const getStatusText = (status: string) => {
    switch (status) {
        case 'active': return 'Activo';
        case 'maintenance': return 'Mantenimiento';
        case 'inactive': return 'Inactivo';
        default: return 'Desconocido';
    }
};

export default function LaboratoriesManagement() {
    const { user } = useAppContext();
    const navigate = useNavigate();
    const isAdmin = user?.fk_id_rol === 1;
    const isOperador = user?.fk_id_rol === 2;
    const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
    const [filteredLabs, setFilteredLabs] = useState<Laboratory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'maintenance' | 'inactive'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLab, setEditingLab] = useState<Laboratory | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        if (isOperador) {
            navigate('/dashboard');
        }
    }, [isOperador, navigate]);

    useEffect(() => {
        // Cargar laboratorios desde API
        const fetchLaboratories = async () => {
            try {
                const response = await api.get('/getLaboratorios');
                setLaboratories(response.data);
            } catch (error) {
                console.error('Error al cargar laboratorios:', error);
                setLaboratories([]);
            }
        };
        fetchLaboratories();
    }, []);

    // Filtros (HU-09)
    useEffect(() => {
        let result = laboratories;

        if (searchTerm) {
            result = result.filter(lab =>
                lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lab.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lab.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(lab => lab.status === statusFilter);
        }

        setFilteredLabs(result);
    }, [laboratories, searchTerm, statusFilter]);

    // Crear laboratorio (HU-06)
    const handleCreateLab = async (labData: { name: string; description: string; status: 'active' | 'maintenance' | 'inactive'; sensors?: any[] }) => {
        try {
            const response = await api.post('createLaboratorio', labData);
            // La API actualmente no maneja los sensores del lado del servidor en createLaboratorio,
            // pero podemos agregarlos al estado local para visualizarlos
            const newLab = { ...response.data.laboratorio, sensors: labData.sensors || [] };
            setLaboratories(prev => [...prev, newLab]);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error al crear laboratorio:', error);
            alert('Error al crear el laboratorio');
        }
    };

    // Editar laboratorio (HU-07)
    const handleUpdateLab = async (labData: { name: string; description: string; status: 'active' | 'maintenance' | 'inactive'; sensors?: any[] }) => {
        if (!editingLab) return;
        try {
            await api.put(`updateLaboratorio/${editingLab.id}`, labData);
            const updatedLab: Laboratory = {
                ...editingLab,
                ...labData
            };
            setLaboratories(prev => prev.map(lab => lab.id === editingLab.id ? updatedLab : lab));
            setEditingLab(null);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error al actualizar laboratorio:', error);
            alert('Error al actualizar el laboratorio');
        }
    };

    // Eliminar laboratorio (HU-08)
    const handleDeleteLab = async (labId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este laboratorio?')) {
            try {
                await api.delete(`deleteLaboratorio/${labId}`);
                setLaboratories(prev => prev.filter(lab => lab.id !== labId));
            } catch (error) {
                console.error('Error al eliminar laboratorio:', error);
                alert('Error al eliminar el laboratorio');
            }
        }
    };



    const handleEditLab = (lab: Laboratory) => {
        setEditingLab(lab);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLab(null);
    };

    const handleSaveLab = async (labData: { name: string; description: string; status: 'active' | 'maintenance' | 'inactive'; sensors?: any[] }) => {
        if (editingLab) {
            await handleUpdateLab(labData);
        } else {
            await handleCreateLab(labData);
        }
    };


    const stats = {
        total: laboratories.length,
        active: laboratories.filter(l => l.status === 'active').length,
        automated: laboratories.filter(l => l.automationStatus === 'on').length,
        totalSensors: laboratories.reduce((sum, lab) => sum + lab.activeSensors, 0),
        totalUsers: laboratories.filter(l => l.associatedUsers > 0).length
    };

    const statCards = [
        { label: 'Total Laboratorios', value: stats.total, icon: Building2, bgClass: 'bg-blue-100', textClass: 'text-blue-600' },
        { label: 'Activos', value: stats.active, icon: Building2, bgClass: 'bg-green-100', textClass: 'text-green-600' },
        { label: 'Usuarios', value: stats.totalUsers, icon: Users, bgClass: 'bg-indigo-100', textClass: 'text-indigo-600' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div >
                <div className="max-w-7xl mx-auto p-6">
                    {/* Header */}
                    <div className="mb-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h1 className="text-3xl font-bold text-gray-900">Gestión Global de los Laboratorios</h1>
                            {isAdmin && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
                                >
                                    <Plus size={20} />
                                    Nuevo Laboratorio
                                </button>
                            )}
                        </div>
                        <p className="text-gray-600">Administra los laboratorios y su configuración</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {statCards.map((stat, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-3 hover:shadow-md transition-shadow">
                                <div className={`w-10 h-10 ${stat.bgClass} rounded-lg flex items-center justify-center shrink-0`}>
                                    <stat.icon className={stat.textClass} size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-500 truncate">{stat.label}</p>
                                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                            {/* Search */}
                            <div className="relative flex-1 w-full lg:max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar laboratorios por código, nombre o descripción..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            {/* Filters and View Controls */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                <div className="flex gap-2">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as any)}
                                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    >
                                        <option value="all">Todos los estados</option>
                                        <option value="active">Activo</option>
                                        <option value="maintenance">Mantenimiento</option>
                                        <option value="inactive">Inactivo</option>
                                    </select>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-3 border rounded-lg transition-all duration-200 ${viewMode === 'grid'
                                            ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Grid
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-3 border rounded-lg transition-all duration-200 ${viewMode === 'list'
                                            ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Lista
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Laboratories Grid/List */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                            {filteredLabs.map(lab => (
                                <LabCard
                                    key={lab.id}
                                    id={lab.id}
                                    code={lab.code}
                                    name={lab.name}
                                    activeSensors={lab.activeSensors}
                                    associatedUsers={lab.associatedUsers}
                                    status={lab.status === 'active' ? 'activo' : lab.status === 'maintenance' ? 'mantenimiento' : 'mantenimiento'}
                                    automationStatus={lab.automationStatus}
                                    isZoneDisabled={lab.isZoneDisabled}
                                    sensors={lab.sensors || []}
                                    onEdit={() => handleEditLab(lab)}
                                    onDelete={isAdmin ? () => handleDeleteLab(lab.id) : undefined}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Laboratorio</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Estado</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Usuarios</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredLabs.map(lab => (
                                        <LabTableRow
                                            key={lab.id}
                                            lab={lab}
                                            onEdit={handleEditLab}
                                            onDelete={handleDeleteLab}
                                            isAdmin={isAdmin}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Empty State */}
                    {filteredLabs.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron laboratorios</h3>
                            <p className="text-gray-500 mb-4">Intenta ajustar los filtros de búsqueda o crear un nuevo laboratorio</p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                }}
                                className="text-emerald-600 hover:text-emerald-700 font-medium mr-4"
                            >
                                Limpiar filtros
                            </button>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                                Crear primer laboratorio
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal para crear laboratorio */}
            <CreateLabModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveLab}
                editingLab={editingLab ? {
                    name: editingLab.name,
                    description: editingLab.description,
                    status: editingLab.status,
                    sensors: editingLab.sensors
                } : null}
            />
        </div>
    );
}

// Componente Fila para vista lista (inline, específico de esta página)
function LabTableRow({ lab, onEdit, onDelete, isAdmin }: {
    lab: Laboratory;
    onEdit: (lab: Laboratory) => void;
    onDelete: (id: number) => void;
    isAdmin?: boolean;
}) {
    const navigate = useNavigate();

    return (
        <tr className="hover:bg-gray-50 transition-colors duration-200">
            <td
                className="px-6 py-4 cursor-pointer"
                onClick={() => navigate(`/laboratory/${lab.id}`)}

            >

                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Building2 size={18} className="text-emerald-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                                {lab.name}
                            </h4>
                            <p className="text-sm text-gray-500">{lab.code}</p>
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lab.status)}`}>
                    {getStatusText(lab.status)}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span className="font-medium">{lab.associatedUsers}</span>
                    <span className="text-sm text-gray-500">usuarios</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(lab)}
                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Editar"
                    >
                        <Edit3 size={16} />
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => onDelete(lab.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Eliminar"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}