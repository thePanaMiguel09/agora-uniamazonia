import { useState, useRef, useMemo } from 'react';
import {
    Power, Plus, Minus, Wind, Snowflake, BarChart3, RotateCcw,
    TrendingUp, TrendingDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Los generadores de datos se mantienen iguales para la funcionalidad
const generateHourlyData = () => {
    const data = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
        const hour = new Date(now);
        hour.setHours(hour.getHours() - i);
        const baseTemp = 22;
        const currentTemp = baseTemp + Math.sin(i * 0.5) * 2 + Math.random() * 1.5;
        data.push({
            hora: hour.getHours().toString().padStart(2, '0') + ':00',
            temperatura: Number(currentTemp.toFixed(1)),
            tendencia: currentTemp > (i > 0 ? baseTemp + Math.sin((i - 1) * 0.5) * 2 : currentTemp) ? 'up' : 'down'
        });
    }
    return data;
};

const AirConditionerControl = () => {
    const [isOn, setIsOn] = useState(false);
    const [temperature, setTemperature] = useState(20);
    const [fanSpeed] = useState('medium');
    const [isFlipped, setIsFlipped] = useState(false);
    const componentRef = useRef(null);

    const hourlyData = useMemo(() => generateHourlyData(), []);
    const currentTrend = hourlyData[hourlyData.length - 1]?.tendencia || 'up';

    const handleTemperatureUp = () => { if (isOn && temperature < 30) setTemperature(prev => prev + 1); };
    const handleTemperatureDown = () => { if (isOn && temperature > 16) setTemperature(prev => prev - 1); };

    return (
        <div className="bg-slate-50 rounded-xl shadow-sm p-3 border border-slate-200 h-[190px] w-full overflow-hidden font-sans">
            <div ref={componentRef} className="w-full h-full perspective-1000">
                <div
                    className="relative w-full h-full transition-transform duration-700 preserve-3d"
                    style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                    {/* FRONT SIDE */}
                    <div className="absolute inset-0 backface-hidden flex flex-col">
                        <div className="grid grid-cols-3 gap-3 h-full bg-white rounded-lg p-2 border border-slate-100">

                            {/* LEFT COLUMN: Controls */}
                            <div className="flex flex-col justify-between py-1">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isOn ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Snowflake size={16} />
                                    </div>
                                    <h2 className="text-slate-700 font-bold text-xs tracking-tight">Clima</h2>
                                </div>

                                <div className="space-y-1.5">
                                    <button
                                        onClick={() => setIsOn(!isOn)}
                                        className={`w-full py-1.5 rounded-md font-bold text-[10px] uppercase tracking-wider transition-all shadow-sm ${isOn ? 'bg-slate-800 text-white' : 'bg-emerald-600 text-white'}`}
                                    >
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Power size={12} />
                                            {isOn ? 'Apagar' : 'Encender'}
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setIsFlipped(true)}
                                        className="w-full py-1.5 rounded-md font-bold text-[10px] uppercase tracking-wider bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200"
                                    >
                                        <div className="flex items-center justify-center gap-1.5">
                                            <BarChart3 size={12} />
                                            Datos
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* CENTER COLUMN: Display */}
                            <div className="flex flex-col items-center justify-center border-x border-slate-50">
                                <div className={`text-5xl font-light tracking-tighter ${isOn ? 'text-slate-800' : 'text-slate-300'}`}>
                                    {temperature}<span className="text-2xl ml-0.5">°</span>
                                </div>
                                <div className={`flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full ${isOn ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-400'}`}>
                                    <Wind size={10} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">
                                        {fanSpeed === 'low' ? 'Bajo' : fanSpeed === 'medium' ? 'Medio' : 'Alto'}
                                    </span>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Toggles */}
                            <div className="flex flex-col justify-between py-1">
                                <button onClick={handleTemperatureUp} disabled={!isOn} className="w-full py-2 bg-slate-50 rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-30 border border-slate-200 flex justify-center">
                                    <Plus size={18} />
                                </button>

                                <div className="flex flex-col gap-1">
                                    <input
                                        type="range" min="16" max="30" value={temperature}
                                        onChange={(e) => isOn && setTemperature(parseInt(e.target.value))}
                                        disabled={!isOn}
                                        className="w-full accent-slate-800 h-1"
                                    />
                                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                                        <span>16°</span><span>30°</span>
                                    </div>
                                </div>

                                <button onClick={handleTemperatureDown} disabled={!isOn} className="w-full py-2 bg-slate-50 rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-30 border border-slate-200 flex justify-center">
                                    <Minus size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* BACK SIDE */}
                    <div className="absolute inset-0 backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
                        <div className="bg-white rounded-lg p-3 h-full border border-slate-200 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-slate-800 font-bold text-xs uppercase tracking-tight">Análisis Semanal</h3>
                                    <div className={`flex items-center text-[10px] font-bold ${currentTrend === 'up' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        {currentTrend === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                                        Estable
                                    </div>
                                </div>
                                <button onClick={() => setIsFlipped(false)} className="p-1.5 rounded-md bg-slate-800 text-white hover:bg-slate-700 transition-colors">
                                    <RotateCcw size={12} />
                                </button>
                            </div>

                            <div className="flex-1 bg-slate-50 rounded border border-slate-100 overflow-hidden pt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={hourlyData} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="hora" hide />
                                        <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                                        />
                                        <Line type="monotone" dataKey="temperatura" stroke="#1e293b" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
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

export default AirConditionerControl;