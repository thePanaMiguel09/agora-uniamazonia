import { useState } from 'react';
import { X, Cpu, Tag, FileText, Activity, Wind, Lightbulb, Camera, Droplets, Thermometer, Beaker } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateSensorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: (sensor: SensorFormData) => void;
    preselectedType?: string;
}

export interface SensorFormData {
    id: string;
    nombre: string;
    descripcion: string;
    tipo: string;
    estado: 'activo' | 'inactivo' | 'mantenimiento';
    ubicacion: string;
    valor?: number | string;
    unidad?: string;
    deviceName?: string;
    entityId?: string;
}

const sensorTypes = [
    {
        type: 'air-conditioner',
        name: 'Aire Acondicionado',
        description: 'Control de temperatura y ventilación',
        icon: Wind,
        color: 'from-cyan-500 to-blue-600',
        bgLight: 'bg-cyan-50',
        borderActive: 'border-cyan-500',
        shadowActive: 'shadow-cyan-500/10',
    },
    {
        type: 'light',
        name: 'Control de Luces',
        description: 'Encender/apagar iluminación',
        icon: Lightbulb,
        color: 'from-yellow-400 to-amber-500',
        bgLight: 'bg-yellow-50',
        borderActive: 'border-yellow-500',
        shadowActive: 'shadow-yellow-500/10',
    },
    {
        type: 'camera',
        name: 'Cámara de Seguridad',
        description: 'Vista en vivo del laboratorio',
        icon: Camera,
        color: 'from-emerald-500 to-green-600',
        bgLight: 'bg-emerald-50',
        borderActive: 'border-emerald-500',
        shadowActive: 'shadow-emerald-500/10',
    },
    {
        type: 'valve',
        name: 'Válvula de Agua',
        description: 'Control del sistema hidráulico',
        icon: Droplets,
        color: 'from-blue-500 to-indigo-600',
        bgLight: 'bg-blue-50',
        borderActive: 'border-blue-500',
        shadowActive: 'shadow-blue-500/10',
    },
    {
        type: 'temperature',
        name: 'Sensor de Temperatura',
        description: 'Monitoreo de temperatura ambiental',
        icon: Thermometer,
        color: 'from-orange-500 to-red-500',
        bgLight: 'bg-red-50',
        borderActive: 'border-red-500',
        shadowActive: 'shadow-red-500/10',
    },
    {
        type: 'humidity',
        name: 'Sensor de Humedad',
        description: 'Monitoreo de humedad ambiental',
        icon: Droplets,
        color: 'from-indigo-500 to-purple-600',
        bgLight: 'bg-indigo-50',
        borderActive: 'border-indigo-500',
        shadowActive: 'shadow-indigo-500/10',
    },
    {
        type: 'ph',
        name: 'Sensor de pH',
        description: 'Monitoreo de acidez/alcalinidad del agua',
        icon: Beaker,
        color: 'from-blue-600 to-cyan-600',
        bgLight: 'bg-blue-50',
        borderActive: 'border-blue-500',
        shadowActive: 'shadow-blue-500/10',
    },
];

export default function CreateSensorModal({ isOpen, onClose, onCreated, preselectedType }: CreateSensorModalProps) {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo: preselectedType || '',
        estado: 'activo',
        ubicacion: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre interno es obligatorio';
        if (formData.nombre.trim().length > 80) newErrors.nombre = 'Máximo 80 caracteres';
        if (!formData.tipo) newErrors.tipo = 'Selecciona un tipo de sensor';
        if (!formData.ubicacion.trim()) newErrors.ubicacion = 'La ubicación es obligatoria';
        if (formData.descripcion.trim().length > 300) newErrors.descripcion = 'Máximo 300 caracteres';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const copy = { ...prev };
                delete copy[field];
                return copy;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            const newSensor: SensorFormData = {
                id: `sensor-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                nombre: formData.nombre.trim(),
                descripcion: formData.descripcion.trim(),
                tipo: formData.tipo,
                estado: formData.estado as 'activo' | 'inactivo' | 'mantenimiento',
                ubicacion: formData.ubicacion.trim(),
            };

            onCreated?.(newSensor);
            setFormData({ nombre: '', descripcion: '', tipo: preselectedType || '', estado: 'activo', ubicacion: '' });
            setErrors({});
            onClose();
        } catch (error) {
            console.error('Error al crear sensor:', error);
            alert('Error al crear el sensor');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const selectedSensorType = sensorTypes.find(s => s.type === formData.tipo);

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    onClick={handleOverlayClick}
                >
                    {/* Overlay */}
                    <motion.div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />

                    {/* Modal Card */}
                    <motion.div
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Línea decorativa superior */}
                        <div className={`h-1 bg-gradient-to-r ${selectedSensorType ? selectedSensorType.color : 'from-emerald-500 via-green-400 to-emerald-600'}`} />

                        {/* Header */}
                        <div className="flex justify-between items-center px-5 py-3">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-9 h-9 bg-gradient-to-br ${selectedSensorType ? selectedSensorType.color : 'from-emerald-500 to-green-600'} rounded-lg flex items-center justify-center shadow-md transition-all duration-300`}>
                                    {selectedSensorType ? (
                                        <selectedSensorType.icon size={18} className="text-white" />
                                    ) : (
                                        <Cpu size={18} className="text-white" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">
                                        Nuevo Sensor
                                    </h2>
                                    <p className="text-[11px] text-gray-500">
                                        Duplica y configura un nuevo dispositivo
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3 overflow-y-auto">
                            {/* Tipo de Sensor */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
                                    <Cpu size={12} className="text-emerald-600" />
                                    Tipo de Sensor
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {sensorTypes.map((sensor) => {
                                        const isSelected = formData.tipo === sensor.type;
                                        return (
                                            <button
                                                key={sensor.type}
                                                type="button"
                                                onClick={() => handleChange('tipo', sensor.type)}
                                                className={`relative p-3 rounded-xl border-2 transition-all duration-200 text-left group ${isSelected
                                                    ? `${sensor.borderActive} ${sensor.bgLight} shadow-md ${sensor.shadowActive}`
                                                    : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${sensor.color} flex items-center justify-center transition-transform duration-200 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                                                        <sensor.icon size={16} className="text-white" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className={`text-xs font-bold leading-tight ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                                                            {sensor.name}
                                                        </h4>
                                                        <p className="text-[9px] text-gray-400 truncate leading-tight mt-0.5">
                                                            {sensor.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <motion.div
                                                        className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: 'spring', stiffness: 300 }}
                                                    >
                                                        <span className="text-white text-[8px]">✓</span>
                                                    </motion.div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.tipo && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
                                    >
                                        <span>⚠</span> {errors.tipo}
                                    </motion.p>
                                )}
                            </div>

                            {/* Nombre Interno */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                                    <Tag size={12} className="text-emerald-600" />
                                    Nombre Interno
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => handleChange('nombre', e.target.value)}
                                    placeholder="Ej: AC-Lab-Principal-01"
                                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white ${errors.nombre ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'
                                        }`}
                                />
                                {errors.nombre && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
                                    >
                                        <span>⚠</span> {errors.nombre}
                                    </motion.p>
                                )}
                            </div>

                            {/* Ubicación */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                                    <Activity size={12} className="text-emerald-600" />
                                    Ubicación
                                </label>
                                <input
                                    type="text"
                                    value={formData.ubicacion}
                                    onChange={(e) => handleChange('ubicacion', e.target.value)}
                                    placeholder="Ej: Laboratorio A - Módulo 3"
                                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white ${errors.ubicacion ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'
                                        }`}
                                />
                                {errors.ubicacion && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
                                    >
                                        <span>⚠</span> {errors.ubicacion}
                                    </motion.p>
                                )}
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                                    <FileText size={12} className="text-emerald-600" />
                                    Descripción <span className="text-gray-400 font-normal">(opcional)</span>
                                </label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => handleChange('descripcion', e.target.value)}
                                    placeholder="Notas adicionales sobre este sensor..."
                                    rows={2}
                                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 resize-none bg-gray-50 hover:bg-white focus:bg-white ${errors.descripcion ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'
                                        }`}
                                />
                                <div className="flex justify-end mt-0.5">
                                    <span className={`text-xs ${formData.descripcion.length > 250 ? 'text-amber-500' : 'text-gray-400'}`}>
                                        {formData.descripcion.length}/300
                                    </span>
                                </div>
                            </div>

                            {/* Estado */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                                    <Activity size={12} className="text-emerald-600" />
                                    Estado Inicial
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'activo', label: 'Activo', icon: '🟢', color: 'emerald' },
                                        { value: 'mantenimiento', label: 'Mant.', icon: '🟡', color: 'amber' },
                                        { value: 'inactivo', label: 'Inactivo', icon: '🔴', color: 'red' },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleChange('estado', option.value)}
                                            className={`relative p-2 rounded-lg border-2 transition-all duration-200 text-center ${formData.estado === option.value
                                                ? option.color === 'emerald'
                                                    ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/10'
                                                    : option.color === 'amber'
                                                        ? 'border-amber-500 bg-amber-50 shadow-md shadow-amber-500/10'
                                                        : 'border-red-500 bg-red-50 shadow-md shadow-red-500/10'
                                                : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
                                                }`}
                                        >
                                            <span className="text-sm block">{option.icon}</span>
                                            <span className={`text-[11px] font-semibold ${formData.estado === option.value ? 'text-gray-800' : 'text-gray-500'
                                                }`}>
                                                {option.label}
                                            </span>
                                            {formData.estado === option.value && (
                                                <motion.div
                                                    layoutId="sensorEstadoIndicator"
                                                    className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: 'spring', stiffness: 300 }}
                                                >
                                                    <span className="text-white text-[8px]">✓</span>
                                                </motion.div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl border border-gray-200 transition-all duration-200 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Creando...
                                        </>
                                    ) : (
                                        'Crear Sensor'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
