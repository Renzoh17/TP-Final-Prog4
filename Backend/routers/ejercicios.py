from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from database import get_session
from repository import get_rutina_detail_by_id, add_ejercicio_to_rutina, add_multiple_ejercicios_to_rutina, get_ejercicio_by_id, update_ejercicio, delete_ejercicio_by_id
from models import Ejercicio, EjercicioBase, Usuario
from security import get_current_user

# Definición del Router. Se establece el prefijo y las tags para la documentación (Swagger/Redoc).
router = APIRouter(
    prefix="/api",
    tags=["Ejercicios"]
)

# --- Endpoints de Ejercicios ---

@router.post("/rutinas/{rutina_id}/ejercicio", response_model=Ejercicio, status_code=status.HTTP_201_CREATED)
def agregar_ejercicio_a_rutina(
    rutina_id: int,
    ejercicio_in: EjercicioBase,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """POST /api/rutinas/{id}/ejercicio - Agregar ejercicio a una rutina."""
    rutina = get_rutina_detail_by_id(session, rutina_id)
    if not rutina:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rutina con ID {rutina_id} no encontrada. No se puede agregar el ejercicio."
        )
    return add_ejercicio_to_rutina(session, rutina_id, ejercicio_in)

@router.post("/rutinas/{rutina_id}/ejercicios", response_model=List[Ejercicio])
def agregar_ejercicios_a_rutina(
    rutina_id: int,
    ejercicios_in: List[EjercicioBase],
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """POST /api/rutinas/{id}/ejercicios - Agregar múltiples ejercicios a una rutina."""
    rutina = get_rutina_detail_by_id(session, rutina_id)
    if not rutina:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rutina con ID {rutina_id} no encontrada. No se pueden agregar los ejercicios."
        )
    return add_multiple_ejercicios_to_rutina(session, rutina_id, ejercicios_in)

@router.put("/ejercicios/{ejercicio_id}", response_model=Ejercicio)
def actualizar_ejercicio_existente(
    ejercicio_id: int,
    ejercicio_in: EjercicioBase,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """PUT /api/ejercicios/{id} - Actualizar un ejercicio."""
    ejercicio = get_ejercicio_by_id(session, ejercicio_id)
    if not ejercicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ejercicio con ID {ejercicio_id} no encontrado."
        )
    ejercicio_update_data = ejercicio_in.model_dump(exclude={"rutina_id"})
    return update_ejercicio(session, ejercicio, EjercicioBase.model_validate(ejercicio_update_data))


@router.delete("/ejercicios/{ejercicio_id}", status_code=status.HTTP_204_NO_CONTENT)
def borrar_ejercicio_existente(
    ejercicio_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
    ):
    """DELETE /api/ejercicios/{id} - Eliminar un ejercicio."""
    ejercicio = delete_ejercicio_by_id(session, ejercicio_id)
    if not ejercicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ejercicio con ID {ejercicio_id} no encontrado."
        )
    return