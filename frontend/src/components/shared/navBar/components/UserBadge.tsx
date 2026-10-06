import { User } from "lucide-react";

interface UserBadgeProps {
  userName: string;
  roleName: string;
  variant: "bar" | "card";
  className?: string;
}

export function UserBadge({
  userName,
  roleName,
  variant,
  className = "",
}: UserBadgeProps) {
  if (variant === "bar") {
    return (
      <div
        className={`flex items-center gap-3 rounded-lg px-4 h-11 border border-gray-700 ${className}`}
      >
        <div className="h-7 w-7 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow">
          <User size={14} className="text-white" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-sm font-semibold text-white block truncate max-w-[100px] leading-none mb-0.5">
            {userName}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold leading-none">
            {roleName}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600 ${className}`}
    >
      <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow">
        <User size={18} className="text-white" />
      </div>
      <div>
        <span className="font-semibold text-white text-sm block">
          {userName}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
          {roleName}
        </span>
      </div>
    </div>
  );
}
