import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import ComponentPanel from "../components/ComponentPanel";
import WaterValveControl from "../components/deviceControl/WaterValveControl";
import RealTimeCamera from "../components/deviceControl/RealTimeCamera";
import TemperatureControl from "../components/deviceControl/TemperatureControl";
import HumidityControl from "../components/deviceControl/HumidityControl";
import CreateProjectModal from '../modals/CreateProjectModal';
import { useHomeAssistant } from '../hooks/useHomeAssistant';
import type { ComponentData } from "../context/AppContext";
import api from "../api/api";
import AssignShelfModal from "../modals/AssignShelfModal";

interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  sensors?: { id: string; type: string; name: string }[];
}



const Projects = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const moduloState = location.state as { nombre: string; descripcion: string } | undefined;

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [editingProject, setEditingProject] = useState<Proyecto | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { haStates, sendHACommand } = useHomeAssistant();

  const [bombas, setBombas] = useState<ComponentData[]>([]);
  const [estantesDisponibles, setEstantesDisponibles] = useState<{id: number, name: string, projectName: string}[]>([]);
  const [showShelfSelector, setShowShelfSelector] = useState(false);
  const [pendingDevice, setPendingDevice] = useState<{type: string, name?: string} | null>(null);

  // Cargar bombas desde localStorage ya que el backend no tiene tabla dispositivos
  const fetchBombas = useCallback(() => {
    if (!id) return;
    const saved = localStorage.getItem(`bombas_proyecto_${id}`);
    if (saved) {
      setBombas(JSON.parse(saved));
    }
  }, [id]);

  // Fetch estantes (simulados, leyendo de los localStorage de los estantes)
  const fetchEstantes = useCallback(() => {
    if (!id) return;
    // En el frontend real original no hay ruta, así que usamos un mock o leemos de localStorage
    const allEstantes = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('estanterias_modulo_')) {
        const ests = JSON.parse(localStorage.getItem(key) || '[]');
        allEstantes.push(...ests.map((e: any) => ({ id: e.id, name: e.nombre, projectName: 'Módulo' })));
      }
    }
    setEstantesDisponibles(allEstantes);
  }, [id]);

  useEffect(() => {
    fetchBombas();
    fetchEstantes();
  }, [fetchBombas, fetchEstantes]);

  const saveBombasToStorage = (newBombas: ComponentData[]) => {
    setBombas(newBombas);
    if (id) {
      localStorage.setItem(`bombas_proyecto_${id}`, JSON.stringify(newBombas));
    }
  };

  const removeComponent = async (compId: string) => {
    const updatedBombas = bombas.filter(c => c.id !== compId);
    saveBombasToStorage(updatedBombas);
  };

  // Cargar proyectos desde la API
  const fetchProyectos = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/getProyectos/${id}`);
      const data = res.data.map((p: any) => ({
        id: p.ID_PROYECTO || p.id,
        nombre: p.NOMBRE_PROYECTO || p.nombre,
        descripcion: p.DESCRIPCION_PROYECTO || p.descripcion,
        estadoId: p.ESTADO_ID || '1',
        status: (p.ESTADO_ID || '1') === '1' ? 'activo' : (p.ESTADO_ID || '1') === '2' ? 'alerta' : 'inactivo',
        sensors: p.sensors || []
      }));
      setProyectos(data);
      console.log('Proyectos cargados:', data);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      setProyectos([]);
    }
  }, [id]);

  useEffect(() => {
    fetchProyectos();
  }, [fetchProyectos]);

  // Manejar cuando se arrastra sobre el área
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    try {
      const componentData = JSON.parse(data);
      if (componentData.type === 'valve') {
        setPendingDevice({ type: componentData.type, name: componentData.name });
        setShowShelfSelector(true);
      }
    } catch (error) {
      console.error('Error al procesar componente:', error);
    }
  };

  const handleAddComponent = (component: any) => {
    if (component.type === 'valve') {
      setPendingDevice({ type: component.type, name: component.name });
      setShowShelfSelector(true);
    }
    setIsPanelOpen(false);
  };

  const handleAssignShelf = async (shelfId: number, entityName: string) => {
    if (!pendingDevice) return;
    
    // Buscar el nombre del estante seleccionado para mostrarlo
    const estanteSeleccionado = estantesDisponibles.find(e => e.id === shelfId);
    
    const newBomba: ComponentData = {
      id: `${pendingDevice.type}-${Date.now()}`,
      type: pendingDevice.type,
      name: entityName,
      shelfId: shelfId,
      shelfName: estanteSeleccionado ? estanteSeleccionado.name : 'Estante ' + shelfId
    };
    
    const updatedBombas = [...bombas, newBomba];
    saveBombasToStorage(updatedBombas);
    setShowShelfSelector(false);
    setPendingDevice(null);
  };

  // Renderizar componente basado en el tipo
  const renderComponent = (component: ComponentData) => {
    return (
      <div className="relative group h-full">
        <button
          onClick={() => removeComponent(component.id as string)}
          className="absolute -top-2 -right-2 z-50 bg-red-500 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
          title="Eliminar dispositivo"
        >
          <span className="text-xs font-bold">✕</span>
        </button>

        <div className="h-48">
          {component.type === 'valve' && (
            <div>
              <WaterValveControl entityId={`switch.${component.name}`} haStates={haStates} onToggle={sendHACommand} />
              <div className="text-center mt-2 text-xs text-blue-600 bg-blue-100 py-1 rounded-md">
                Estante: {(component as any).shelfName}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleSaveProject = async (projectData: any) => {
    if (!id) {
      alert('Error: ID del módulo no encontrado');
      return;
    }

    try {
      const payload = {
        idproyecto: id,
        nombre: projectData.nombre,
        descripcion: projectData.descripcion
      };

      if (editingProject && editingProject.id !== 9999) {
        // Modo edición
        await api.put(`/updateProyecto/${editingProject.id}`, payload);
        setProyectos(prev => prev.map(p => p.id === editingProject.id ? {
          ...p,
          ...projectData,
        } : p));
      } else {
        // Modo creación
        const res = await api.post('/createProyecto', payload);
        const nuevoProyecto: Proyecto = {
          id: res.data.proyecto?.id,
          nombre: projectData.nombre,
          descripcion: projectData.descripcion,
          sensors: []
        };
        setProyectos(prev => [...prev, nuevoProyecto]);
      }

      setShowCreateForm(false);
      setEditingProject(null);
      console.log('Proyecto guardado exitosamente');
    } catch (error: any) {
      console.error('Error al guardar proyecto:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
      alert(`Hubo un error al guardar el proyecto: ${errorMsg}`);
    }
  };

  const handleDeleteProject = (projectId: number) => {
    if (window.confirm("¿Estás seguro de eliminar este proyecto?")) {
      (async () => {
        try {
          await api.delete(`/deleteProyecto/${projectId}`);
          setProyectos(prev => prev.filter(p => p.id !== projectId));
          console.log('Proyecto eliminado exitosamente');
        } catch (error) {
          console.error('Error al eliminar proyecto:', error);
          alert('Error al eliminar el proyecto');
        }
      })();
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6" style={{ zoom: 0.8 }}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Control del Modulo {moduloState?.nombre || "Nombre del modulo"}</h1>
          <button
            onClick={() => setIsPanelOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 cursor-pointer"
          >
            <span>+</span>
            Agregar Componente
          </button>
        </div>

        {/* Sensores estáticos del módulo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 mb-4">
          <TemperatureControl />
          <HumidityControl />
          <RealTimeCamera />
        </div>

        {/* Área de Drop para Componentes */}
        <div
          className="p-4 mb-4"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {bombas.length === 0 ? (
            // Estado vacío
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-blue-500 rounded-xl bg-gray-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📥</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay bombas instaladas
                </h3>
                <p className="text-gray-500 mb-4">
                  Arrastra una válvula de agua desde el panel o haz clic en "Agregar Componente"
                </p>
                <button
                  onClick={() => setIsPanelOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 items-center gap-2 cursor-pointer"
                >
                  Abrir Panel de Componentes
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Bombas de Riego (Válvulas)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {bombas.map((component) => (
                  <div key={component.id}>
                    {renderComponent(component)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sección de Proyectos */}
        <div className="p-4 flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full"></div>
            Proyectos Disponibles
          </h1>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setEditingProject(null);
                setShowCreateForm(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <span className="text-lg">+</span>
              Nuevo Proyecto
            </button>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {proyectos.map((proyecto) => (
            <ProjectCard
              key={proyecto.id}
              id={proyecto.id}
              nombre={proyecto.nombre}
              descripcion={proyecto.descripcion}
              sensors={proyecto.sensors}
              onEdit={() => {
                setEditingProject(proyecto);
                setShowCreateForm(true);
              }}
              onDelete={() => handleDeleteProject(proyecto.id)}
            />
          ))}
        </div>

      </div>

      <CreateProjectModal
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        editingProject={editingProject}
      />

      <ComponentPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onAddComponent={handleAddComponent}
        allowedTypes={['valve']}
      />

      {showShelfSelector && pendingDevice && (
        <AssignShelfModal
          isOpen={showShelfSelector}
          onClose={() => {
            setShowShelfSelector(false);
            setPendingDevice(null);
          }}
          onSave={(shelfId, entityName) => handleAssignShelf(shelfId, entityName)}
          estantes={estantesDisponibles}
          defaultName={pendingDevice.name || ''}
        />
      )}
    </div>
  );
};

export default Projects;