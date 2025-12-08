from os import getenv
from typing import Generator

from dotenv import load_dotenv
from sqlmodel import create_engine, SQLModel, Session

# Carga las variables de entorno
load_dotenv()

# --- Obtención y Construcción de la URL de Conexión ---

def get_db_url() -> str:
    """
    Intenta construir la URL de conexión a partir de credenciales separadas.
    Si fallan, usa la variable de entorno DATABASE_URL completa.
    """
    # Opción 1: URL completa
    database_url = getenv("DATABASE_URL")
    if database_url:
        return database_url
    
    # Opción 2: Credenciales separadas (más seguro en algunos entornos)
    db_user = getenv("DB_USER")
    db_pass = getenv("DB_PASS")
    db_host = getenv("DB_HOST")
    db_port = getenv("DB_PORT", "5432")  # Puerto por defecto de PostgreSQL
    db_name = getenv("DB_NAME")
    
    # Comprobamos si las credenciales básicas están definidas
    if all([db_user, db_pass, db_host, db_name]):
        # Construimos la URL en el formato requerido por SQLAlchemy
        # Nota: Usamos 'postgresql+psycopg2' como driver
        return (
            f"postgresql+psycopg2://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
        )

    # Si ninguna de las opciones anteriores está definida, lanzamos un error
    raise ValueError(
        "No se pudo configurar la conexión a la base de datos. "
        "Define DATABASE_URL o las credenciales separadas (DB_USER, DB_PASS, DB_HOST, DB_NAME)."
    )

# Obtener la URL de conexión
DATABASE_URL = get_db_url()

# --- Creación del Motor de SQLModel ---

# El motor de SQLModel (que usa SQLAlchemy) maneja la conexión con la DB.
engine = create_engine(DATABASE_URL, echo=True)

# --- Funciones de Inicialización ---

def create_db_and_tables():
    """
    Crea las tablas en la base de datos basándose en los modelos (SQLModel)
    que ha importado el motor.
    """
    # Importar los modelos para que SQLModel los reconozca
    from models import Rutina, Ejercicio, DiaSemana, Usuario

    print("Intentando crear la base de datos y las tablas...")
    SQLModel.metadata.create_all(engine)
    print("Base de datos y tablas creadas (o ya existentes).")

# --- Dependencia para las Sesiones de Base de Datos ---

def get_session() -> Generator[Session, None, None]:
    """
    Genera una nueva sesión de base de datos para cada solicitud.
    """
    with Session(engine) as session:
        yield session