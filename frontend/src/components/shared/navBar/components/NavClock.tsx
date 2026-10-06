import { Clock } from "lucide-react";
import { useCurrentTime } from "../hooks/useCurrentTime";

// Los formatters se crean una sola vez (son costosos de instanciar)
const timeFormatter = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

interface NavClockProps {
  variant: "full" | "compact";
}

/** Al vivir en su propio componente, solo este se re-renderiza cada segundo, no todo el Navbar. */
export function NavClock({ variant }: NavClockProps) {
  const now = useCurrentTime();

  if (variant === "compact") {
    return (
      <div className="bg-gray-800 rounded-lg px-3 py-1.5 border border-gray-700">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-emerald-400" />
          <time
            dateTime={now.toISOString()}
            className="text-xs font-semibold text-white font-mono"
          >
            {timeFormatter.format(now)}
          </time>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg px-4 h-11 flex items-center">
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-emerald-400" />
        <div className="flex flex-col justify-center">
          <time
            dateTime={now.toISOString()}
            className="text-sm font-semibold text-white font-mono leading-none mb-0.5"
          >
            {timeFormatter.format(now)}
          </time>
          <span className="text-[10px] text-gray-400 leading-none">
            {dateFormatter.format(now)}
          </span>
        </div>
      </div>
    </div>
  );
}
