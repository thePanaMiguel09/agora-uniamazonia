export interface Alert {
  id: number;
  message: string;
  time: string;
  type: "warning" | "success" | "info";
  priority: "high" | "medium" | "low";
}

export interface SystemStats {
  totalLabs: number;
  activeLabs: number;
  totalUsers: number;
  activeSensors: number;
  totalDevices: number;
  automationEnabled: number;
  systemUptime: string;
  dataAccuracy: number;
}