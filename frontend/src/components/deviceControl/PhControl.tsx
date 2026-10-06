import { useState, useRef, useMemo } from 'react';
import {
  Beaker, BarChart3, RotateCcw,
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
    const basePh = 7.0;
    const currentPh = basePh + Math.sin(i * 0.5) * 1.5 + (Math.random() * 0.5 - 0.25);
    data.push({
      hora: hour.getHours().toString().padStart(2, '0') + ':00',
      ph: Number(Math.min(14, Math.max(0, currentPh)).toFixed(1)),
    });
  }
  return data;
};

interface PhControlProps {
  valorReal?: number | string;
}

const PhControl = ({ valorReal }: PhControlProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const componentRef = useRef(null);

  const actualPh = valorReal != null ? Number(valorReal) : undefined;
  const hourlyData = useMemo(() => {
    const data = generateHourlyData();
    if (actualPh !== undefined && !Number.isNaN(actualPh)) {
      data[data.length - 1].ph = Number(actualPh.toFixed(1));
    }
    return data;
  }, [actualPh]);

  const currentPh = hourlyData[hourlyData.length - 1]?.ph ?? 7.0;
  const prevPh = hourlyData[hourlyData.length - 2]?.ph ?? currentPh;
  const trend = currentPh >= prevPh ? 'up' : 'down';

  /* Determinar color según rango de pH */
  const getPhColor = (ph: number) => {
    if (ph < 6.5) return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', label: 'Ácido' };
    if (ph > 8.5) return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', label: 'Básico' };
    return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', label: 'Óptimo' };
  };

  const phColor = getPhColor(currentPh);

  return (
    <div className="bg-white rounded-lg p-0 border border-gray-200 hover:border-emerald-300 transition-all duration-300 h-[190px] w-full overflow-hidden">
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
                <div className={`w-8 h-8 ${phColor.bg} rounded-lg flex items-center justify-center border ${phColor.border}`}>
                  <Beaker size={16} className={phColor.text} />
                </div>
                <div>
                  <span className={`text-xs font-bold ${phColor.text} uppercase tracking-wider`}>pH</span>
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
                {currentPh}
                <span className="text-xl font-bold text-gray-400 ml-1">pH</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Nivel actual</div>
            </div>

            {/* Footer: tendencia + badge */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className={`flex items-center gap-1 text-[10px] font-bold ${trend === 'up' ? 'text-blue-600' : 'text-red-600'}`}>
                {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {trend === 'up' ? 'Aumentando' : 'Disminuyendo'}
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${phColor.badge}`}>
                {phColor.label}
              </span>
            </div>
          </div>

          {/* ══════ BACK SIDE (Gráfica) ══════ */}
          <div className="absolute inset-0 backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
            <div className="bg-white rounded-lg p-3 h-full border border-slate-200 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Beaker size={14} className={phColor.text} />
                  <h3 className="text-slate-800 font-bold text-xs uppercase tracking-tight">Historial pH</h3>
                  <div className={`flex items-center text-[10px] font-bold text-gray-500`}>
                    Variable
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
                      formatter={(value: number) => [`${value}`, 'pH']}
                    />
                    <Line type="monotone" dataKey="ph" stroke="#10b981" strokeWidth={2} dot={false} />
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

export default PhControl;
