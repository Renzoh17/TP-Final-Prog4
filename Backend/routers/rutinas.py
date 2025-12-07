from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session

from database import get_session
from repository import duplicate_rutina, get_rutinas_paginated, search_rutinas_by_name, get_rutina_detail_by_id, create_rutina, update_rutina, delete_rutina_by_id, RutinaNameTakenError
from models import DiaSemana, Rutina, RutinaBase, RutinaPaginatedRead, RutinaRead, Usuario, Usuario
from security import get_current_user

# Definición del Router. Se establece el prefijo y las tags para la documentación (Swagger/Redoc).
router = APIRouter(
    prefix="/api",
    tags=["Rutinas"]
)

# --- Endpoints de Rutinas (/api/rutinas) ---

@router.get("/rutinas", response_model=RutinaPaginatedRead)
def listar_todas_rutinas(
    pagina: int = Query(1, ge=1, description="Número de página a recuperar (mínimo 1)."),
    tamano_pagina: int = Query(10, ge=1, le=100, description="Tamaño de página (mínimo 1, máximo 100)."),
    dia_semana: Optional[DiaSemana] = Query(None, description="Filtrar rutinas por día de la semana."),
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
    ):
    """GET /api/rutinas - Listar todas las rutinas con paginación y filtro opcional por día de la semana."""
    rutinas_list, total_items = get_rutinas_paginated(
        session,
        pagina,
        tamano_pagina,
        dia_semana
    )
    # Cálculo del total de páginas
    total_paginas = (total_items + tamano_pagina - 1) // tamano_pagina 
    
    return RutinaPaginatedRead(
        items=rutinas_list,
        total_items=total_items,
        pagina=pagina,
        tamano_pagina=tamano_pagina,
        total_paginas=total_paginas
    )

@router.get("/rutinas/buscar", response_model=List[Rutina])
def buscar_rutinas(
    nombre: str = Query(..., description="Texto a buscar en el nombre de la rutina (parcial e insensible a mayúsculas)."),
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    """GET /api/rutinas/buscar?nombre={texto} - Buscar rutinas por nombre."""
    return search_rutinas_by_name(session, nombre)

@router.get("/rutinas/{rutina_id}", response_model=RutinaRead)
def obtener_detalle_rutina(
    rutina_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
    ):
    """GET /api/rutinas/{id} - Obtener detalle de una rutina específica con sus ejercicios."""
    rutina = get_rutina_detail_by_id(session, rutina_id)
    if not rutina:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Rutina con ID {rutina_id} no encontrada."
        )
    return rutina

@router.post("/rutinas", response_model=Rutina, status_code=status.HTTP_201_CREATED)
def crear_nueva_rutina(
    rutina_in: RutinaBase,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
    ):
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
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
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
def borrar_rutina_existente(
    rutina_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
    ):
    """DELETE /api/rutinas/{id} - Eliminar una rutina."""
    rutina = delete_rutina_by_id(session, rutina_id)
    if not rutina:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Rutina con ID {rutina_id} no encontrada."
        )
    return

@router.post("/rutinas/{rutina_id}/duplicar", response_model=Rutina, status_code=status.HTTP_201_CREATED)
def duplicar_rutina_existente(
    rutina_id: int,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
    ):
    """POST /api/rutinas/{id}/duplicar - Duplicar una rutina existente junto con sus ejercicios."""
    new_rutina = duplicate_rutina(session, rutina_id)
    if not new_rutina:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rutina con ID {rutina_id} no encontrada. No se puede duplicar."
        )
    return new_rutina