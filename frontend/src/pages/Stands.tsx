import { useState, useEffect, useCallback } from "react";
import ShelfCard from "../components/ShelfCard";
import ComponentPanel from "../components/ComponentPanel";
import CreateEstanteriaModal from "../modals/CreateEstanteriaModal";
import AssignDeviceModal from "../modals/AssignDeviceModal";
import AssignShelfModal from "../modals/AssignShelfModal";
import { useParams, useLocation } from "react-router-dom";
import api from "../api/api";

interface Estanteria {
  id: number;
  nombre: string;
  descripcion: string;
  status: "active" | "maintenance" | "inactive";
  sensors?: { id: string; type: string; name: string }[];
}

const Shelves = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [estanterias, setEstanterias] = useState<Estanteria[]>([]);
  const projectState = location.state as
    | { nombre?: string; descripcion?: string; id?: number }
    | undefined;
  const projectName = projectState?.nombre || "Proyecto";
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingEstanteria, setEditingEstanteria] = useState<Estanteria | null>(
    null,
  );

  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showShelfSelector, setShowShelfSelector] = useState(false);
  const [pendingDevice, setPendingDevice] = useState<{
    type: string;
    shelfId: number;
  } | null>(null);

  const fetchEstanterias = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/getEspaciosTrabajo/${id}`);
      const rawEstanterias = res.data;

      const estanteriasWithSensors = await Promise.all(
        rawEstanterias.map(async (est: any) => {
          const shelfId = est.ID_ESPACIO_TRABAJO || est.id;
          try {
            const devRes = await api.get(`/devices/espacio/${shelfId}`);
            return {
              id: shelfId,
              nombre: est.NOMBRE_ESPACIO_TRABAJO || est.nombre,
              descripcion:
                est.DESCRIPCION_ESPACIO_TRABAJO || est.descripcion || "",
              status: "active",
              sensors: devRes.data,
            };
          } catch (err) {
            console.error(`Error fetching devices for shelf ${shelfId}`, err);
            return {
              id: shelfId,
              nombre: est.NOMBRE_ESPACIO_TRABAJO || est.nombre,
              descripcion:
                est.DESCRIPCION_ESPACIO_TRABAJO || est.descripcion || "",
              status: "active",
              sensors: [],
            };
          }
        }),
      );
      setEstanterias(estanteriasWithSensors);
    } catch (error) {
      console.error("Error fetching estanterias:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchEstanterias();
  }, [fetchEstanterias]);

  const handleAddDeviceToShelf = async (type: string, shelfId: number) => {
    setPendingDevice({ type, shelfId });
    setShowDeviceModal(true);
  };

  const handleSaveDevice = async (entityName: string) => {
    if (!pendingDevice) return;
    try {
      await api.post("/devices/actuador", {
        type: pendingDevice.type,
        name: entityName,
        fk_id_espacio_trabajo: pendingDevice.shelfId,
      });
      fetchEstanterias();
      setShowDeviceModal(false);
      setPendingDevice(null);
    } catch (error) {
      console.error("Error saving device:", error);
      alert("Error al guardar el dispositivo");
    }
  };

  const handleDeleteDeviceFromShelf = async (deviceId: string) => {
    let deviceType = "";
    for (const est of estanterias) {
      const dev = est.sensors?.find((s) => String(s.id) === String(deviceId));
      if (dev) {
        deviceType = dev.type;
        break;
      }
    }
    if (!deviceType) return;

    if (window.confirm("¿Estás seguro de eliminar este dispositivo?")) {
      try {
        await api.delete(`/devices/espacio/${deviceType}/${deviceId}`);
        fetchEstanterias();
      } catch (error) {
        console.error("Error deleting device:", error);
        alert("Error al eliminar el dispositivo");
      }
    }
  };

  const handleAssignShelf = async (shelfId: number, entityName: string) => {
    if (!pendingDevice) return;
    try {
      await api.post("/devices/actuador", {
        type: pendingDevice.type,
        name: entityName,
        fk_id_espacio_trabajo: shelfId,
      });
      fetchEstanterias();
      setShowShelfSelector(false);
      setPendingDevice(null);
    } catch (error) {
      console.error("Error assigning device to shelf:", error);
      alert("Error al asignar el dispositivo");
    }
  };

  const handleSaveEstanteria = async (data: any) => {
    try {
      if (editingEstanteria && editingEstanteria.id !== 9999) {
        await api.put(`/updateEspacioTrabajo/${editingEstanteria.id}`, {
          nombre: data.nombre,
          descripcion: data.descripcion,
        });
      } else {
        await api.post("/createEspacioTrabajo", {
          idproyecto: id,
          nombre: data.nombre,
          descripcion: data.descripcion,
        });
      }
      fetchEstanterias();
      setShowCreateForm(false);
      setEditingEstanteria(null);
    } catch (error) {
      console.error("Error saving estanteria:", error);
      alert("Error al guardar el espacio de trabajo");
    }
  };

  const handleEditEstanteria = (estanteria: Estanteria) => {
    setEditingEstanteria(estanteria);
    setShowCreateForm(true);
  };

  const handleDeleteEstanteria = async (estanteriaId: number) => {
    if (window.confirm("¿Estás seguro de eliminar este espacio de trabajo?")) {
      try {
        await api.delete(`/deleteEspacioTrabajo/${estanteriaId}`);
        fetchEstanterias();
      } catch (error) {
        console.error("Error deleting estanteria:", error);
        alert("Error al eliminar el espacio de trabajo");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6" style={{ zoom: 0.8 }}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Control del Proyecto {projectName}
          </h1>
          <button
            onClick={() => setIsPanelOpen(true)}
            className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 cursor-pointer"
          >
            <span>+</span>
            Agregar Componente
          </button>
        </div>

        {/* Área de información */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
          <p className="text-blue-800 text-sm">
            Para agregar una luz o válvula a un estante, haz clic en "Agregar
            Componente" para abrir el panel, y luego <strong>arrastra</strong>{" "}
            el dispositivo directamente sobre la tarjeta de la estantería
            correspondiente.
          </p>
        </div>

        {/* Sección de tarjetas de estanterías */}
        <div className="p-4 flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-gray-700 to-gray-800 rounded-full"></div>
            Espacios de Trabajo Disponibles
          </h1>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setEditingEstanteria(null);
                setShowCreateForm(true);
              }}
              className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <span className="text-lg">+</span>
              Nueva Estantería
            </button>
          </div>
        </div>

        {/* Tarjetas de estanterías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
          {estanterias.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">
                No hay espacios de trabajo creados
              </p>
            </div>
          ) : (
            estanterias.map((estanteria) => (
              <ShelfCard
                key={estanteria.id}
                nombre={estanteria.nombre}
                status={estanteria.status}
                sensors={estanteria.sensors}
                onDelete={() => handleDeleteEstanteria(estanteria.id)}
                onEdit={() => handleEditEstanteria(estanteria)}
                onAddDevice={(type) =>
                  handleAddDeviceToShelf(type, estanteria.id)
                }
                onDeleteDevice={(deviceId) =>
                  handleDeleteDeviceFromShelf(deviceId)
                }
              />
            ))
          )}
        </div>
      </div>

      <ComponentPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        allowedTypes={["valve", "light"]}
        onAddComponent={(comp) => {
          setPendingDevice({ type: comp.type, shelfId: 0 });
          setShowShelfSelector(true);
          setIsPanelOpen(false);
        }}
      />

      {showDeviceModal && pendingDevice && (
        <AssignDeviceModal
          isOpen={showDeviceModal}
          onClose={() => {
            setShowDeviceModal(false);
            setPendingDevice(null);
          }}
          onSave={handleSaveDevice}
          deviceType={pendingDevice.type}
          defaultName=""
        />
      )}

      {showShelfSelector && pendingDevice && (
        <AssignShelfModal
          isOpen={showShelfSelector}
          onClose={() => {
            setShowShelfSelector(false);
            setPendingDevice(null);
          }}
          onSave={handleAssignShelf}
          estantes={estanterias.map((e) => ({
            id: e.id,
            name: e.nombre,
            projectName: projectName,
          }))}
          defaultName=""
        />
      )}

      <CreateEstanteriaModal
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setEditingEstanteria(null);
        }}
        onSave={handleSaveEstanteria}
        editingEstanteria={editingEstanteria}
      />
    </div>
  );
};

export default Shelves;
