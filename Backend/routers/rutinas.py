from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session

from database import get_session
from repository import get_all_rutinas, search_rutinas_by_name, get_rutina_detail_by_id, create_rutina, update_rutina, delete_rutina_by_id, RutinaNameTakenError
from models import Rutina, RutinaBase, RutinaRead

# Definición del Router. Se establece el prefijo y las tags para la documentación (Swagger/Redoc).
router = APIRouter(
    prefix="/api",
    tags=["Rutinas"]
)

# --- Endpoints de Rutinas (/api/rutinas) ---

@router.get("/rutinas", response_model=List[Rutina])
def listar_todas_rutinas(session: Session = Depends(get_session)):
    """GET /api/rutinas - Listar todas las rutinas (resumen)."""
    return get_all_rutinas(session)

@router.get("/rutinas/buscar", response_model=List[Rutina])
def buscar_rutinas(
    nombre: str = Query(..., description="Texto a buscar en el nombre de la rutina (parcial e insensible a mayúsculas)."),
    session: Session = Depends(get_session)
):
    """GET /api/rutinas/buscar?nombre={texto} - Buscar rutinas por nombre."""
    return search_rutinas_by_name(session, nombre)

@router.get("/rutinas/{rutina_id}", response_model=RutinaRead)
def obtener_detalle_rutina(rutina_id: int, session: Session = Depends(get_session)):
    """GET /api/rutinas/{id} - Obtener detalle de una rutina específica con sus ejercicios."""
    rutina = get_rutina_detail_by_id(session, rutina_id)
    if not rutina:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Rutina con ID {rutina_id} no encontrada."
        )
    return rutina

@router.post("/rutinas", response_model=Rutina, status_code=status.HTTP_201_CREATED)
def crear_nueva_rutina(rutina_in: RutinaBase, session: Session = Depends(get_session)):
    """POST /api/rutinas - Crear una nueva rutina."""
    try:
        return create_rutina(session, rutina_in)
    except RutinaNameTakenError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )

@router.put("/rutinas/{rutina_id}", response_model=Rutina)
def actualizar_rutina_existente(
    rutina_id: int, 
    rutina_in: RutinaBase, 
    session: Session = Depends(get_session)
):
    """PUT /api/rutinas/{id} - Actualizar una rutina existente."""
    rutina = get_rutina_detail_by_id(session, rutina_id)
    if not rutina:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Rutina con ID {rutina_id} no encontrada."
        )
    try:
        return update_rutina(session, rutina, rutina_in)
    except RutinaNameTakenError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )

@router.delete("/rutinas/{rutina_id}", status_code=status.HTTP_204_NO_CONTENT)
def borrar_rutina_existente(rutina_id: int, session: Session = Depends(get_session)):
    """DELETE /api/rutinas/{id} - Eliminar una rutina."""
    rutina = delete_rutina_by_id(session, rutina_id)
    if not rutina:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Rutina con ID {rutina_id} no encontrada."
        )
    return
