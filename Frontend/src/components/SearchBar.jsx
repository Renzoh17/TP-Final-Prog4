import React from 'react';
import { TextField, InputAdornment, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ searchTerm, onSearchChange, label = "Buscar Rutinas por Nombre" }) => {
  return (
    <Box sx={{ mb: 0 }}> {/* El margen se gestiona en el componente padre */}
      <TextField
        fullWidth
        label={label}
        variant="outlined"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        slotProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default SearchBar;