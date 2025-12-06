from datetime import datetime
from enum import Enum
from typing import Optional, List

from sqlmodel import SQLModel, Field, Relationship

# --- Enumeración para el Día de la Semana ---
class DiaSemana(str, Enum):
    """Días de la semana válidos para una rutina."""
    LUNES = "Lunes"
    MARTES = "Martes"
    MIERCOLES = "Miércoles"
    JUEVES = "Jueves"
    VIERNES = "Viernes"
    SABADO = "Sábado"
    DOMINGO = "Domingo"

# --- Modelo de Ejercicio ---

# Base para Pydantic/Request/Response
class EjercicioBase(SQLModel):
    """Define los campos comunes y de entrada para un Ejercicio."""
    nombre: str = Field(index=True)
    dia_semana: DiaSemana # Usamos el Enum definido antes
    series: int
    repeticiones: int
    orden: int = Field(default=0) # Orden de ejecución dentro del día
    peso: Optional[float] = Field(default=None, description="Peso en kilogramos. Nulo para peso corporal.")
    notas: Optional[str] = Field(default=None)

    # Clave foránea para la relación con Rutina
    rutina_id: Optional[int] = Field(default=None, foreign_key="rutina.id")

# Modelo de Tabla para la base de datos
class Ejercicio(EjercicioBase, table=True):
    """Modelo de base de datos para un Ejercicio."""
    id: Optional[int] = Field(default=None, primary_key=True)

    # Relación de vuelta con Rutina
    rutina: "Rutina" = Relationship(back_populates="ejercicios")

# Modelo para creación masiva de Ejercicios    
class EjercicioCreateList(List[EjercicioBase]):
    pass

# --- Modelo de Rutina ---

# Base para Pydantic/Request/Response
class RutinaBase(SQLModel):
    """Define los campos comunes y de entrada para una Rutina."""
    nombre: str = Field(unique=True, index=True) # Requerido y único
    descripcion: Optional[str] = Field(default=None)

# Modelo de Tabla para la base de datos
class Rutina(RutinaBase, table=True):
    """Modelo de base de datos para una Rutina."""
    id: Optional[int] = Field(default=None, primary_key=True)
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relación de uno a muchos con Ejercicio
    # `ejercicios` será una lista de objetos Ejercicio
    ejercicios: List[Ejercicio] = Relationship(
        back_populates="rutina",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
        )

# Modelo de Lectura (Response) que incluye la lista de ejercicios
class RutinaRead(RutinaBase):
    """Modelo de respuesta para Rutina, incluyendo ID, fecha y ejercicios."""
    id: int
    fecha_creacion: datetime
    ejercicios: List[EjercicioBase] = []

# Nota: Se debe definir el `Ejercicio` al final de la clase `Rutina` para evitar errores de referencia circular
# si se usa la notación de string "Rutina" en la relación de Ejercicio.