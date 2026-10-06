import { createBrowserRouter } from "react-router";
import Login from "../pages/Login";
import { LaboratoryLayout } from "../laboratory/layouts/LaboratoryLayout";

// import Dashboard from "../pages/Dashboard";

import UsersManagement from "../pages/UsersManagement";
import LaboratoriesManagement from "../pages/LaboratoriesManagement";
import Laboratory from "../pages/Laboratory";
import Projects from "../pages/Projects";
import Shelves from "../pages/Stands";
import Sensors from "../pages/Sensors";
import Settings from "../pages/Settings";
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "../dashboard/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <LaboratoryLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "users", element: <UsersManagement /> },
          { path: "laboratories", element: <LaboratoriesManagement /> },
          { path: "laboratory/:id", element: <Laboratory /> },
          { path: "projects/:id", element: <Projects /> },
          { path: "stands/:id", element: <Shelves /> },
          { path: "sensors", element: <Sensors /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
]);
