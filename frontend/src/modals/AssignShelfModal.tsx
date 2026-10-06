import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHomeAssistant } from '../hooks/useHomeAssistant';

interface AssignShelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shelfId: number, entityName: string) => void;
  estantes: { id: number; name: string; projectName: string }[];
  defaultName: string;
}

export default function AssignShelfModal({ isOpen, onClose, onSave, estantes, defaultName }: AssignShelfModalProps) {
  const [selectedShelf, setSelectedShelf] = useState<number | ''>('');
  const [entityName, setEntityName] = useState(defaultName || '');
  const { haStates } = useHomeAssistant();

  // Filtrar solo las entidades que podrían ser bombas (switches)
  const availablePumps = Object.keys(haStates).filter(key => key.startsWith('switch.'));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedShelf === '') {
      alert('Debes seleccionar un estante');
      return;
    }
    if (!entityName) {
      alert('Debes ingresar un nombre para la bomba');
      return;
    }
    onSave(Number(selectedShelf), entityName);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Asignar Bomba a Estante</h2>
            <p className="text-blue-100 text-sm mt-1">Selecciona dónde se ubicará esta bomba de riego</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identificador en Home Assistant (Bomba/Válvula)
              </label>
              {availablePumps.length > 0 ? (
                <select
                  required
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                  <option value="" disabled>Selecciona una entidad disponible...</option>
                  {availablePumps.map((pumpId) => (
                    <option key={pumpId} value={pumpId}>
                      {pumpId}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                    placeholder="ej: switch.sonoff_xyz o lampara_1"
                  />
                  <p className="text-xs text-yellow-600 mt-1">No se detectaron entidades automáticamente. Puedes escribir el ID manualmente.</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estante de Destino
              </label>
              <select
                required
                value={selectedShelf}
                onChange={(e) => setSelectedShelf(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
              >
                <option value="" disabled>Selecciona un estante...</option>
                {estantes.map((estante) => (
                  <option key={estante.id} value={estante.id}>
                    {estante.projectName} - {estante.name}
                  </option>
                ))}
              </select>
            </div>

            {estantes.length === 0 && (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">
                No hay estantes disponibles en este módulo. Crea uno primero entrando a un Proyecto.
              </p>
            )}

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
                disabled={estantes.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium shadow-md shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar Bomba
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
