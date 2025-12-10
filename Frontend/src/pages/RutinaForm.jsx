import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, TextField, Button, Box, Paper, CircularProgress, Alert,
    Grid, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import EjercicioItem from '../components/EjercicioItem';
import * as api from '../api/rutinas';

// Estado inicial de la rutina
const initialRutinaState = {
  nombre: '',
  descripcion: ''
};

// Estado inicial del nuevo ejercicio
const initialNewExerciseState = {
    nombre: '',
    dia_semana: 'Lunes', // Valor inicial para el select
    series: 3,
    repeticiones: 12,
    peso: 0,
    orden: 1, // Se calculará automáticamente, pero se necesita un valor
    notas: ''
};

// Días de la semana para el Select
const diasSemana = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];


const RutinaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id; 
 
  const [rutinaData, setRutinaData] = useState(initialRutinaState);
  const [ejercicios, setEjercicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // ESTADO PARA EL MODAL DE EDICIÓN
  const [openEditModal, setOpenEditModal] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  // LÓGICA PARA INICIAR LA EDICIÓN
  const handleOpenEditModal = (exerciseToEdit) => {
      setCurrentExercise(exerciseToEdit); // Carga los datos del ejercicio seleccionado
      setOpenEditModal(true); // Abre el modal
  };
  // LÓGICA PARA CERRAR EL MODAL
  const handleCloseEditModal = () => {
      setOpenEditModal(false);
      setCurrentExercise(null); // Limpia el ejercicio en edición
  };
  // LÓGICA PARA MANEJAR CAMBIOS EN EL FORMULARIO DEL MODAL
  const handleModalChange = (e) => {
      const { name, value } = e.target;
      const finalValue = ['series', 'repeticiones', 'peso', 'orden'].includes(name) 
                         ? Number(value) : value;
                           
      setCurrentExercise(prev => ({ ...prev, [name]: finalValue }));
  };

  // FUNCIÓN PARA GUARDAR LA EDICIÓN
  const handleUpdateExercise = async (e) => {
      e.preventDefault();
      if (!currentExercise || !currentExercise.id) return;

      setAdding(true); // Reutilizamos 'adding' para el estado de carga
      try {
          // Llamar a la API de actualización
          const updatedExercise = await api.updateExercise(currentExercise.id, currentExercise);

          // Actualizar la lista de ejercicios en el estado local
          setEjercicios(prev => 
              prev.map(ex => (ex.id === updatedExercise.id ? updatedExercise : ex))
              );

          alert('Ejercicio actualizado con éxito!');
          handleCloseEditModal(); // Cerrar el modal
      } catch (err) {
          setError(err.response?.data?.detail || 'Error al actualizar el ejercicio.');
      } finally {
          setAdding(false);
      }
  };
  
  // ESTADO PARA EL FORMULARIO DE NUEVO EJERCICIO
  const [newEjercicioData, setNewEjercicioData] = useState(initialNewExerciseState);
  const [adding, setAdding] = useState(false); // Estado para el botón de Agregar

  // Efecto para cargar datos en modo edición
  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      api.getRoutineDetail(id)
         .then(data => {
           setRutinaData({ nombre: data.nombre, descripcion: data.descripcion });
          setEjercicios(data.ejercicios);
          // Calcula el siguiente orden basándose en el ejercicio más alto
          const nextOrder = data.ejercicios.length > 0 
           ? Math.max(...data.ejercicios.map(e => e.orden)) + 1 
           : 1;
          setNewEjercicioData(prev => ({ ...prev, orden: nextOrder }));
        })
        .catch(err => setError('Error al cargar la rutina.'))
        .finally(() => setLoading(false));
      }
   }, [id, isEditing]);

  const handleChange = (e) => {
  const { name, value } = e.target;
    setRutinaData(prev => ({ ...prev, [name]: value }));
  };
  
  // Función para manejar cambios en el formulario de NUEVO EJERCICIO
  const handleChangeNewEjercicio = (e) => {
    const { name, value } = e.target;
    // Convierte a número si son campos numéricos
    const finalValue = ['series', 'repeticiones', 'peso', 'orden'].includes(name) 
                       ? Number(value) : value;
    setNewEjercicioData(prev => ({ ...prev, [name]: finalValue }));
  };

  // Función para agregar el ejercicio
  const handleAddExercise = async (e) => {
    e.preventDefault();
    if (!isEditing) return; // Solo permitir agregar en modo edición
    
    setAdding(true);
    try {
      // Llamar a la API para crear el ejercicio
      const nuevoEjercicio = await api.addExerciseToRoutine(id, newEjercicioData);

      // Actualizar la lista local de ejercicios
      const updatedExercises = [...ejercicios, nuevoEjercicio];
      setEjercicios(updatedExercises);

      // Calcular el siguiente orden
      const nextOrder = updatedExercises.length > 0
        ? Math.max(...updatedExercises.map(e => e.orden)) + 1
        : 1;
       
      // Resetear el formulario
      setNewEjercicioData({ ...initialNewExerciseState, orden: nextOrder });
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al agregar el ejercicio.');
    } finally {
      setAdding(false);
    }
  };

  // handleSubmit (se mantiene igual)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
       if (isEditing) {
        // Modo Edición: Actualizar campos principales
        await api.updateRoutine(id, rutinaData);
        alert('Rutina actualizada exitosamente!');
      } else {
        // Modo Creación: Crear la rutina
        const newRoutine = await api.createRoutine(rutinaData);
        alert(`Rutina "${newRoutine.nombre}" creada! Ahora gestiona los ejercicios.`);
        // Navegar a la vista de edición para que el usuario añada ejercicios
        navigate(`/rutinas/${newRoutine.id}/editar`);
        return; 
      }
      navigate(`/rutinas/${id}`); // Volver al detalle después de editar
    } catch (err) {
      // Capturar errores del backend (ej: nombre no único)
      setError(err.response?.data?.detail || 'Error en la operación de rutina.');
    } finally {
      setLoading(false);
    }
  };


  // Lógica para gestionar ejercicios
  const handleDeleteExercise = async (ejercicioId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este ejercicio?')) return;

    try {
      await api.deleteExercise(ejercicioId); 

      const updatedExercises = ejercicios.filter(ex => ex.id !== ejercicioId);
      setEjercicios(updatedExercises);
      const nextOrder = updatedExercises.length > 0
        ? Math.max(...updatedExercises.map(e => e.orden)) + 1
        : 1;
      setNewEjercicioData(prev => ({ ...prev, orden: nextOrder }));

    } catch (err) {
      alert('Error al eliminar el ejercicio.');
    }
  };

  // Si la rutina está cargando en edición
  if (loading && isEditing) return <CircularProgress sx={{ m: 5 }} />;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditing ? `📝 Editar: ${rutinaData.nombre}` : '➕ Crear Nueva Rutina'}
      </Typography>
 
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Detalles Principales</Typography>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Nombre" name="nombre" value={rutinaData.nombre} onChange={handleChange} required sx={{ mb: 3 }} />
          <TextField fullWidth label="Descripción" name="descripcion" value={rutinaData.descripcion} onChange={handleChange} multiline rows={3} sx={{ mb: 3 }} />
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {isEditing ? 'Guardar Cambios' : 'Crear Rutina'}
          </Button>
        </form>
      </Paper>
      {/* Sección de Ejercicios Anidados (Solo en Modo Edición) */}
      {isEditing && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>Gestión de Ejercicios</Typography>
 
          {/* FORMULARIO PARA AGREGAR NUEVO EJERCICIO (IMPLEMENTADO) */}
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Añadir Nuevo Ejercicio</Typography>
             
             <form onSubmit={handleAddExercise}>
                <Grid container spacing={2}>
                    <Grid sx={{xs:12, sm:6}} >
                        <TextField 
                            fullWidth 
                            label="Nombre del Ejercicio" 
                            name="nombre" 
                            value={newEjercicioData.nombre} 
                            onChange={handleChangeNewEjercicio} 
                            required 
                            size="small"
                        />
                    </Grid>
                    <Grid sx={{xs:12, sm:6}} >
                        <FormControl fullWidth size="small" required>
                            <InputLabel id="dia-select-label">Día de la Semana</InputLabel>
                            <Select
                                labelId="dia-select-label"
                                id="dia-select"
                                name="dia_semana"
                                value={newEjercicioData.dia_semana}
                                label="Día de la Semana"
                                onChange={handleChangeNewEjercicio}
                            >
                                {diasSemana.map(day => (
                                    <MenuItem key={day} value={day}>{day}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid sx={{xs:6, sm:3}} >
                        <TextField 
                            fullWidth 
                            label="Series" 
                            name="series" 
                            type="number" 
                            value={newEjercicioData.series} 
                            onChange={handleChangeNewEjercicio} 
                            required 
                            size="small"
                        />
                    </Grid>
                    <Grid sx={{xs:6, sm:3}} >
                        <TextField 
                            fullWidth 
                            label="Repeticiones" 
                            name="repeticiones" 
                            type="number" 
                            value={newEjercicioData.repeticiones} 
                            onChange={handleChangeNewEjercicio} 
                            required 
                            size="small"
                        />
                    </Grid>
                    <Grid sx={{xs:6, sm:3}} >
                        <TextField 
                            fullWidth 
                            label="Peso (kg)" 
                            name="peso" 
                            type="number" 
                            value={newEjercicioData.peso} 
                            onChange={handleChangeNewEjercicio} 
                            size="small"
                        />
                    </Grid>
                    <Grid sx={{xs:6, sm:3}} >
                         <TextField 
                            fullWidth 
                            label="Orden" 
                            name="orden" 
                            type="number" 
                            value={newEjercicioData.orden} 
                            onChange={handleChangeNewEjercicio} 
                            required 
                            size="small"
                        />
                    </Grid>
                    
                    <Grid sx={{xs:12}}>
                        <TextField 
                            fullWidth 
                            label="Notas Adicionales" 
                            name="notas" 
                            value={newEjercicioData.notas} 
                            onChange={handleChangeNewEjercicio} 
                            multiline 
                            rows={2} 
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                </Grid>

                <Button 
                    type="submit" 
                    variant="contained" 
                    color="secondary" 
                    disabled={adding || !newEjercicioData.nombre}
                >
                    {adding ? 'Agregando...' : 'Añadir Ejercicio'}
                </Button>
            </form>
          </Paper>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Ejercicios Existentes</Typography>
          {ejercicios.length === 0 && <Alert severity="info">No hay ejercicios para editar.</Alert>}

          {ejercicios.map((ejercicio, index) => (
            <EjercicioItem 
              key={ejercicio.id}
              ejercicio={ejercicio} 
              isEditable={true} 
              onDelete={handleDeleteExercise}
              onEdit={() => handleOpenEditModal(ejercicio)} // Llamada a la función de edición
            />
          ))}
        </Box>
      )}

      {/* MODAL DE EDICIÓN DE EJERCICIO */}
            {currentExercise && (
                <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
                    <DialogTitle>Editar Ejercicio: {currentExercise.nombre}</DialogTitle>
                    <form onSubmit={handleUpdateExercise}>
                        <DialogContent dividers>
                            <Grid container spacing={2}>
                                {/* Campos de edición reutilizados de la adición, pero con datos cargados */}
                                
                                <Grid sx={{xs:12, sm:6}}>
                                    <TextField fullWidth label="Nombre" name="nombre" value={currentExercise.nombre} onChange={handleModalChange} required size="small" />
                                </Grid>
                                
                                <Grid sx={{xs:12, sm:6}}>
                                    <FormControl fullWidth size="small" required>
                                        <InputLabel>Día</InputLabel>
                                        <Select name="dia_semana" value={currentExercise.dia_semana} label="Día" onChange={handleModalChange}>
                                            {diasSemana.map(day => (<MenuItem key={day} value={day}>{day}</MenuItem>))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                
                                {/* Campos numéricos */}
                                <Grid sx={{xs:6, sm:3}}><TextField fullWidth label="Series" name="series" type="number" value={currentExercise.series} onChange={handleModalChange} required size="small" /></Grid>
                                <Grid sx={{xs:6, sm:3}}><TextField fullWidth label="Reps" name="repeticiones" type="number" value={currentExercise.repeticiones} onChange={handleModalChange} required size="small" /></Grid>
                                <Grid sx={{xs:6, sm:3}}><TextField fullWidth label="Peso (kg)" name="peso" type="number" value={currentExercise.peso} onChange={handleModalChange} size="small" /></Grid>
                                <Grid sx={{xs:6, sm:3}}><TextField fullWidth label="Orden" name="orden" type="number" value={currentExercise.orden} onChange={handleModalChange} required size="small" /></Grid>

                                <Grid sx={{xs:12}}>
                                    <TextField fullWidth label="Notas" name="notas" value={currentExercise.notas} onChange={handleModalChange} multiline rows={2} />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseEditModal} color="secondary">
                                Cancelar
                            </Button>
                            <Button type="submit" variant="contained" color="primary" disabled={adding}>
                                {adding ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            )}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Container>
  );
};

export default RutinaForm;