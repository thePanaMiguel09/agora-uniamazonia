import { useState, useEffect } from 'react';
import {
    Droplets, Timer, History, Play, Square,
    AlertCircle, Calendar, Clock, RefreshCcw
} from 'lucide-react';

interface WaterValveControlProps {
    entityId?: string;
    haStates?: Record<string, string>;
    nombre?: string;
    onToggle?: (entityId: string, turnOn: boolean) => void;
}

const WaterValveControl = ({ entityId = 'switch.bomba_1', haStates = {}, nombre, onToggle }: WaterValveControlProps) => {
    // Extraer el ID sin el prefijo para el input
    const initialLocalId = entityId.startsWith('switch.') ? entityId.replace('switch.', '') : entityId;
    const [localEntityId, setLocalEntityId] = useState(initialLocalId);
    
    const effectiveEntityId = `switch.${localEntityId}`;
    const haState = haStates[effectiveEntityId];

    const [localIsOpen, setLocalIsOpen] = useState(haState === 'on' ? true : false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [duration, setDuration] = useState(10); // Minutos
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const isOpen = haState ? haState === 'on' : localIsOpen;

    useEffect(() => {
        let interval: number | undefined;

        // Verificamos que timeLeft NO sea null antes de compararlo
        if (isOpen && timeLeft !== null && timeLeft > 0) {
            interval = window.setInterval(() => {
                setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
            }, 60000);
        } else if (timeLeft === 0) {
            if (onToggle && isOpen) {
                onToggle(effectiveEntityId, false);
            } else {
                setLocalIsOpen(false);
            }
            setTimeLeft(null);
        }

        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [isOpen, timeLeft, onToggle, effectiveEntityId]);

    const handleTurnOn = () => {
        setTimeLeft(duration);
        if (onToggle) {
            onToggle(effectiveEntityId, true);
        } else {
            setLocalIsOpen(true);
        }
    };

    const handleTurnOff = () => {
        setTimeLeft(null);
        if (onToggle) {
            onToggle(effectiveEntityId, false);
        } else {
            setLocalIsOpen(false);
        }
    };

    return (
        <div className="bg-slate-50 rounded-xl shadow-sm p-3 border border-slate-200 h-[190px] w-full overflow-hidden font-sans">
            <div className="w-full h-full perspective-1000">
                <div
                    className="relative w-full h-full transition-transform duration-700 preserve-3d"
                    style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                    {/* FRONT: CONTROL DE VÁLVULA */}
                    <div className="absolute inset-0 backface-hidden bg-white rounded-lg p-2 border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                                    <Droplets size={16} />
                                </div>
                                <div>
                                    <h2 className="text-slate-800 font-bold text-xs tracking-tight">{nombre || 'Válvula Jardín'}</h2>
                                    <div className="flex items-center gap-1 mt-0.5" onClick={e => e.stopPropagation()}>
                                        <span className="text-[9px] text-gray-400 font-mono">switch.</span>
                                        <input 
                                            type="text" 
                                            value={localEntityId}
                                            onChange={(e) => setLocalEntityId(e.target.value)}
                                            className="text-[10px] text-gray-600 bg-gray-50 border border-gray-200 rounded px-1 w-20 outline-none focus:border-blue-400"
                                            placeholder="ID"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsFlipped(true)} className="text-slate-300 hover:text-slate-600 transition-colors mt-1">
                                <History size={16} />
                            </button>
                        </div>

                        {/* Selector de Tiempo */}
                        <div className="bg-slate-50 rounded-md p-2 border border-slate-100">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                    <Timer size={10} /> Temporizador
                                </span>
                                <span className="text-[10px] font-bold text-blue-600">
                                    {isOpen && timeLeft !== null ? `Quedan ${timeLeft}m` : `${duration} min`}
                                </span>
                            </div>
                            <input
                                type="range" min="1" max="60" value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                disabled={isOpen}
                                className="w-full accent-slate-800 h-1 cursor-pointer disabled:opacity-50"
                            />
                        </div>

                        {/* Botones Principales */}
                        <div className="flex gap-2 mt-1">
                            <button
                                onClick={handleTurnOn}
                                className="flex-1 py-2 rounded-md font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-sm bg-blue-600 text-white hover:bg-blue-700"
                            >
                                <Play size={12} className="fill-current" /> Abrir
                            </button>
                            <button
                                onClick={handleTurnOff}
                                className="flex-1 py-2 rounded-md font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-sm bg-slate-800 text-white hover:bg-black"
                            >
                                <Square size={12} className="fill-current" /> Cerrar
                            </button>
                        </div>
                    </div>

                    {/* BACK: ESTADÍSTICAS E HISTORIAL */}
                    <div className="absolute inset-0 backface-hidden bg-slate-900 rounded-lg p-3 text-white" style={{ transform: 'rotateY(180deg)' }}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-md bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                    <History size={14} className="text-blue-400" />
                                </div>
                                <h3 className="text-xs font-bold uppercase tracking-tight">Última Actividad</h3>
                            </div>
                            <button onClick={() => setIsFlipped(false)} className="p-1 rounded-md bg-white/10 hover:bg-white/20">
                                <RefreshCcw size={12} />
                            </button>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <div className="flex items-center gap-2">
                                    <Calendar size={12} className="text-slate-500" />
                                    <span className="text-[10px] text-slate-300">Fecha</span>
                                </div>
                                <span className="text-[10px] font-medium text-slate-100">Hoy, 14:20</span>
                            </div>

                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <div className="flex items-center gap-2">
                                    <Clock size={12} className="text-slate-500" />
                                    <span className="text-[10px] text-slate-300">Duración</span>
                                </div>
                                <span className="text-[10px] font-medium text-slate-100">15 minutos</span>
                            </div>

                            <div className="bg-blue-500/10 rounded-md p-2 flex items-center gap-2 border border-blue-500/20 mt-1">
                                <AlertCircle size={12} className="text-blue-400" />
                                <p className="text-[9px] text-blue-200 leading-tight">Consumo estimado de 45L en la última sesión.</p>
                            </div>
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

export default WaterValveControl;