// src/pages/Laboratory.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import ComponentPanel from "../components/ComponentPanel";
import AirConditionerControl from "../components/deviceControl/AirConditionerControl";
import LightControl from "../components/deviceControl/LightControl";
import RealTimeCamera from "../components/deviceControl/RealTimeCamera";
import WaterValveControl from "../components/deviceControl/WaterValveControl";
import type { ComponentData } from "../context/AppContext";
import { ReactSortable } from "react-sortablejs";
import LabRoomCard from "../components/LabRoomCard";
import CreateSalaModal from "../modals/CreateModuloModal";
import api from "../api/api";
import { useHomeAssistant } from "../hooks/useHomeAssistant";
import AssignDeviceModal from "../modals/AssignDeviceModal";

const Laboratory = () => {
  const { id } = useParams<{ id: string }>();

  const [selectedLabName, setSelectedLabName] = useState<string>("Cargando...");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSalaModalOpen, setIsSalaModalOpen] = useState(false);
  const [laboratoryComponents, setLaboratoryComponents] = useState<
    ComponentData[]
  >([]);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [pendingDeviceType, setPendingDeviceType] = useState<string>("");

  // Fetch devices from localStorage ya que el backend no tiene endpoints para esto
  const fetchLayout = useCallback(() => {
    if (!id) return;
    const saved = localStorage.getItem(`laboratoryComponents_${id}`);
    if (saved) {
      setLaboratoryComponents(JSON.parse(saved));
    }
  }, [id]);

  const saveComponentsToStorage = (newComponents: ComponentData[]) => {
    setLaboratoryComponents(newComponents);
    if (id) {
      localStorage.setItem(
        `laboratoryComponents_${id}`,
        JSON.stringify(newComponents),
      );
    }
  };

  useEffect(() => {
    fetchLayout();
  }, [fetchLayout]);

  const addComponent = async (comp: {
    type: string;
    name?: string;
    [key: string]: unknown;
  }) => {
    // Open modal to select HA entity
    setPendingDeviceType(comp.type);
    setShowDeviceModal(true);
  };

  const handleSaveDevice = async (entityName: string) => {
    const newComponent: ComponentData = {
      id: `${pendingDeviceType}-${Date.now()}`,
      type: pendingDeviceType,
      name: entityName,
    };
    const updated = [...laboratoryComponents, newComponent];
    saveComponentsToStorage(updated);
    setShowDeviceModal(false);
    setPendingDeviceType("");
  };

  const removeComponent = async (compId: string, _type: string) => {
    const updated = laboratoryComponents.filter((c) => c.id !== compId);
    saveComponentsToStorage(updated);
  };

  const updateComponentOrder = (list: ComponentData[]) => {
    // Database ordering is not supported directly without an order column,
    // so we just update the local state for visual drag-and-drop.
    setLaboratoryComponents(list);
  };

  // Estado WebSocket
  const { haStates, sendHACommand } = useHomeAssistant();

  const [modulos, setModulos] = useState<
    Array<{
      id: number;
      nombre: string;
      descripcion: string;
      estado?: string;
      estadoId?: string;
      sensors?: { id: string; type: string; name: string }[];
    }>
  >([]);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  // Efecto para cargar el nombre del laboratorio cuando el ID cambia
  useEffect(() => {
    if (id) {
      const fetchLabName = async () => {
        try {
          const res = await api.get("/getLaboratorios");
          const lab = res.data.find((l: any) => l.id.toString() === id);
          if (lab) {
            setSelectedLabName(lab.name || lab.nombre || "Laboratorio");
            console.log("Laboratorio cargado:", lab.name || lab.nombre);
          } else {
            console.warn(`No se encontró laboratorio con id ${id}`);
            setSelectedLabName("Laboratorio no encontrado");
          }
        } catch (error) {
          console.error("Error al cargar laboratorio:", error);
          setSelectedLabName("Error al cargar laboratorio");
        }
      };
      fetchLabName();
    }
  }, [id]);

  const fetchModulos = useCallback(async () => {
    try {
      if (!id) return; // Si no hay ID, no hacer la llamada
      const res = await api.get(`/getModulos/${id}`);
      const data = res.data.map((m: any) => ({
        id: m.ID_MODULO,
        nombre: m.NOMBRE_MODULO,
        descripcion: m.DESCRIPCION_MODULO,
      }));
      setModulos(data);
      console.log("Módulos cargados:", data);
    } catch (error) {
      console.error("Error al cargar módulos:", error);
      setModulos([]);
    }
  }, [id]);

  useEffect(() => {
    fetchModulos();
  }, [fetchModulos]);

  const handleEditModulo = (modulo: any) => {
    setEditingRoom(modulo);
    setIsSalaModalOpen(true);
  };

  const handleDeleteModulo = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este módulo?")) {
      try {
        await api.delete(`/deleteModulo/${id}`);
        setModulos((prev) => prev.filter((modulo) => modulo.id !== id));
      } catch (error) {
        console.error("Error al eliminar módulo:", error);
      }
    }
  };

  const handleSaveSala = async (moduloData: any) => {
    try {
      // 1. Preparamos el objeto que se enviará al backend
      // Asegúrate de que los nombres de los campos coincidan con lo que espera tu API
      const payload = {
        idlaboratorio: id,
        nombre: moduloData.nombre,
        descripcion: moduloData.descripcion,
        // El ID del laboratorio que viene de useParams
      };

      if (editingRoom) {
        // --- MODO EDICIÓN ---
        // Actualizamos el estado local primero para que los sensores se reflejen
        // visualmente sin depender del backend, que no persiste sensores todavia.
        setModulos((prev) =>
          prev.map((m) =>
            m.id === editingRoom.id
              ? {
                  ...m,
                  nombre: moduloData.nombre,
                  descripcion: moduloData.descripcion,
                  estadoId: moduloData.estadoId,
                  sensors: moduloData.sensors || [],
                }
              : m,
          ),
        );

        setIsSalaModalOpen(false);
        setEditingRoom(null);

        if (editingRoom.id !== 9999) {
          api.put(`/updateModulo/${editingRoom.id}`, payload).catch((error) => {
            console.error("Error al actualizar modulo:", error);
            alert(
              "Los sensores quedaron visibles, pero no se pudo actualizar el nombre o la descripcion en el servidor.",
            );
          });
        }

        return;
      } else {
        // --- MODO CREACIÓN ---
        const response = await api.post("/createModulo", payload);

        // Es mejor recargar los módulos para obtener el ID real generado por la DB
        // Pero si quieres agregarlo manualmente:
        const nuevoModulo = {
          id: response.data.id || Date.now(), // ID devuelto por la DB
          nombre: moduloData.nombre,
          descripcion: moduloData.descripcion,
          estadoId: moduloData.estadoId,
          sensors: moduloData.sensors || [],
        };

        setModulos((prev) => [...prev, nuevoModulo]);
      }

      // Cerrar modal y limpiar
      setIsSalaModalOpen(false);
      setEditingRoom(null);
    } catch (error) {
      console.error("Error al guardar módulo:", error);
      alert(
        "Hubo un error al intentar guardar el módulo. Por favor, verifica la conexión.",
      );
    }
  };

  const getModuloStatus = (
    estadoId?: string,
    estado?: string,
  ): "activo" | "mantenimiento" | "inactivo" => {
    if (estadoId === "2") return "mantenimiento";
    if (estadoId === "3") return "inactivo";
    if (estado?.toLowerCase() === "mantenimiento") return "mantenimiento";
    if (estado?.toLowerCase() === "inactivo") return "inactivo";
    return "activo";
  };

  // Manejar drop de componentes
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    try {
      const componentData = JSON.parse(
        e.dataTransfer.getData("application/json"),
      );
      addComponent(componentData);
    } catch (error) {
      console.error("Error al procesar el componente:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  // Renderizar componente basado en el tipo
  const renderComponent = (component: ComponentData) => {
    return (
      <div className="relative group h-full">
        {/* Botón de eliminar (Aparece al hacer hover) */}
        <button
          onClick={() =>
            removeComponent(component.id as string, component.type)
          }
          className="absolute -top-2 -right-2 z-50 bg-red-500 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
          title="Eliminar dispositivo"
        >
          <span className="text-xs font-bold">✕</span>
        </button>

        {/* Renderizado dinámico del componente */}
        <div className="h-48">
          {component.type === "air-conditioner" && <AirConditionerControl />}
          {component.type === "light" && (
            <LightControl
              entityId="light.lampara_1" // Entidad de luz real
              haStates={haStates}
              onToggle={sendHACommand}
            />
          )}
          {component.type === "camera" && <RealTimeCamera />}
          {component.type === "valve" && (
            <WaterValveControl
              entityId="switch.bomba_1" // Entidad switch (bomba)
              haStates={haStates}
              onToggle={sendHACommand}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6" style={{ zoom: 0.8 }}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Control del Laboratorio {selectedLabName}
          </h1>
          {/* <button
            onClick={() => setIsPanelOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 cursor-pointer"
          >
            <span>+</span>
            Agregar Componente
          </button> */}
        </div>

        {/* Sección de tarjetas de laboratorios */}
        <div className="p-4 flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-emerald-600 to-green-700 rounded-full"></div>
            Módulos Disponibles
          </h1>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setEditingRoom(null);
                setIsSalaModalOpen(true);
              }}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <span className="text-lg">+</span>
              Nuevo Módulo
            </button>
          </div>
        </div>

        {/* Tarjetas de Módulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
          {modulos.length > 0 ? (
            modulos.map((modulos) => (
              <LabRoomCard
                key={modulos.id}
                id={modulos.id}
                nombre={modulos.nombre}
                descripcion={modulos.descripcion}
                status={getModuloStatus(modulos.estadoId, modulos.estado)}
                sensors={modulos.sensors}
                onEdit={() => handleEditModulo(modulos)}
                onDelete={() => handleDeleteModulo(modulos.id)}
              />
            ))
          ) : (
            <div className="col-span-2 flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🏠</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                No hay módulos registrados
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Crea tu primer módulo para comenzar
              </p>
              <button
                onClick={() => {
                  setEditingRoom(null);
                  setIsSalaModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 cursor-pointer"
              >
                <span>+</span> Crear Módulo
              </button>
            </div>
          )}
        </div>

        {/* Área de trabajo con drag and drop */}
        <div
          className="p-4 mb-4"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {laboratoryComponents.length === 0 ? (
            // Estado vacío
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-emerald-500 rounded-xl bg-gray-300 ">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📥</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay componentes
                </h3>
                <p className="text-gray-500 mb-4">
                  Arrastra componentes desde el panel o haz clic en "Agregar
                  Componente"
                </p>
                <button
                  onClick={() => setIsPanelOpen(true)}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 items-center gap-2 cursor-pointer"
                >
                  Abrir Panel de Componentes
                </button>
              </div>
            </div>
          ) : (
            // Grid de componentes con ReactSortable
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Componentes de Control
              </h2>
              <ReactSortable
                list={laboratoryComponents}
                setList={updateComponentOrder}
                animation={200}
                delayOnTouchOnly={true}
                delay={100}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6"
              >
                {laboratoryComponents.map((component) => (
                  <div key={component.id} className="cursor-move">
                    {renderComponent(component)}
                  </div>
                ))}
              </ReactSortable>
            </div>
          )}
        </div>
      </div>

      {/* Modales reubicados fuera del zoom */}
      <ComponentPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onAddComponent={(comp) => {
          addComponent(comp);
          setIsPanelOpen(false);
        }}
        allowedTypes={["camera", "air-conditioner"]}
      />

      {showDeviceModal && (
        <AssignDeviceModal
          isOpen={showDeviceModal}
          onClose={() => setShowDeviceModal(false)}
          onSave={handleSaveDevice}
          deviceType={pendingDeviceType}
          defaultName=""
        />
      )}

      <CreateSalaModal
        isOpen={isSalaModalOpen}
        onClose={() => {
          setIsSalaModalOpen(false);
          setEditingRoom(null);
        }}
        onSave={handleSaveSala}
        editingRoom={
          editingRoom
            ? {
                nombre: editingRoom.nombre,
                descripcion: editingRoom.descripcion,
                estadoId:
                  editingRoom.estadoId ||
                  (editingRoom.estado === "Activo" ? "1" : "3"),
                sensors: editingRoom.sensors || [],
              }
            : null
        }
      />
    </div>
  );
};

export default Laboratory;
