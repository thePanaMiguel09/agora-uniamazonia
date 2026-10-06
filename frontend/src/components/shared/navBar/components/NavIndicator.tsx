import { useId } from "react";
import type { IndicatorStyle } from "../hooks/useNavIndicator";

const DROP_PATH =
  "M0,18 C5,18 15,18 20,16 C28,12 35,4 50,4 C65,4 72,12 80,16 C85,18 95,18 100,18";

const TRANSITION = "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]";

interface NavIndicatorProps {
  style: IndicatorStyle;
}

export function NavIndicator({ style }: NavIndicatorProps) {
  // useId genera ids con ":" que pueden dar problemas en url(#...)
  const gradientId = `drop-${useId().replace(/:/g, "")}`;

  return (
    <div className="relative h-1" aria-hidden="true">
      {/* Línea base */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500" />

      {/* Gota que emerge de la línea */}
      <div
        className={`absolute pointer-events-none -top-3.5 h-[18px] ${TRANSITION}`}
        style={{
          left: style.left,
          width: style.width,
          opacity: style.opacity,
        }}
      >
        <svg
          viewBox="0 0 100 18"
          preserveAspectRatio="none"
          className="w-full h-full"
          style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,0.5))" }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <path d={DROP_PATH} fill={`url(#${gradientId})`} />
          <path
            d={DROP_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Brillo blanco sobre la línea en la posición activa */}
      <div
        className={`absolute top-0 h-full ${TRANSITION}`}
        style={{
          left: style.left + style.width * 0.15,
          width: style.width * 0.7,
          opacity: style.opacity * 0.5,
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}