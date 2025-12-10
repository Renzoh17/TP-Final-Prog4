import React, { useState, useEffect } from 'react';
import { Container, Typography, CircularProgress, Alert, Button, Grid, Card, CardContent, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchBar from '../components/SearchBar';
import * as api from '../api/rutinas'; 
import { Link } from 'react-router-dom'; 
import { CopyAll, Delete, Edit } from '@mui/icons-material';

// Componente simple para mostrar una rutina en la lista
const RutinaCard = ({ rutina, onCopy, onDelete }) => (
    <Card sx={{ mb: 2, '&:hover': { boxShadow: 6 } }}>
        <CardContent>
            <Grid container alignItems="center" justifyContent="space-between">
                <Grid sx={{ xs: 9 }}>
                    <Typography variant="h6" component="div">
                        <Link to={`/rutinas/${rutina.id}`} style={{ textDecoration: 'none', color: '#3f51b5' }}>
                            {rutina.nombre}
                        </Link>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {rutina.descripcion || 'Sin descripción.'}
                    </Typography>
                </Grid>
                <Grid sx={{ xs: 3, textAlign: 'right' }}>
                    <Button onClick={() => onCopy(rutina.id, rutina.nombre)} size="small" sx={{ mr: 1 }}>
                        <CopyAll fontSize="small" sx={{ mr: 0.5 }} />
                    </Button>
                    <Button component={Link} to={`/rutinas/${rutina.id}/editar`} size="small">
                        <Edit fontSize="small" sx={{ mr: 0.5 }} />
                    </Button>
                    <Button onClick={() => onDelete(rutina.id, rutina.nombre)} size="small" color="error">
                        <Delete fontSize="small" sx={{ mr: 0.5 }} />
                    </Button>
                </Grid>
            </Grid>
        </CardContent>
    </Card>
);




const RutinaList = () => {
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado de paginación (solo muestra la primera página)
  const [pagination, setPagination] = useState({ pagina: 1, total_paginas: 1 });

  // Función para cargar rutinas (con búsqueda y paginación)
  const fetchRoutines = async (term = '') => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (term.trim()) {
        // Búsqueda por nombre
        data = await api.searchRoutines(term);
        setRutinas(data);
        setPagination({ pagina: 1, total_paginas: 1 }); // Desactiva paginación en búsqueda
      } else {
        // Listado paginado
        data = await api.getPaginatedRoutines(pagination.pagina, 10);
        setRutinas(data.items);
        setPagination({ 
            pagina: data.pagina, 
            total_paginas: data.total_paginas 
        });
      }
    } catch (err) {
      setError('Error al cargar las rutinas. Asegúrate de estar logueado.');
    } finally {
      setLoading(false);
    }
  };

  // Lógica para Copiar la Rutina
  const handleCopyRutina = async (id, nombre) => {
      if (!window.confirm(`¿Estás seguro de que quieres crear una copia de la rutina "${nombre}"?`)) {
          return;
      }

      try {
          // Llamar al API
          const nuevaRutina = await api.copyRutina(id);
          
          fetchRoutines(); // Refrescar la lista después de copiar

          alert(`✅ Rutina "${nombre}" copiada con éxito. Se creó una nueva rutina.`);
            
      } catch (error) {
          console.error(error);
          alert('❌ Error al copiar la rutina. Inténtalo de nuevo.');
      }
    };

    // ELIMINAR RUTINA 
    const handleDeleteRutina = async (id, nombre) => {
        // Mensaje de confirmación antes de eliminar
        if (!window.confirm(`¿Estás seguro de que quieres ELIMINAR la rutina "${nombre}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        setLoading(true); // Muestra un estado de carga general
        try {
            // Llamar a la API de eliminación
            await api.deleteRoutine(id); 
            
            // Refrescar la lista después de eliminar
            fetchRoutines(searchTerm); 

            alert(`🗑️ Rutina "${nombre}" eliminada con éxito.`);
            
        } catch (error) {
            console.error('Error al eliminar rutina:', error);
            setError('❌ Error al eliminar la rutina. Asegúrate de que no haya ejercicios asociados o de tener permiso.');
        } finally {
            setLoading(false);
        }
    };

  // Efecto para manejar la carga y la búsqueda con debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRoutines(searchTerm);
    }, 500); // 500ms de retraso para buscar

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pagination.pagina]); // Recargar al cambiar la página o el término

  // Manejar el cambio de página
const handlePageChange = (newPage) => {
    // Verificar límites para evitar números negativos o excesivos
    if (newPage >= 1 && newPage <= pagination.total_paginas) {
        // Actualizar el estado de la página
        setPagination(prev => ({ ...prev, pagina: newPage }));
        // La dependencia en useEffect manejará la llamada automática a fetchRoutines
    }
};

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        📋 Planes de Entrenamiento
      </Typography>
      
      {/* ESTRUCTURA DE BÚSQUEDA Y BOTÓN */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid sx={{ xs: 12, sm: 8 }}>
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </Grid>
        <Grid sx={{ xs: 12, sm: 4, textAlign: { sm: 'right' } }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            component={Link} 
            to="/rutinas/crear"
            fullWidth
          >
            CREAR NUEVA RUTINA
          </Button>
        </Grid>
      </Grid>
      
      {/* Mensajes de Estado */}
      {loading && <CircularProgress size={24} sx={{ display: 'block', m: 2 }} />}
      {error && <Alert severity="error">{error}</Alert>}
      
      {rutinas?.length === 0 && !loading && (
        <Alert severity="info">No se encontraron rutinas.</Alert>
      )}

      {/* Mapeo del Listado */}
      <Box sx={{ mt: 3 }}>
        {rutinas?.map(rutina => (
          <RutinaCard 
            key={rutina.id} 
            rutina={rutina} 
            onCopy={handleCopyRutina} 
            onDelete={handleDeleteRutina}
             />
        ))}
      </Box>

      {/* LÓGICA DE PAGINACIÓN */}
        {pagination?.total_paginas > 1 && (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mt: 4, 
                mb: 2 
            }}>
                
                {/* Botón Anterior */}
                <Button 
                    variant="outlined" 
                    onClick={() => handlePageChange(pagination.pagina - 1)}
                    // Deshabilitar si estamos en la primera página (pagina 1)
                    disabled={pagination.pagina === 1}
                >
                    Anterior
                </Button>

                {/* Indicador de Página */}
                <Typography variant="body2">
                    Página {pagination.pagina} de {pagination.total_paginas}
                </Typography>

                {/* Botón Siguiente */}
                <Button 
                    variant="contained" 
                    onClick={() => handlePageChange(pagination.pagina + 1)}
                    // Deshabilitar si estamos en la última página
                    disabled={pagination.pagina === pagination.total_paginas}
                >
                    Siguiente
                </Button>
            </Box>
        )}
        {/* FIN LÓGICA DE PAGINACIÓN */}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Container>
  );
};

export default RutinaList;