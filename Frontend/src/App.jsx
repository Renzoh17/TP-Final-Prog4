import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { CssBaseline, AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

// Importación de las páginas
import RutinaList from './pages/RutinaList';
import RutinaDetail from './pages/RutinaDetail';
import RutinaForm from './pages/RutinaForm';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// --- Componente de Navegación y Sesión ---
const AuthWrapper = ({ children }) => {
  // Estado para verificar si hay un token en el almacenamiento local
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    // Forzar la actualización del estado para redirigir al login
    setIsAuthenticated(false); 
  };
  
  // Si el usuario no está autenticado, renderizar la página de login
  if (!isAuthenticated) {
    // La página de login se encarga de llamar a setIsAuthenticated(true) al loguearse.
    return <LoginPage setIsAuthenticated={setIsAuthenticated} />;
  }

  // Si está autenticado, renderizar la estructura con el navbar y el contenido
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
            Gestor de Rutinas
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            SALIR
          </Button>
        </Toolbar>
      </AppBar>
      
      {/* El contenido principal (children) ocupa el espacio restante */}
      <Container sx={{ flexGrow: 1, py: 3 }}> 
        {children}
      </Container>
    </Box>
  );
};


// --- Componente Principal de la Aplicación ---
function App() {
  return (
    <Router>
      {/* CssBaseline restablece el CSS para consistencia */}
      <CssBaseline />
      <Routes>
        
        {/* ======================================= */}
        {/* RUTAS PÚBLICAS (Login y Registro) */}
        {/* ======================================= */}
        
        {/* La ruta de login se maneja directamente en AuthWrapper si no hay token */}
        { <Route path="/register" element={<RegisterPage />} />}

        {/* ======================================= */}
        {/* RUTAS PROTEGIDAS (Envueltas en AuthWrapper) */}
        {/* ======================================= */}

        {/* Ruta principal - Listado de Rutinas */}
        <Route path="/" element={<AuthWrapper> <RutinaList /> </AuthWrapper>} />
        
        {/* Ruta de Detalle */}
        <Route path="/rutinas/:id" element={<AuthWrapper> <RutinaDetail /> </AuthWrapper>} />
        
        {/* Ruta de Creación */}
        <Route path="/rutinas/crear" element={<AuthWrapper> <RutinaForm /> </AuthWrapper>} />
        
        {/* Ruta de Edición (Usa el mismo componente con el prop 'id' de la URL) */}
        <Route path="/rutinas/:id/editar" element={<AuthWrapper> <RutinaForm /> </AuthWrapper>} />
        
        {/* Manejo de rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;