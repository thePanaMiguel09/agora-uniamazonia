import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHomeAssistant } from '../hooks/useHomeAssistant';

interface AssignDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entityName: string) => void;
  deviceType: string;
  defaultName: string;
}

export default function AssignDeviceModal({ isOpen, onClose, onSave, deviceType, defaultName }: AssignDeviceModalProps) {
  const [entityName, setEntityName] = useState(defaultName || '');
  const { haStates } = useHomeAssistant();

  if (!isOpen) return null;

  // Filtrar entidades disponibles según el tipo de dispositivo
  let availableEntities: string[] = [];
  if (deviceType === 'light') {
    availableEntities = Object.keys(haStates).filter(key => key.startsWith('light.'));
  } else if (deviceType === 'valve') {
    availableEntities = Object.keys(haStates).filter(key => key.startsWith('switch.'));
  } else if (deviceType === 'camera') {
    // Actualmente HA states podría no traer cámaras en el websocket inicial, pero si existen:
    availableEntities = Object.keys(haStates).filter(key => key.startsWith('camera.'));
  } else if (deviceType === 'air-conditioner') {
    availableEntities = Object.keys(haStates).filter(key => key.startsWith('climate.'));
  } else {
    availableEntities = Object.keys(haStates);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityName) {
      alert('Debes ingresar o seleccionar un nombre para el dispositivo');
      return;
    }
    onSave(entityName);
  };

  const getDeviceTitle = () => {
    switch (deviceType) {
      case 'light': return 'Asignar Luz';
      case 'valve': return 'Asignar Válvula de Riego';
      case 'camera': return 'Asignar Cámara';
      case 'air-conditioner': return 'Asignar Aire Acondicionado';
      default: return 'Asignar Dispositivo';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-[160]"
        >
          <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4">
            <h2 className="text-xl font-bold text-white">{getDeviceTitle()}</h2>
            <p className="text-gray-300 text-sm mt-1">Selecciona la entidad correspondiente de Home Assistant</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identificador en Home Assistant
              </label>
              
              {availableEntities.length > 0 ? (
                <select
                  required
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                  <option value="" disabled>Selecciona una entidad disponible...</option>
                  {availableEntities.map((entityId) => (
                    <option key={entityId} value={entityId}>
                      {entityId}
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  <input
                    type="text"
                    required
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder={`ej: ${deviceType === 'camera' ? 'camera.lab_1' : 'sensor.xyz'}`}
                  />
                  <p className="text-xs text-yellow-600 mt-1">
                    No se detectaron entidades de este tipo automáticamente. Puedes escribir el ID manualmente si estás seguro de que existe.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-black hover:to-black text-white rounded-lg font-medium shadow-md transition-all"
              >
                Guardar Dispositivo
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
