// src/pages/Settings.tsx
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Settings as SettingsIcon,
  FlaskConical,
  Database,
  Save,
  RotateCcw,
  Info,
  Clock,
  CalendarClock,
  Hand,
  CheckCircle2,
  Thermometer,
  Droplets,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Tipos ─── */
type StorageMode = 'interval' | 'scheduled' | 'manual';

interface SensorFormula {
  sensorType: string;
  label: string;
  icon: typeof Thermometer;
  multiplier: number;
  offset: number;
  gradient: string;
}

/* ─── Componente principal ─── */
export default function Settings() {
  // ── Estado para Fórmulas de sensores ──
  const [formulas, setFormulas] = useState<SensorFormula[]>([
    {
      sensorType: 'temperature',
      label: 'Temperatura',
      icon: Thermometer,
      multiplier: 1,
      offset: 0,
      gradient: 'from-orange-500 to-red-500',
    },
    {
      sensorType: 'humidity',
      label: 'Humedad',
      icon: Droplets,
      multiplier: 1,
      offset: 0,
      gradient: 'from-cyan-500 to-blue-600',
    },
  ]);

  // ── Estado para Almacenamiento de datos ──
  const [storageMode, setStorageMode] = useState<StorageMode>('interval');
  const [intervalMinutes, setIntervalMinutes] = useState(15);
  const [scheduledTime, setScheduledTime] = useState('08:00');

  // ── Estado de UI ──
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<'formulas' | 'storage'>('formulas');

  /* ── Handlers ── */
  const handleFormulaChange = (
    index: number,
    field: 'multiplier' | 'offset',
    value: string
  ) => {
    const numValue = value === '' || value === '-' ? 0 : parseFloat(value);
    setFormulas((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, [field]: isNaN(numValue) ? 0 : numValue } : f
      )
    );
  };

  const handleResetFormulas = () => {
    setFormulas((prev) =>
      prev.map((f) => ({ ...f, multiplier: 1, offset: 0 }))
    );
  };

  const handleSave = () => {
    // Aquí iría la lógica para guardar en backend/localStorage
    console.log('Configuración guardada:', {
      formulas,
      storageMode,
      intervalMinutes,
      scheduledTime,
    });
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleManualSave = () => {
    // Aquí iría la lógica para guardar los datos de sensores manualmente
    console.log('Guardado manual de datos de sensores ejecutado');
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  /* ── Opciones de modo de almacenamiento ── */
  const storageModes: {
    value: StorageMode;
    label: string;
    description: string;
    icon: typeof Clock;
  }[] = [
    {
      value: 'interval',
      label: 'Por intervalo',
      description: 'Guardar datos cada cierto tiempo',
      icon: Clock,
    },
    {
      value: 'scheduled',
      label: 'Hora programada',
      description: 'Guardar datos en una hora específica',
      icon: CalendarClock,
    },
    {
      value: 'manual',
      label: 'Manual',
      description: 'Guardar datos solo al presionar un botón',
      icon: Hand,
    },
  ];

  /* ── Intervalos predefinidos ── */
  const presetIntervals = [1, 5, 10, 15, 30, 60];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <div className="max-w-5xl mx-auto p-6">
          {/* ─── Header ─── */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-emerald-600 to-green-700 rounded-full" />
              <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
            </div>
            <p className="text-sm text-gray-500 ml-4">
              Personaliza las fórmulas de conversión de sensores y la frecuencia de almacenamiento de datos
            </p>
          </div>

          {/* ─── Tabs de navegación ─── */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveSection('formulas')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeSection === 'formulas'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              <FlaskConical size={16} />
              Fórmulas de Sensores
            </button>
            <button
              onClick={() => setActiveSection('storage')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeSection === 'storage'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              <Database size={16} />
              Almacenamiento de Datos
            </button>
          </div>

          {/* ─── Sección 1: Fórmulas de Sensores ─── */}
          <AnimatePresence mode="wait">
            {activeSection === 'formulas' && (
              <motion.div
                key="formulas"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <FlaskConical size={20} className="text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white">
                            Fórmula de Conversión
                          </h2>
                          <p className="text-emerald-100 text-xs">
                            Define cómo se transforman los datos crudos de cada sensor
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleResetFormulas}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-xs font-semibold rounded-lg transition-all duration-200"
                      >
                        <RotateCcw size={13} />
                        Restablecer
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Info box */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                      <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium">
                          Fórmula aplicada a los valores de los sensores
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          <strong>Valor final = (Valor crudo × Multiplicador) + Offset</strong>
                          <br />
                          Por defecto, el multiplicador es 1 y el offset es 0, lo que significa que los valores no se modifican.
                        </p>
                      </div>
                    </div>

                    {/* Fórmulas por sensor */}
                    <div className="space-y-4">
                      {formulas.map((formula, index) => {
                        const Icon = formula.icon;
                        const previewValue = 25.5;
                        const result =
                          previewValue * formula.multiplier + formula.offset;

                        return (
                          <motion.div
                            key={formula.sensorType}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border border-gray-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-sm transition-all duration-200"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div
                                className={`w-9 h-9 rounded-lg bg-gradient-to-br ${formula.gradient} flex items-center justify-center`}
                              >
                                <Icon size={18} className="text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-sm">
                                  {formula.label}
                                </h3>
                                <p className="text-[11px] text-gray-400">
                                  Tipo: {formula.sensorType}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {/* Multiplicador */}
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                  Multiplicador
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={formula.multiplier}
                                  onChange={(e) =>
                                    handleFormulaChange(
                                      index,
                                      'multiplier',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 font-mono"
                                />
                              </div>

                              {/* Offset */}
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                  Offset (sumado)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={formula.offset}
                                  onChange={(e) =>
                                    handleFormulaChange(
                                      index,
                                      'offset',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 font-mono"
                                />
                              </div>

                              {/* Preview */}
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                  Vista previa
                                </label>
                                <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-700">
                                  <span className="text-gray-400">
                                    {previewValue} ×{' '}
                                  </span>
                                  <span className="text-emerald-600 font-bold">
                                    {formula.multiplier}
                                  </span>
                                  <span className="text-gray-400"> + </span>
                                  <span className="text-blue-600 font-bold">
                                    {formula.offset}
                                  </span>
                                  <span className="text-gray-400"> = </span>
                                  <span className="text-gray-900 font-bold">
                                    {result.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Sección 2: Almacenamiento de Datos ─── */}
            {activeSection === 'storage' && (
              <motion.div
                key="storage"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Database size={20} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">
                          Frecuencia de Almacenamiento
                        </h2>
                        <p className="text-emerald-100 text-xs">
                          Controla cuándo y cómo se guardan los datos recolectados en la base de datos
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Info box */}
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                      <Info size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-amber-800 font-medium">
                          ¿Por qué configurar la frecuencia?
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          Los sensores recolectan datos constantemente. Si se guardaran todos en cada instante,
                          la base de datos crecería rápidamente. Configura un intervalo, una hora programada
                          o guárdalos manualmente cuando lo necesites.
                        </p>
                      </div>
                    </div>

                    {/* Selector de modo */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      {storageModes.map((mode) => {
                        const ModeIcon = mode.icon;
                        const isActive = storageMode === mode.value;
                        return (
                          <motion.button
                            key={mode.value}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setStorageMode(mode.value)}
                            className={`relative p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                              isActive
                                ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/10'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            {isActive && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle2
                                  size={16}
                                  className="text-emerald-500"
                                />
                              </div>
                            )}
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                                isActive
                                  ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                                  : 'bg-gray-100'
                              }`}
                            >
                              <ModeIcon
                                size={18}
                                className={
                                  isActive ? 'text-white' : 'text-gray-500'
                                }
                              />
                            </div>
                            <h4
                              className={`text-sm font-bold mb-0.5 ${
                                isActive ? 'text-emerald-700' : 'text-gray-800'
                              }`}
                            >
                              {mode.label}
                            </h4>
                            <p className="text-[11px] text-gray-500">
                              {mode.description}
                            </p>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Panel de configuración del modo seleccionado */}
                    <AnimatePresence mode="wait">
                      {storageMode === 'interval' && (
                        <motion.div
                          key="interval-config"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border border-gray-200 rounded-xl p-5">
                            <h4 className="text-sm font-bold text-gray-800 mb-3">
                              Configurar intervalo de guardado
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {presetIntervals.map((mins) => (
                                <button
                                  key={mins}
                                  onClick={() => setIntervalMinutes(mins)}
                                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    intervalMinutes === mins
                                      ? 'bg-emerald-600 text-white shadow-md'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {mins < 60
                                    ? `${mins} min`
                                    : `${mins / 60} hora`}
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                                Personalizado:
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={1440}
                                value={intervalMinutes}
                                onChange={(e) =>
                                  setIntervalMinutes(
                                    Math.max(
                                      1,
                                      Math.min(
                                        1440,
                                        parseInt(e.target.value) || 1
                                      )
                                    )
                                  )
                                }
                                className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-mono"
                              />
                              <span className="text-xs text-gray-500">
                                minutos
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-3">
                              Los datos se guardarán automáticamente cada{' '}
                              <strong className="text-gray-600">
                                {intervalMinutes} minuto
                                {intervalMinutes !== 1 ? 's' : ''}
                              </strong>
                              .
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {storageMode === 'scheduled' && (
                        <motion.div
                          key="scheduled-config"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border border-gray-200 rounded-xl p-5">
                            <h4 className="text-sm font-bold text-gray-800 mb-3">
                              Configurar hora programada
                            </h4>
                            <div className="flex items-center gap-3">
                              <label className="text-xs font-semibold text-gray-600">
                                Hora de guardado:
                              </label>
                              <input
                                type="time"
                                value={scheduledTime}
                                onChange={(e) =>
                                  setScheduledTime(e.target.value)
                                }
                                className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-mono"
                              />
                            </div>
                            <p className="text-[11px] text-gray-400 mt-3">
                              Los datos se guardarán automáticamente todos los
                              días a las{' '}
                              <strong className="text-gray-600">
                                {scheduledTime}
                              </strong>
                              .
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {storageMode === 'manual' && (
                        <motion.div
                          key="manual-config"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border border-gray-200 rounded-xl p-5">
                            <h4 className="text-sm font-bold text-gray-800 mb-3">
                              Guardado manual
                            </h4>
                            <p className="text-xs text-gray-500 mb-4">
                              En este modo, los datos solo se guardan en la base
                              de datos cuando presionas el siguiente botón. Los
                              datos se acumulan en memoria hasta que decidas
                              guardarlos.
                            </p>
                            <button
                              onClick={handleManualSave}
                              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                              <Database size={16} />
                              Guardar datos ahora
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Botón global de guardar ─── */}
          <div className="mt-6 flex items-center justify-between">
            <AnimatePresence>
              {showSaveSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 text-emerald-600 text-sm font-semibold"
                >
                  <CheckCircle2 size={18} />
                  Configuración guardada exitosamente
                </motion.div>
              )}
            </AnimatePresence>
            {!showSaveSuccess && <div />}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Save size={16} />
              Guardar Configuración
            </button>
          </div>

          {/* ─── Footer info ─── */}
          <div className="mt-6 flex items-center justify-between text-xs text-gray-400 px-1">
            <span className="flex items-center gap-1.5">
              <SettingsIcon size={12} />
              Configuración del sistema
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sistema sincronizado
            </span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
