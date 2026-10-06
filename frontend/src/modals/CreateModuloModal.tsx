import { useState, useEffect } from 'react';
import { X, DoorOpen, Tag, FileText, Thermometer, Trash2, Beaker } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ComponentPanel from '../components/ComponentPanel';
import TemperatureControl from '../components/deviceControl/TemperatureControl';
import HumidityControl from '../components/deviceControl/HumidityControl';

interface PlacedSensor {
    id: string;
    type: string;
    name: string;
}

interface CreateSalaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (salaData: { nombre: string; descripcion: string; estadoId: string; sensors: PlacedSensor[] }) => void;
    editingRoom?: { nombre: string; descripcion: string; estadoId: string; sensors?: PlacedSensor[] } | null;
}

export default function CreateSalaModal({ isOpen, onClose, onSave, editingRoom }: CreateSalaModalProps) {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        estadoId: '1',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [placedSensors, setPlacedSensors] = useState<PlacedSensor[]>([]);

    useEffect(() => {
        if (isOpen) {
            if (editingRoom) {
                setFormData({
                    nombre: editingRoom.nombre || '',
                    descripcion: editingRoom.descripcion || '',
                    estadoId: editingRoom.estadoId || '1',
                });
                setPlacedSensors(editingRoom.sensors || []);
            } else {
                setFormData({ nombre: '', descripcion: '', estadoId: '1' });
                setPlacedSensors([]);
            }
            setErrors({});
            setIsPanelOpen(false);
        }
    }, [isOpen, editingRoom]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const nombre = (formData.nombre || '').trim();
        const descripcion = (formData.descripcion || '').trim();

        if (!nombre) newErrors.nombre = 'El nombre es obligatorio';
        if (nombre.length > 100) newErrors.nombre = 'Maximo 100 caracteres';
        if (!descripcion) newErrors.descripcion = 'La descripción es obligatoria';
        if (descripcion.length > 500) newErrors.descripcion = 'Maximo 500 caracteres';
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

    const handleAddSensor = (component: any) => {
        const newSensor: PlacedSensor = {
            id: `${component.type}-${Date.now()}`,
            type: component.type,
            name: component.name,
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
            if (componentData.type === 'temperature' || componentData.type === 'humidity') {
                handleAddSensor(componentData);
            }
        } catch (error) {
            console.error('Error al procesar componente:', error);
        }
    };

    const renderSensorWidget = (sensor: PlacedSensor) => {
        switch (sensor.type) {
            case 'temperature':
                return <TemperatureControl />;
            case 'humidity':
                return <HumidityControl />;
            default:
                return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        const moduloData = { ...formData, sensors: placedSensors };

        try {
            if (editingRoom) {
                setIsPanelOpen(false);
                setFormData({ nombre: '', descripcion: '', estadoId: '1' });
                setErrors({});
                setPlacedSensors([]);
                onClose();
                Promise.resolve(onSave(moduloData)).catch((error: any) => {
                    const msg = error.response?.data?.message || 'Error al guardar el módulo';
                    alert(msg);
                    console.error(error);
                });
                return;
            }

            await onSave(moduloData);
            setIsPanelOpen(false);
            setFormData({ nombre: '', descripcion: '', estadoId: '1' });
            setErrors({});
            setPlacedSensors([]);
            onClose();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al guardar el módulo';
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
                        <motion.div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        <motion.div
                            className={`relative bg-white rounded-2xl shadow-2xl w-full ${editingRoom ? 'max-w-md' : 'max-w-md'} mx-4 max-h-[90vh] overflow-hidden flex flex-col`}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600" />

                            <>
                                <div className="flex justify-between items-center px-5 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/25">
                                            <DoorOpen size={18} className="text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold text-gray-900">
                                                {editingRoom ? 'Editar Módulo' : 'Nuevo Módulo'}
                                            </h2>
                                            <p className="text-[11px] text-gray-500">
                                                {editingRoom ? 'Modifica los datos del módulo' : 'Registra un nuevo módulo en el laboratorio'}
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

                            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3 overflow-y-auto">
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                                        <Tag size={12} className="text-emerald-600" />
                                        Nombre del Módulo
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nombre || ''}
                                        onChange={(e) => handleChange('nombre', e.target.value)}
                                        placeholder="Ej: Módulo de Control Principal"
                                        className={`w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white ${errors.nombre ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'}`}
                                    />
                                    {errors.nombre && (
                                        <motion.p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                            <span>⚠</span> {errors.nombre}
                                        </motion.p>
                                    )}
                                </div>

                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                                        <FileText size={12} className="text-emerald-600" />
                                        Descripción
                                    </label>
                                    <textarea
                                        value={formData.descripcion || ''}
                                        onChange={(e) => handleChange('descripcion', e.target.value)}
                                        placeholder="Describe brevemente el propósito del módulo..."
                                        rows={2}
                                        className={`w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 resize-none bg-gray-50 hover:bg-white focus:bg-white ${errors.descripcion ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'}`}
                                    />
                                    {errors.descripcion && (
                                        <motion.p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                            <span>⚠</span> {errors.descripcion}
                                        </motion.p>
                                    )}
                                </div>


                                {editingRoom && (
                                    <div className="mt-4 border-t border-gray-100 pt-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                                <Thermometer size={16} className="text-emerald-600" />
                                                Sensores del Módulo
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setIsPanelOpen(true)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-lg shadow-sm transition-all duration-200"
                                            >
                                                <span className="text-sm">+</span>
                                                Agregar Sensor
                                            </button>
                                        </div>

                                        <div
                                            className={`border-2 border-dashed rounded-xl p-3 transition-all duration-200 ${placedSensors.length === 0 ? 'border-emerald-200 bg-emerald-50/30 min-h-[140px] flex items-center justify-center' : 'border-gray-200 bg-white shadow-inner'}`}
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                        >
                                            {placedSensors.length === 0 ? (
                                                <div className="text-center px-6">
                                                    <p className="text-xs text-gray-500 font-medium">No hay sensores asignados</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">Arrastra o haz clic en "Agregar Sensor" para añadir</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {placedSensors.map((sensor) => (
                                                        <div key={sensor.id} className="relative group">
                                                            <div className="hidden">
                                                                <span className="text-xs font-semibold text-gray-700 capitalize">
                                                                    {sensor.name || sensor.type}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveSensor(sensor.id)}
                                                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                            <div className="h-[120px] relative overflow-hidden rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                                                                <div className="absolute top-0 left-0 w-full transform scale-[0.65] origin-top-left -ml-2 -mt-4">
                                                                    {renderSensorWidget(sensor)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Info card (solo en creación) */}
                                {!editingRoom && (
                                    <div className="hidden">
                                        <Beaker size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-emerald-700 leading-relaxed">
                                            Una vez creado el módulo, podrás asignarle dispositivos IoT, sensores y
                                            configurar las zonas de automatización desde el panel de control.
                                        </p>
                                    </div>
                                )}

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
                                        {isSubmitting ? 'Guardando...' : (editingRoom ? 'Guardar Cambios' : 'Crear Módulo')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ComponentPanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                onAddComponent={(component) => {
                    handleAddSensor(component);
                    setIsPanelOpen(false);
                }}
                allowedTypes={['temperature', 'humidity']}
            />
        </>
    );
}
