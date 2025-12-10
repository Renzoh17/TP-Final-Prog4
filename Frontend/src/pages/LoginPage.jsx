import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import * as api from '../api/rutinas';
import { Link } from 'react-router-dom';

const LoginPage = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.login(email, password);
      // Si el login es exitoso, actualiza el estado en App.jsx
      setIsAuthenticated(true); 
    } catch (err) {
      console.error(err);
      setError('Credenciales inválidas. Por favor, revisa tu email y contraseña.');
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
        bgcolor: '#f4f6f8',
        minHeight: '100vh',
        width: '100%'
      }}
    >
      <Paper elevation={6} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
          Iniciar Sesión
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Cargando...' : 'Acceder'}
          </Button>
          
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;