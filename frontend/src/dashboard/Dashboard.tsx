import { useMemo } from "react";

import {
  canAccess,
  DEFAULT_ROLE,
  type RoleId,
} from "../components/shared/navBar/utils/Navbar.config";

import AlertsPanel from "../components/AlertsPanel";
import { DashboardHeader } from "./components/DashboardHeader";
import { QuickActions } from "./components/QuickActions";
// import { RecentActivityList } from "./components/RecentActivityList";
import { StatsGrid } from "./components/StatsGrid";

import { useAppContext } from "../context/AppContext";
import { useAlerts } from "./hooks/useAlterts";
import { useDashboardData } from "./hooks/useDashboardData";

import { QUICK_ACTIONS } from "./utils/dashboard.config";

export default function Dashboard() {
  const { user } = useAppContext();
  const roleId = (user?.fk_id_rol ?? DEFAULT_ROLE) as RoleId;

  const { stats, error } = useDashboardData();
  const alerts = useAlerts();

  const quickActions = useMemo(
    () => QUICK_ACTIONS.filter((action) => canAccess(action, roleId)),
    [roleId],
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <DashboardHeader />

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <StatsGrid stats={stats} alertCount={alerts.length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
        <div className="lg:col-span-2 space-y-6">
          <QuickActions actions={quickActions} />
          {/* <RecentActivityList activities={activities} /> */}
        </div>

        <div className="lg:col-span-1">
          <AlertsPanel alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
