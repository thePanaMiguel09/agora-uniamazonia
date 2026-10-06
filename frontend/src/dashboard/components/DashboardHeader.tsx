export function DashboardHeader() {
  return (
    <header className="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panel de Control General
        </h1>
        <p className="text-gray-600">
          Resumen del sistema de gestión de laboratorios - Monitoreo en tiempo
          real
        </p>
      </div>
      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium text-gray-700">
          Sistema Operativo
        </span>
      </div>
    </header>
  );
}
