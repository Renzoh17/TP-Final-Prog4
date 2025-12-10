import axios from 'axios';

// URL base de tu backend FastAPI
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
console.log('API_URL:', API_URL);

// --- Cliente Axios ---

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el token JWT en cada solicitud
api.interceptors.request.use(config => {
  // Asume que guardas el token en localStorage después del login
  const token = localStorage.getItem('access_token');
  if (token) {
    // El formato debe ser 'Bearer <token>'
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// --- Funciones de Autenticación (Básicas) ---

export const login = async (email, password) => {
  // El endpoint /login espera form-data (x-www-form-urlencoded), no JSON
  const formData = new URLSearchParams();
  formData.append('username', email); // Usa 'username' para el email
  formData.append('password', password);
  
  const response = await api.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  // Guarda el token para uso futuro
  localStorage.setItem('access_token', response.data.access_token);
  return response.data;
};

// Registro de Usuario
export const register = async (userData) => {
  // userData debe contener { nombre, email, password }
  const response = await api.post('/auth/register', userData);
  return response.data; // Devuelve el objeto UsuarioRead (sin contraseña)
};

// --- Funciones CRUD de Rutinas ---

// Listado y Paginación/Filtros
export const getPaginatedRoutines = async (pagina = 1, tamano_pagina = 10, dia = null) => {
  const params = { pagina, tamano_pagina };
  if (dia) params.dia = dia;
  
  const response = await api.get('/rutinas', { params });
  return response.data; // Devuelve RutinaPaginatedRead
};

// Búsqueda
export const searchRoutines = async (searchTerm) => {
  const response = await api.get('/rutinas/buscar', { 
    params: { nombre: searchTerm } 
  });
  return response.data; // Devuelve List<Rutina>
};

// Detalle
export const getRoutineDetail = async (id) => {
  const response = await api.get(`/rutinas/${id}`);
  return response.data; // Devuelve RutinaRead
};

// Creación
export const createRoutine = async (routineData) => {
  const response = await api.post('/rutinas', routineData);
  return response.data;
};

// Actualización
export const updateRoutine = async (id, routineData) => {
  const response = await api.put(`/rutinas/${id}`, routineData);
  return response.data;
};

// Eliminación
export const deleteRoutine = async (id) => {
  await api.delete(`/rutinas/${id}`);
};

// Copiar Rutina
export const copyRutina = async (id) => {
    const response = await api.post(`/rutinas/${id}/duplicar`); 
    
    return response.data; 
};

// --- Funciones CRUD de Ejercicios ---

// Función para añadir un nuevo ejercicio a una rutina existente
export const addExerciseToRoutine = async (rutinaId, exerciseData) => {
    const response = await api.post(`/rutinas/${rutinaId}/ejercicio`, exerciseData);
    return response.data; // Debe devolver el ejercicio creado con su ID
};

//Función para eliminar un ejercicio por su ID
export const deleteExercise = async (exerciseId) => {
    const response = await api.delete(`/ejercicios/${exerciseId}`);
    return response.data;
};

// Función para actualizar un ejercicio existente
export const updateExercise = async (exerciseId, exerciseData) => {
    const response = await api.put(`/ejercicios/${exerciseId}`, exerciseData); 
    return response.data; // Devuelve el ejercicio actualizado
};