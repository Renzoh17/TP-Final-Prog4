import React, { useState, useEffect } from 'react';
import { Container, Typography, CircularProgress, Alert, Box, Button, Grid, Paper } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import EjercicioItem from '../components/EjercicioItem';
import * as api from '../api/rutinas';

const RutinaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rutina, setRutina] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dayOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  useEffect(() => {
    const fetchRoutine = async () => {
      setLoading(true);
      try {
        const data = await api.getRoutineDetail(id);
        setRutina(data);
      } catch (err) {
        setError('No se pudo cargar el detalle de la rutina. Por favor, verifica el ID.');
      } finally {
        setLoading(false);
      }
    };
    fetchRoutine();
  }, [id]);

  if (loading) return <CircularProgress sx={{ m: 5 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!rutina) return <Alert severity="warning">Rutina no encontrada.</Alert>;

  // Agrupar ejercicios por día y ordenar por el array dayOrder
  const exercisesByDay = rutina.ejercicios.reduce((acc, exercise) => {
    const day = exercise.dia_semana;
    if (!acc[day]) acc[day] = [];
    acc[day].push(exercise);
    return acc;
  }, {});
  
  const daysWithExercises = Object.keys(exercisesByDay)
    .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: '600' }}>
        {rutina.nombre}
      </Typography>
      
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Grid sx={{ xs: 12, sm: 8 }} >
          <Typography variant="body1" color="text.secondary" paragraph>
            {rutina.descripcion || 'Sin descripción detallada.'}
          </Typography>
        </Grid>
        <Grid sx={{ xs: 12, sm: 4, textAlign: { sm: 'right' } }}>
          <Button 
            variant="contained" 
            onClick={() => navigate(`/rutinas/${id}/editar`)}
          >
            Editar Rutina
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ borderBottom: '1px solid #ddd', pb: 1 }}>
          Ejercicios Asignados ({rutina.ejercicios.length})
        </Typography>
        
        {daysWithExercises.length === 0 && (
            <Alert severity="info">Esta rutina aún no tiene ejercicios.</Alert>
        )}

        {daysWithExercises.map(day => (
          <Box key={day} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: 'primary.main', mt: 2, mb: 1 }}>
              {day}
            </Typography>
            <Paper elevation={1} sx={{ p: 2, bgcolor: '#f9f9f9' }}>
              {/* Mapear ejercicios, asegurando el orden correcto */}
              {exercisesByDay[day].sort((a, b) => a.orden - b.orden).map((ejercicio, index) => (
                <EjercicioItem key={`${ejercicio.id}-${index}`} ejercicio={ejercicio} />
              ))}
            </Paper>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default RutinaDetail;