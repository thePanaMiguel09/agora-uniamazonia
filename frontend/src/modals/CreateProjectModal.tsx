import { useState, useEffect } from 'react';
import { X, LayoutGrid, Tag, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlacedSensor {
    id: string;
    type: string;
    name: string;
}

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (projectData: { nombre: string; descripcion: string; sensors: PlacedSensor[] }) => void;
    editingProject?: { id: number; nombre: string; descripcion: string; sensors?: PlacedSensor[] } | null;
}

export default function CreateProjectModal({ isOpen, onClose, onSave, editingProject }: CreateProjectModalProps) {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',

    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [, setIsPanelOpen] = useState(false);
    const [placedSensors, setPlacedSensors] = useState<PlacedSensor[]>([]);

    useEffect(() => {
        if (isOpen) {
            if (editingProject) {
                setFormData({
                    nombre: editingProject.nombre,
                    descripcion: editingProject.descripcion,
                });
                setPlacedSensors(editingProject.sensors || []);
            } else {
                setFormData({ nombre: '', descripcion: '' });
                setPlacedSensors([]);
            }
            setErrors({});
            setIsPanelOpen(false);
        }
    }, [isOpen, editingProject]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
        if (formData.nombre.trim().length > 100) newErrors.nombre = 'Máximo 100 caracteres';
        if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria';
        if (formData.descripcion.trim().length > 500) newErrors.descripcion = 'Máximo 500 caracteres';
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
            await onSave({ ...formData, sensors: placedSensors });
            setFormData({ nombre: '', descripcion: '' });
            setErrors({});
            setPlacedSensors([]);
            onClose();
        } catch (error: any) {
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
                        <motion.div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        />

                        <motion.div
                            className={`relative bg-white rounded-2xl shadow-2xl w-full ${editingProject ? 'max-w-md' : 'max-w-md'} mx-4 max-h-[90vh] overflow-hidden flex flex-col`}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <>
                                <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600" />

                                <div className="flex justify-between items-center px-5 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/25">
                                            <LayoutGrid size={18} className="text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold text-gray-900">
                                                {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                                            </h2>
                                            <p className="text-[11px] text-gray-500">
                                                {editingProject ? 'Modifica los datos del proyecto' : 'Registra un nuevo proyecto'}
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
                            </>

                            <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                            <form id="projectForm" onSubmit={handleSubmit} className="px-5 py-4 space-y-3 overflow-y-auto">
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                                        <Tag size={12} className="text-blue-500" />
                                        Nombre del Proyecto
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => handleChange('nombre', e.target.value)}
                                        placeholder="Ej: Proyecto Hidropónico"
                                        className={`w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white ${errors.nombre ? 'border-red-400 ring-1 ring-red-400 focus:ring-red-400/20' : 'border-gray-300'}`}
                                    />
                                    {errors.nombre && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
                                        >
                                            <span>âš </span> {errors.nombre}
                                        </motion.p>
                                    )}
                                </div>

                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                                        <FileText size={12} className="text-blue-500" />
                                        Descripción
                                    </label>
                                    <textarea
                                        value={formData.descripcion}
                                        onChange={(e) => handleChange('descripcion', e.target.value)}
                                        placeholder="Describe el propósito del proyecto..."
                                        rows={2}
                                        className={`w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 resize-none bg-gray-50 hover:bg-white focus:bg-white ${errors.descripcion ? 'border-red-400 ring-1 ring-red-400 focus:ring-red-400/20' : 'border-gray-300'}`}
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        {errors.descripcion ? (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-red-500 text-xs flex items-center gap-1"
                                            >
                                                <span>âš </span> {errors.descripcion}
                                            </motion.p>
                                        ) : <span />}
                                        <span className={`text-xs ${formData.descripcion.length > 450 ? 'text-amber-500' : 'text-gray-400'}`}>
                                            {formData.descripcion.length}/500
                                        </span>
                                    </div>
                                </div>


                            </form>

                            <div className="px-5 pb-4 bg-white flex-shrink-0">

                                <div className="flex gap-3">
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
                                        form="projectForm"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Guardando...
                                            </>
                                        ) : (
                                            editingProject ? 'Guardar Cambios' : 'Crear Proyecto'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </>
    );
}
