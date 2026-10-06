// context/AppContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

// Tipos definidos
interface User { username: string; fk_id_rol: number; }
export interface ComponentData {
    id: string;
    type: string;
    name?: string;
    [key: string]: unknown; // Permitir props adicionales
}

interface AppContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    // Estado de Auth
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (userData: User) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AppContext.Provider value={{ user, login, logout }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext debe usarse dentro de un AppProvider');
    return context;
};