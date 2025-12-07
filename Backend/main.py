from contextlib import asynccontextmanager
from fastapi import FastAPI
from database import create_db_and_tables
from routers import auth, rutinas, ejercicios

# ----------------------------------------------------
# Definir el Context Manager de Lifespan
# ----------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Función que maneja los eventos de inicio (startup) y apagado (shutdown).
    """
    print(">>> Iniciando el servidor...")
    
    # Lógica de INICIO (equivalente a @app.on_event("startup"))
    create_db_and_tables()
    print("Base de datos y tablas inicializadas.")
    
    yield # La aplicación se ejecuta en este punto
    
    # Lógica de APAGADO (si fuera necesaria)
    print("<<< Apagando el servidor...")

# ----------------------------------------------------
# Inicialización de FastAPI con lifespan
# ----------------------------------------------------
app = FastAPI(
    title="Gym Routine Manager API",
    description="Sistema de gestión de rutinas de gimnasio con FastAPI y SQLModel.",
    version="1.0.0",
    lifespan=lifespan
)

# ----------------------------------------------------
# Registro de Routers
# ----------------------------------------------------
app.include_router(rutinas.router)
app.include_router(ejercicios.router)
app.include_router(auth.router)
