// src/utils/componentRegistry.tsx
import React from 'react';
import AirConditionerControl from '../components/deviceControl/AirConditionerControl';


// Registry principal
export const componentRegistry = {
  'air-conditioner': AirConditionerControl
};

export type ComponentType = keyof typeof componentRegistry;

export const getComponentFromRegistry = (type: string): React.ComponentType<{ onRemove?: () => void }> | null => {
  return componentRegistry[type as ComponentType] || null;
};

export const isValidComponentType = (type: string): type is ComponentType => {
  return type in componentRegistry;
};