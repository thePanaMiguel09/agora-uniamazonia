import {
  Power,
  Settings,
  BarChart3,
  RotateCcw,
  Zap,
  Loader2,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface LightControlProps {
  entityId?: string;
  haStates?: Record<string, string>;
  haState?: string;
  nombre?: string;
  className?: string;
  onToggle?: (entityId: string, turnOn: boolean) => Promise<void> | void;
  onDelete?: () => void;
}

const LightControlSimple = ({
  entityId = "light.lampara_1",
  haStates = {},
  haState,
  nombre,
  className = "h-36",
  onToggle,
  onDelete,
}: LightControlProps) => {
  // Extraer el ID sin el prefijo para el input
  const initialLocalId = entityId.startsWith("light.")
    ? entityId.replace("light.", "")
    : entityId;
  const [localEntityId, setLocalEntityId] = useState(initialLocalId);
  const [localIsOn, setLocalIsOn] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const effectiveEntityId = `light.${localEntityId}`;
  const displayName = nombre || "Sala Principal";

  // Evita que el teclado enfoque botones de la cara que no se ve
  const frontTab = isFlipped ? -1 : 0;
  const backTab = isFlipped ? 0 : -1;

  // Estado: haState directo (previsualización) > mapa de Home Assistant > estado local
  const isOn =
    haState !== undefined
      ? haState === "on"
      : haStates[effectiveEntityId] !== undefined
        ? haStates[effectiveEntityId] === "on"
        : localIsOn;

  const handleTurnOn = async () => {
    setIsLoading(true);
    try {
      if (onToggle) {
        await onToggle(effectiveEntityId, true);
      }
      setLocalIsOn(true);
    } catch (error) {
      console.error("Error al encender la luz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTurnOff = async () => {
    setIsLoading(true);
    try {
      if (onToggle) {
        await onToggle(effectiveEntityId, false);
      }
      setLocalIsOn(false);
    } catch (error) {
      console.error("Error al apagar la luz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full group ${className}`}>
      <div className="w-full h-full perspective-1000">
        <div
          className="relative w-full h-full transition-all duration-700 motion-reduce:transition-none preserve-3d shadow-xl rounded-2xl"
          style={{
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT - CONTROL */}
          <div
            aria-hidden={isFlipped}
            className="absolute inset-0 backface-hidden bg-white rounded-2xl p-3 flex flex-col justify-between border border-gray-100"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <h2 className="text-gray-800 font-bold text-sm tracking-tight truncate">
                  {displayName}
                </h2>
                <div
                  className="flex items-center gap-1 mt-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[11px] text-gray-500 font-mono">
                    light.
                  </span>
                  <input
                    disabled
                    type="text"
                    value={localEntityId}
                    onChange={(e) => setLocalEntityId(e.target.value)}
                    aria-label="ID de la entidad de la luz"
                    tabIndex={frontTab}
                    className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 flex-1 min-w-0 max-w-[7rem] outline-none focus:border-yellow-400 focus-visible:ring-2 focus-visible:ring-yellow-300"
                    placeholder="ID"
                  />
                </div>
              </div>

              {/* Acciones del encabezado: lado a lado, sin superponerse */}
              <div className="flex items-center gap-1 shrink-0 -mt-1 -mr-1">
                <button
                  type="button"
                  tabIndex={frontTab}
                  aria-label="Configuración de la luz"
                  title="Configuración"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Settings size={18} aria-hidden="true" />
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    tabIndex={frontTab}
                    aria-label={`Eliminar dispositivo ${displayName}`}
                    title="Eliminar dispositivo"
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center -mt-1">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 shadow-md
                                ${
                                  isOn
                                    ? "bg-yellow-400 shadow-yellow-100"
                                    : "bg-gray-100 shadow-none"
                                }`}
              >
                {isLoading ? (
                  <Loader2
                    className="animate-spin text-gray-400"
                    size={20}
                    aria-hidden="true"
                  />
                ) : (
                  <Power
                    className={isOn ? "text-white" : "text-gray-400"}
                    size={20}
                    aria-hidden="true"
                  />
                )}
              </div>
              <span
                role="status"
                aria-live="polite"
                className={`text-xs mt-1 font-bold uppercase tracking-widest ${isOn ? "text-yellow-700" : "text-gray-500"}`}
              >
                {isLoading ? "..." : isOn ? "On" : "Off"}
              </span>
            </div>

            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={handleTurnOn}
                disabled={isLoading}
                tabIndex={frontTab}
                aria-label={`Encender ${displayName}`}
                className="flex-1 h-9 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 hover:cursor-pointer"
              >
                ON
              </button>
              <button
                type="button"
                onClick={handleTurnOff}
                disabled={isLoading}
                tabIndex={frontTab}
                aria-label={`Apagar ${displayName}`}
                className="flex-1 h-9 text-sm font-semibold rounded-lg bg-gray-900 text-white hover:bg-black transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-900 hover:cursor-pointer"
              >
                OFF
              </button>
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                tabIndex={frontTab}
                aria-label="Ver consumo de energía"
                title="Ver consumo"
                className="flex-1 h-9 flex items-center justify-center bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 border border-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 hover:cursor-pointer"
              >
                <BarChart3 size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* BACK - ESTADÍSTICAS */}
          <div
            aria-hidden={!isFlipped}
            className="absolute inset-0 backface-hidden bg-indigo-600 rounded-2xl p-3 flex flex-col text-white"
            style={{ transform: "rotateY(180deg)" }}
          >
            <div className="flex justify-between items-center mb-2 gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Zap
                  size={14}
                  className="text-yellow-300 fill-yellow-300 shrink-0"
                  aria-hidden="true"
                />
                <h3 className="text-sm font-bold tracking-tight truncate">
                  Consumo
                </h3>
              </div>

              <div className="flex items-center gap-1 shrink-0 -mt-1 -mr-1">
                <button
                  type="button"
                  onClick={() => setIsFlipped(false)}
                  tabIndex={backTab}
                  aria-label="Volver al control"
                  title="Volver"
                  className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <RotateCcw size={16} aria-hidden="true" />
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    tabIndex={backTab}
                    aria-label={`Eliminar dispositivo ${displayName}`}
                    title="Eliminar dispositivo"
                    className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-lg hover:bg-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 flex-1 flex flex-col justify-center">
              <div>
                <div className="flex justify-between text-xs mb-1 opacity-90 font-medium">
                  <span>Hoy</span>
                  <span>1.2 kWh</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-yellow-300 h-full w-3/4 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1 opacity-90 font-medium">
                  <span>Mes</span>
                  <span>24.5 kWh</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-1/2 rounded-full" />
                </div>
              </div>
              <p className="text-[11px] text-center text-indigo-100 mt-1 italic">
                -12% vs mes anterior
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .perspective-1000 { perspective: 1000px; }
            `}</style>
    </div>
  );
};

export default LightControlSimple;
