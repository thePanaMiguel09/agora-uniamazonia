import { Activity } from "lucide-react";
import { Link } from "react-router-dom";

interface NavBrandProps {
  variant: "desktop" | "mobile";
}

export function NavBrand({ variant }: NavBrandProps) {
  if (variant === "mobile") {
    return (
      <Link
        to="/"
        className="flex items-center gap-2"
        aria-label="Ir al inicio"
      >
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg" />
          <div className="relative h-full w-full bg-white/10 backdrop-blur-sm rounded-lg border border-emerald-400/30 flex items-center justify-center">
            <Activity size={16} className="text-white" />
          </div>
        </div>
        <h1 className="text-lg font-bold text-white">LabControl</h1>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4 flex-shrink-0">
      <Link to="/" className="flex items-center" aria-label="Ir al inicio">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg" />
          <div className="relative h-full w-full bg-white/10 backdrop-blur-sm rounded-xl border border-emerald-400/30 flex items-center justify-center">
            <Activity size={22} className="text-white filter drop-shadow" />
          </div>
        </div>
      </Link>
      <div>
        <h1 className="text-xl font-black text-white tracking-tight filter drop-shadow-lg">
          LabControl Pro
        </h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg" />
          <span className="text-xs font-semibold text-white tracking-wider z-10">
            UNIVERSIDAD DE LA AMAZONIA
          </span>
        </div>
      </div>
    </div>
  );
}
