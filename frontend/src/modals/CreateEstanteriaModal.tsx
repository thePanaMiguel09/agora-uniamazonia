import { useState, useEffect } from 'react';
import { X, Layers, Tag, Lightbulb, Trash2, Beaker } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ComponentPanel from '../components/ComponentPanel';
import LightControl from '../components/deviceControl/LightControl';
import { obtenerSwitchesHA } from '../api/api';

interface PlacedSensor {
    id: string;
    type: string;
    name: string;
    entityId?: string;
    haState?: string;
}

interface CreateEstanteriaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (estanteriaData: { nombre: string; descripcion: string; status: 'active' | 'maintenance' | 'inactive'; sensors: PlacedSensor[] }) => void;
    editingEstanteria?: { id: number; nombre: string; descripcion: string; status: 'active' | 'maintenance' | 'inactive'; sensors?: PlacedSensor[] } | null;
}

export default function CreateEstanteriaModal({ isOpen, onClose, onSave, editingEstanteria }: CreateEstanteriaModalProps) {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        status: 'active' as 'active' | 'maintenance' | 'inactive',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [placedSensors, setPlacedSensors] = useState<PlacedSensor[]>([]);
    const [haLights, setHaLights] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            if (editingEstanteria) {
                setFormData({
                    nombre: editingEstanteria.nombre,
                    descripcion: editingEstanteria.descripcion,
                    status: editingEstanteria.status,
                });
                setPlacedSensors(editingEstanteria.sensors || []);
            } else {
                setFormData({ nombre: '', descripcion: '', status: 'active' });
                setPlacedSensors([]);
            }
            setErrors({});
            setIsPanelOpen(false);

            // Cargar switches como luces
            const loadLights = async () => {
                try {
                    const switches = await obtenerSwitchesHA();
                    const formattedLights = switches.map((device: any) => ({
                        type: 'light',
                        name: device.nombre || device.entityId,
                        description: `Switch HA: ${device.entityId}`,
                        icon: Lightbulb,
                        color: 'bg-yellow-500',
                        entityId: device.entityId,
                        haState: device.estado,
                    }));
                    setHaLights(formattedLights);
                } catch (err) {
                    console.error("Error al cargar las luces:", err);
                }
            };
            loadLights();
        }
    }, [isOpen, editingEstanteria]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
        if (formData.nombre.trim().length > 100) newErrors.nombre = 'Máximo 100 caracteres';
        if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria';
        if (formData.descripcion.trim().length > 500) newErrors.descripcion = 'Máximo 500 caracteres';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
            entityId: component.entityId,
            haState: component.haState,
        };
        setPlacedSensors(prev => [...prev, newSensor]);
    };

    const handleRemoveSensor = (sensorId: string) => {
        setPlacedSensors(prev => prev.filter(s => s.id !== sensorId));
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
            if (componentData.type === 'light') {
                handleAddSensor(componentData);
            }
        } catch (error) {
            console.error('Error al procesar componente:', error);
        }
    };

    const renderSensorWidget = (sensor: PlacedSensor) => {
        switch (sensor.type) {
            case 'light':
                return <LightControl entityId={sensor.entityId} nombre={sensor.name} haState={sensor.haState} />;
            default:
                return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSave({ ...formData, sensors: placedSensors });
            setFormData({ nombre: '', descripcion: '', status: 'active' });
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
                            className={`relative bg-white rounded-2xl shadow-2xl w-full ${editingEstanteria ? 'max-w-md' : 'max-w-md'} mx-4 max-h-[90vh] overflow-hidden flex flex-col`}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <>
                                <div className="h-1 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900" />

                                <div className="flex justify-between items-center px-5 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center shadow-md shadow-gray-900/25">
                                            <Layers size={18} className="text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold text-gray-900">
                                                {editingEstanteria ? 'Editar Estantería' : 'Nueva Estantería'}
                                            </h2>
                                            <p className="text-[11px] text-gray-500">
                                                {editingEstanteria ? 'Modifica los datos de la estantería' : 'Registra una nueva estantería'}
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

                            <form id="shelfForm" onSubmit={handleSubmit} className="px-5 py-4 space-y-3 overflow-y-auto">
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                                        <Tag size={12} className="text-gray-600" />
                                        Nombre de la Estantería
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => handleChange('nombre', e.target.value)}
                                        placeholder="Ej: Estantería A-1"
                                        className={`w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 outline-none transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white ${errors.nombre ? 'border-red-400 ring-1 ring-red-400 focus:ring-red-400/20' : 'border-gray-300'}`}
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

                                {/* <div>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                                        <FileText size={12} className="text-gray-600" />
                                        Descripción
                                    </label>
                                    <textarea
                                        value={formData.descripcion}
                                        onChange={(e) => handleChange('descripcion', e.target.value)}
                                        placeholder="Describe el propósito de la estantería..."
                                        rows={2}
                                        className={`w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 outline-none transition-all duration-200 resize-none bg-gray-50 hover:bg-white focus:bg-white ${errors.descripcion ? 'border-red-400 ring-1 ring-red-400 focus:ring-red-400/20' : 'border-gray-300'}`}
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

                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                                        <Activity size={12} className="text-gray-600" />
                                        Estado Inicial
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { value: 'active', label: 'Activo', icon: '🟢', color: 'gray' },
                                            { value: 'maintenance', label: 'Mantenimiento', icon: '🟡', color: 'amber' },
                                            { value: 'inactive', label: 'Inactivo', icon: '🔴', color: 'red' },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => handleChange('status', option.value as 'active' | 'maintenance' | 'inactive')}
                                                className={`relative p-2 rounded-lg border-2 transition-all duration-200 text-center ${formData.status === option.value
                                                    ? option.color === 'gray'
                                                        ? 'border-gray-900 bg-gray-50 shadow-md shadow-gray-900/10'
                                                        : option.color === 'amber'
                                                            ? 'border-amber-500 bg-amber-50 shadow-md shadow-amber-500/10'
                                                            : 'border-red-500 bg-red-50 shadow-md shadow-red-500/10'
                                                    : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
                                                    }`}
                                            >
                                                <span className="text-sm block">{option.icon}</span>
                                                <span className={`text-[11px] font-semibold ${formData.status === option.value ? 'text-gray-900' : 'text-gray-500'}`}>
                                                    {option.label}
                                                </span>
                                                {formData.status === option.value && (
                                                    <motion.div
                                                        layoutId="estadoIndicatorShelf"
                                                        className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center"
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
                                </div> */}

                                {editingEstanteria && (
                                    <div className="mt-4 border-t border-gray-100 pt-4">
                                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
                                            <Lightbulb size={16} className="text-gray-900" />
                                            Componentes de Luz
                                        </h3>
                                        <p className="text-xs text-gray-500 mb-3">
                                            Arrastra el sensor de luz desde el panel o haz clic para añadir
                                        </p>

                                        <div
                                            className={`border-2 border-dashed rounded-xl p-3 transition-all duration-200 ${placedSensors.length === 0 ? 'border-gray-200 bg-gray-50 min-h-[140px] flex items-center justify-center' : 'border-gray-200 bg-white shadow-inner'}`}
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                        >
                                            {placedSensors.length === 0 ? (
                                                <div className="text-center px-6">
                                                    <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <Lightbulb size={24} />
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-600 mb-3">No hay luces instaladas</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsPanelOpen(true)}
                                                        className="text-xs font-semibold text-gray-900 hover:bg-gray-100 bg-white border border-gray-200 px-4 py-2 rounded-lg transition-colors"
                                                    >
                                                        Abrir Panel de Componentes
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {placedSensors.map((sensor) => (
                                                        <div key={sensor.id} className="relative group">
                                                            <div className="h-[120px] relative overflow-hidden rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                                                                <div className="absolute top-0 left-0 w-full transform scale-[0.65] origin-top-left -ml-2 -mt-4">
                                                                    {renderSensorWidget(sensor)}
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveSensor(sensor.id)}
                                                                className="absolute -top-2 -right-2 w-7 h-7 bg-white text-red-500 rounded-full shadow-lg border border-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:scale-110 z-10"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsPanelOpen(true)}
                                                        className="h-[120px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                                                    >
                                                        <span className="text-2xl mb-1">+</span>
                                                        <span className="text-xs font-semibold">Añadir Luz</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </form>

                            <div className="px-5 pb-4 bg-white flex-shrink-0">
                                {/* Info card (solo en creación) */}
                                {!editingEstanteria && (
                                    <div className="hidden">
                                        <Beaker size={18} className="text-gray-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            Una vez creada la estantería, podrás asignarle controladores de iluminación
                                            y monitorear el estado de cada nivel desde el panel de gestión.
                                        </p>
                                    </div>
                                )}

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
                                        form="shelfForm"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black rounded-xl shadow-md shadow-gray-900/25 hover:shadow-lg transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? 'Guardando...' : editingEstanteria ? 'Guardar Cambios' : 'Crear Estantería'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <ComponentPanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                onAddComponent={(comp) => {
                    handleAddSensor(comp);
                    setIsPanelOpen(false);
                }}
                allowedTypes={['light']}
                customComponents={haLights.length > 0 ? haLights : undefined}
            />
        </>
    );
}

