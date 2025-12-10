import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper, Link as MuiLink } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import * as api from '../api/rutinas';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Llamar a la función de API con los datos del formulario
      const userData = await api.register(formData);
      
      console.log('Usuario registrado:', userData);
      setSuccess(true);
      
      // Opcional: Redirigir al login después de un breve mensaje
      setTimeout(() => {
        navigate('/'); // Redirige a la ruta principal, que mostrará el login
      }, 2000);

    } catch (err) {
      console.error('Error durante el registro:', err);
      // Intentar obtener el mensaje de error de FastAPI (ej: email duplicado 409)
      const detail = err.response?.data?.detail;
      if (detail && typeof detail === 'string') {
          setError(detail);
      } else {
          setError('Ocurrió un error al intentar registrar la cuenta.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        width: '100%', 
        bgcolor: '#f4f6f8'
      }}
    >
      <Paper elevation={6} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
          Crear Cuenta
        </Typography>
        <form onSubmit={handleSubmit}>
          
          <TextField
            fullWidth
            label="Nombre"
            name="nombre"
            variant="outlined"
            value={formData.nombre}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type="password"
            variant="outlined"
            value={formData.password}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? 'Registrando...' : 'REGISTRAR'}
          </Button>
          
          {success && <Alert severity="success" sx={{ mt: 2 }}>Registro exitoso. ¡Inicia sesión!</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            ¿Ya tienes cuenta? 
            <MuiLink component={RouterLink} to="/" sx={{ ml: 0.5 }}>
              Inicia sesión aquí
            </MuiLink>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default RegisterPage;