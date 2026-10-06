// components/SummaryCard.tsx
import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string; // Mantenemos la prop por compatibilidad pero no la usamos según el nuevo diseño
  icon?: LucideIcon;
}

export default function SummaryCard({
  title,
  value,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <div
      className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 w-full min-h-[90px] flex flex-col justify-between group/card"
      style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}
    >
      {/* Línea Superior: Icono y Título */}
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="w-8 h-8 bg-gradient-to-br from-[#367c29] to-[#2d6622] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-300 group-hover/card:scale-105">
            <Icon size={16} className="text-white" />
          </div>
        )}
        <p className="font-bold text-gray-900 text-[14px] uppercase tracking-tight leading-tight">
          {title}
        </p>
      </div>

      {/* Línea Central/Inferior: Valor */}
      <div className="flex justify-center items-center py-2">
        <h2
          className="text-2xl leading-none font-bold text-gray-700"
        >
          {value}
        </h2>
      </div>
    </div>
  );
}