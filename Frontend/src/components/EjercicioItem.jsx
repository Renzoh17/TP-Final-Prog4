import React from 'react';
import { Card, CardContent, Typography, Grid, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const EjercicioItem = ({ ejercicio, isEditable = false, onEdit, onDelete }) => {
  return (
    <Card variant="outlined" sx={{ mb: 1.5, bgcolor: '#ffffff' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Grid container alignItems="center" spacing={2}>
          {/* Columna de Contenido del Ejercicio */}
          <Grid sx={{ xs: isEditable ? 9 : 12 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              {ejercicio.orden}. {ejercicio.nombre} ({ejercicio.dia_semana})
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Series: {ejercicio.series} x Reps: {ejercicio.repeticiones}
              {ejercicio.peso !== null && ejercicio.peso !== 0 && (
                ` | Peso: ${ejercicio.peso} kg`
              )}
            </Typography>
            {ejercicio.notas && (
              <Typography variant="caption" display="block" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                Notas: {ejercicio.notas}
              </Typography>
            )}
          </Grid>
          
          {/* Columna de Acciones (Solo visible en edición) */}
          {isEditable && (
            <Grid sx={{ xs: 3, textAlign: 'right' }}>
              <IconButton 
                color="primary" 
                onClick={() => onEdit(ejercicio.id)} 
                aria-label="Editar ejercicio"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton 
                color="error" 
                onClick={() => onDelete(ejercicio.id)} 
                aria-label="Eliminar ejercicio"
              >
                <DeleteIcon fontSize="small"/>
              </IconButton>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default EjercicioItem;