import { useState, useEffect } from 'react';
import { X, FlaskConical, Tag, FileText, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ComponentPanel from '../components/ComponentPanel';


interface PlacedSensor {
    id: string;
    type: string;
    name: string;
}

interface CreateLabModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (labData: { name: string; description: string; status: 'active' | 'maintenance' | 'inactive'; sensors: PlacedSensor[] }) => void;
    editingLab?: { name: string; description: string; status: 'active' | 'maintenance' | 'inactive'; sensors?: PlacedSensor[] } | null;
}

export default function CreateLabModal({ isOpen, onClose, onSave, editingLab }: CreateLabModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active' as 'active' | 'maintenance' | 'inactive',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [placedSensors, setPlacedSensors] = useState<PlacedSensor[]>([]);

    // Reset form when modal opens/closes or editingLab changes
    useEffect(() => {
        if (isOpen) {
            if (editingLab) {
                setFormData({
                    name: editingLab.name,
                    description: editingLab.description,
                    status: editingLab.status,
                });
                setPlacedSensors(editingLab.sensors || []);
            } else {
                setFormData({ name: '', description: '', status: 'active' });
                setPlacedSensors([]);
            }
            setErrors({});
            setIsPanelOpen(false);
        }
    }, [isOpen, editingLab]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
        if (formData.name.trim().length > 100) newErrors.name = 'Máximo 100 caracteres';
        if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
        if (formData.description.trim().length > 500) newErrors.description = 'Máximo 500 caracteres';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpiar error del campo al escribir
        if (errors[field]) {
            setErrors(prev => {
                const copy = { ...prev };
                delete copy[field];
                return copy;
            });
        }
    };

    const handleAddSensor = (component: any) => {
        const newSensor: PlacedSensor = {
            id: `${component.type}-${Date.now()}`,
            type: component.type,
            name: component.name,
        };
        setPlacedSensors(prev => [...prev, newSensor]);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSave({ ...formData, sensors: placedSensors });
            // Reset form
            setFormData({ name: '', description: '', status: 'active' });
            setErrors({});
            setPlacedSensors([]);
            onClose();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al guardar el laboratorio';
            alert(msg);
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <>
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
                            className={`relative bg-white rounded-2xl shadow-2xl w-full ${editingLab ? 'max-w-md' : 'max-w-md'} mx-4 max-h-[90vh] overflow-hidden flex flex-col`}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Línea decorativa superior con gradiente */}
                            <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600" />

                            {/* Header */}
                            <div className="flex justify-between items-center px-5 py-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/25">
                                        <FlaskConical size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900">
                                            {editingLab ? 'Editar Laboratorio' : 'Nuevo Laboratorio'}
                                        </h2>
                                        <p className="text-[11px] text-gray-500">
                                            {editingLab ? 'Modifica los datos del laboratorio' : 'Registra un nuevo laboratorio'}
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

                            {/* Divider sutil */}
                            <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3 overflow-y-auto">
                                {/* Nombre del Laboratorio */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                                        <Tag size={12} className="text-emerald-600" />
                                        Nombre del Laboratorio
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="Ej: Laboratorio de Física Avanzada"
                                        className={`w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white ${errors.name ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.name && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
                                        >
                                            <span>⚠</span> {errors.name}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                                        <FileText size={12} className="text-emerald-600" />
                                        Descripción
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        placeholder="Describe brevemente el propósito del laboratorio..."
                                        rows={2}
                                        className={`w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 resize-none bg-gray-50 hover:bg-white focus:bg-white ${errors.description ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'
                                            }`}
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        {errors.description ? (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-red-500 text-xs flex items-center gap-1"
                                            >
                                                <span>⚠</span> {errors.description}
                                            </motion.p>
                                        ) : <span />}
                                        <span className={`text-xs ${formData.description.length > 450 ? 'text-amber-500' : 'text-gray-400'}`}>
                                            {formData.description.length}/500
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
                                            { value: 'active', label: 'Activo', icon: '🟢', color: 'emerald' },
                                            { value: 'maintenance', label: 'Mantenimiento', icon: '🟡', color: 'amber' },
                                            { value: 'inactive', label: 'Inactivo', icon: '🔴', color: 'red' },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => handleChange('status', option.value as 'active' | 'maintenance' | 'inactive')}
                                                className={`relative p-2 rounded-lg border-2 transition-all duration-200 text-center ${formData.status === option.value
                                                    ? option.color === 'emerald'
                                                        ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/10'
                                                        : option.color === 'amber'
                                                            ? 'border-amber-500 bg-amber-50 shadow-md shadow-amber-500/10'
                                                            : 'border-red-500 bg-red-50 shadow-md shadow-red-500/10'
                                                    : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
                                                    }`}
                                            >
                                                <span className="text-sm block">{option.icon}</span>
                                                <span className={`text-[11px] font-semibold ${formData.status === option.value ? 'text-gray-800' : 'text-gray-500'
                                                    }`}>
                                                    {option.label}
                                                </span>
                                                {formData.status === option.value && (
                                                    <motion.div
                                                        layoutId="estadoIndicator"
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
                                                {editingLab ? 'Actualizando...' : 'Creando...'}
                                            </>
                                        ) : (
                                            editingLab ? 'Actualizar Laboratorio' : 'Crear Laboratorio'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Panel de Componentes (solo temperatura y humedad) */}
            <ComponentPanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                onAddComponent={handleAddSensor}
                allowedTypes={['temperature', 'humidity']}
            />
        </>
    );
}

