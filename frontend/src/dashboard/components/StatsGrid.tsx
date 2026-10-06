import {
  AlertTriangle,
  Building2,
  Cpu,
  Thermometer,
  Users,
} from "lucide-react";
import SummaryCard from "../../components/SummaryCard";
import type { SystemStats } from "../types/dashboard.types";

interface StatsGridProps {
  stats: SystemStats;
  alertCount: number;
}

export function StatsGrid({ stats, alertCount }: StatsGridProps) {
  const cards = [
    {
      title: "Laboratorios",
      value: stats.totalLabs,
      subtitle: `${stats.activeLabs} activos`,
      icon: Building2,
    },
    {
      title: "Sensores",
      value: stats.activeSensors,
      subtitle: "monitoreando",
      icon: Thermometer,
    },
    {
      title: "Accionadores",
      value: stats.totalDevices,
      subtitle: "conectados",
      icon: Cpu,
    },
    {
      title: "Alertas",
      value: alertCount,
      subtitle: "activas",
      icon: AlertTriangle,
    },
    {
      title: "Usuarios",
      value: stats.totalUsers,
      subtitle: "activos",
      icon: Users,
    },
  ];

  return (
    <section
      aria-label="Resumen del sistema"
      className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4"
    >
      {cards.map((card) => (
        <SummaryCard key={card.title} {...card} />
      ))}
    </section>
  );
}
