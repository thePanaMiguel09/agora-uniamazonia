import axios from 'axios';
import { apiUrl } from '../../config';
import { Activity, Eye, EyeOff, User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAppContext } from '../context/AppContext';
// 1. Importa el componente Particles
import Particles from '../components/Particles';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/login`, {
        username,
        password,
      });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      login(user);
      navigate("/dashboard");
    } catch (error) {
      setIsLoading(false);
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    // 2. Agregamos 'relative' y 'overflow-hidden' al contenedor principal
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4 overflow-hidden">

      {/* 3. Capa de Partículas (Fondo) */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={["#367c29", "#0bb116"]} // Colores acordes a tu marca
          particleCount={500}
          particleSpread={12}
          speed={0.15}
          particleBaseSize={200}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
          pixelRatio={window.devicePixelRatio || 1}
        />
      </div>

      {/* 4. Contenido (Z-10 para que flote sobre las partículas) */}
      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Logo y título */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-[#367c29] rounded-2xl shadow-lg">
              <Activity size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#367c29]">
            LabControl Pro
          </h1>
          <p className="text-gray-600 mt-2">Sistema de gestión de laboratorios</p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-green-100"
        >
          {/* ... (Todo tu código del formulario se mantiene igual) ... */}
          <div className="space-y-6">
            {/* Usuario */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <User size={20} />
                </span>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#367c29] focus:border-transparent transition-all duration-200"
                  placeholder="Ingresa tu usuario"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Lock size={20} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#367c29] focus:border-transparent transition-all duration-200"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <EyeOff size={20} className="text-gray-400" /> : <Eye size={20} className="text-gray-400" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#367c29] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#2a6a21] transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>© 2026 LabControl Pro. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}