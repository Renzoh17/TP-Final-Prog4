from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
# Configuración del Middleware CORS
# ----------------------------------------------------

# Lista de orígenes (dominios/puertos) que están autorizados a comunicarse con tu API.
# Usamos el puerto 5173, que es el predeterminado de Vite/React.
origins = [
    "http://localhost:5173", # Origen de tu Frontend React
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,             # Lista de orígenes permitidos
    allow_credentials=True,            # Permite cookies y encabezados de autenticación (JWT)
    allow_methods=["*"],               # Permite todos los métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],               # Permite todos los encabezados HTTP (incluido Authorization)
)

# ----------------------------------------------------
# Registro de Routers
# ----------------------------------------------------
app.include_router(rutinas.router)
app.include_router(ejercicios.router)
app.include_router(auth.router)
