import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function ProtectedRoute() {
  
    const { user } = useAppContext();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}