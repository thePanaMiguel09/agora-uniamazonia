import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import UsersManagement from "./pages/UsersManagement";
import Laboratory from "./pages/Laboratory";
import LaboratoriesManagement from "./pages/LaboratoriesManagement";
import Project from "./pages/Projects";
import Stand from "./pages/Stands";
import Sensors from "./pages/Sensors";
import Settings from "./pages/Settings";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/laboratory/:id" element={<Laboratory />} />
            <Route path="/laboratories-management" element={<LaboratoriesManagement />} />
            <Route path="/project/:id" element={<Project />} />
            <Route path="/stand/:id" element={<Stand />} />
            <Route path="/sensors" element={<Sensors />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;