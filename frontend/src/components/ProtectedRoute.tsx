// components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function ProtectedRoute() {
    const { user } = useAppContext();

    // Si no hay usuario, mandamos al Login (o a la ruta que sea tu pantalla de inicio)
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Si el usuario existe, el guardia permite ver el contenido (Outlet)
    return <Outlet />;
}