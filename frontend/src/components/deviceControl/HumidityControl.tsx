import { useState, useRef, useMemo } from 'react';
import {
  Droplets, BarChart3, RotateCcw,
  TrendingUp, TrendingDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/* ─── Generador de datos simulados ─── */
const generateHourlyData = () => {
  const data = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const hour = new Date(now);
    hour.setHours(hour.getHours() - i);
    const baseHumidity = 60;
    const currentHumidity = baseHumidity + Math.sin(i * 0.4) * 8 + Math.random() * 3;
    data.push({
      hora: hour.getHours().toString().padStart(2, '0') + ':00',
      humedad: Number(Math.min(100, Math.max(0, currentHumidity)).toFixed(1)),
    });
  }
  return data;
};

interface HumidityControlProps {
  valorReal?: number | string;
}
const HumidityControl = ({ valorReal }: HumidityControlProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const componentRef = useRef(null);

  const actualHumidity = valorReal != null ? Number(valorReal) : undefined;
  const hourlyData = useMemo(() => {
    const data = generateHourlyData();
    if (actualHumidity !== undefined && !Number.isNaN(actualHumidity)) {
      data[data.length - 1].humedad = Number(actualHumidity.toFixed(1));
    }
    return data;
  }, [actualHumidity]);

  const currentHumidity = hourlyData[hourlyData.length - 1]?.humedad ?? 60;
  const prevHumidity = hourlyData[hourlyData.length - 2]?.humedad ?? currentHumidity;
  const trend = currentHumidity >= prevHumidity ? 'up' : 'down';

  /* Determinar color según rango */
  const getHumidityColor = (hum: number) => {
    if (hum >= 80) return { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', label: 'Alta' };
    if (hum >= 40) return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', label: 'Normal' };
    return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', label: 'Baja' };
  };

  const humColor = getHumidityColor(currentHumidity);

  return (
    <div className="bg-white rounded-lg p-0 border border-gray-200 hover:border-blue-300 transition-all duration-300 h-[190px] w-full overflow-hidden">
      <div ref={componentRef} className="w-full h-full perspective-1000">
        <div
          className="relative w-full h-full transition-transform duration-700 preserve-3d"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* ══════ FRONT SIDE ══════ */}
          <div className="absolute inset-0 backface-hidden flex flex-col p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200">
                  <Droplets size={16} className="text-blue-500" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">HUM</span>
                  <p className="text-[10px] text-gray-400 leading-none">Sensor activo</p>
                </div>
              </div>
              <button
                onClick={() => setIsFlipped(true)}
                className="p-1.5 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200"
                title="Ver gráfica"
              >
                <BarChart3 size={12} />
              </button>
            </div>

            {/* Valor grande */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-4xl font-extrabold text-gray-900 leading-none">
                {currentHumidity}
                <span className="text-xl font-bold text-gray-400">%</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Humedad Prom.</div>
            </div>

            {/* Footer: tendencia + badge */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className={`flex items-center gap-1 text-[10px] font-bold ${trend === 'up' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {trend === 'up' ? 'Subiendo' : 'Bajando'}
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${humColor.badge}`}>
                {humColor.label}
              </span>
            </div>
          </div>

          {/* ══════ BACK SIDE (Gráfica) ══════ */}
          <div className="absolute inset-0 backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
            <div className="bg-white rounded-lg p-3 h-full border border-slate-200 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Droplets size={14} className="text-blue-500" />
                  <h3 className="text-slate-800 font-bold text-xs uppercase tracking-tight">Historial Hum.</h3>
                  <div className={`flex items-center text-[10px] font-bold ${trend === 'up' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {trend === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
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
                    <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                      formatter={(value: number) => [`${value}%`, 'Humedad']}
                    />
                    <Line type="monotone" dataKey="humedad" stroke="#3b82f6" strokeWidth={2} dot={false} />
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

export default HumidityControl;
