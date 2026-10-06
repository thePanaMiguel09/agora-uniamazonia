import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { User } from '../types/index';
import api from '../api/api';

interface Rol {
    id_rol: number;
    nombre_rol: string;
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null; // Si viene un usuario, estamos en modo "Editar"
}

export default function UserModal({ isOpen, onClose, user }: UserModalProps) {
    const initialState = {
        nombre_completo: '',
        username: '',
        password: '',
        email: '',
        fk_id_rol: '2', // Por defecto Operador (ID 2)
        estado: 'activo'
    };

    const [formData, setFormData] = useState(initialState);
    const [roles, setRoles] = useState<Rol[]>([]);
    const userLogged = JSON.parse(localStorage.getItem('user') || '{}'); // Obtenemos el usuario logueado
    const isAdmin = userLogged.fk_id_rol === 1;

    // Cargar roles desde la BD
    useEffect(() => {
        if (isOpen) {
            api.get('/roles')
                .then(res => setRoles(res.data))
                .catch(err => console.error('Error al cargar roles:', err));
        }
    }, [isOpen]);

    // Sincronizar el formulario cuando se abre el modal o cambia el usuario
    useEffect(() => {
        if (user) {
            setFormData({
                nombre_completo: user.nombre_completo || '',
                username: user.username,
                password: '', // Por seguridad no cargamos la contraseña vieja
                email: user.email,
                fk_id_rol: String(user.fk_id_rol),
                estado: user.estado || 'activo',
            });
        } else {
            setFormData(initialState);
        }
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Preparamos el cuerpo del JSON para el backend
            const payload = {
                ...formData,
                fk_id_rol: Number(formData.fk_id_rol), // Convertimos a número para la DB
            };

            if (user) {
                // Lógica de Actualización (PUT)
                console.log("Editando usuario con ID:", user.id_usuario);
                console.log("URL final:", `/users/${user.id_usuario}`);
                await api.put(`/users/${user.id_usuario}`, payload);
                alert('Usuario actualizado correctamente');
            } else {
                // Lógica de Creación (POST)
                await api.post('/register', payload);
                alert('Usuario creado correctamente');
            }

            setFormData(initialState);
            onClose();
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Error en el servidor';
            alert('Error: ' + msg);
            console.error(error);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800">
                        {user ? 'Editar Usuario' : 'Nuevo Registro'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Nombre Completo */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            value={formData.nombre_completo}
                            onChange={(e) => handleChange('nombre_completo', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Usuario</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => handleChange('username', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {user ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            required={!user}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Rol - Dinámico desde BD */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Rol</label>
                            <select
                                value={formData.fk_id_rol}
                                onChange={(e) => handleChange('fk_id_rol', e.target.value)}
                                disabled={!isAdmin}
                                className="w-full p-3 border border-gray-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {roles.length > 0 ? (
                                    roles.map((rol) => (
                                        <option key={rol.id_rol} value={rol.id_rol}>
                                            {rol.nombre_rol}
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <option value="1">Administrador</option>
                                        <option value="2">Operador</option>
                                        <option value="3">Supervisor</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                            <select
                                value={formData.estado}
                                onChange={(e) => handleChange('estado', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all"
                        >
                            {user ? 'Guardar Cambios' : 'Registrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}