import axios from 'axios';
import { apiUrl } from '../../config';

const api = axios.create({
    baseURL: `${apiUrl}/api`,
});

// Este interceptor adjunta el token automáticamente a todas las peticiones
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const obtenerSensoresHA = async () => {
    try {
        const response = await api.get('/sensores');
        return response.data;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const obtenerSwitchesHA = async () => {
    try {
        const response = await api.get('/switches');
        return response.data;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export default api;