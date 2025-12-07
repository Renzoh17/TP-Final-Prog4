from typing import List, Optional, Tuple, TypeVar

from sqlmodel import SQLModel, Session, select, func

from models import Rutina, RutinaBase, Ejercicio, EjercicioBase

# --- Excepción Personalizada para Manejo de Errores ---

class RutinaNameTakenError(Exception):
    """Excepción lanzada cuando el nombre de una rutina ya existe."""
    pass

# --- Funciones de Utilidad de Búsqueda ---

def get_rutina_by_name(session: Session, name: str) -> Optional[Rutina]:
    """Busca una rutina por nombre de forma insensible a mayúsculas/minúsculas."""
    # Usamos func.lower() para asegurar la insensibilidad a mayúsculas
    statement = select(Rutina).where(func.lower(Rutina.nombre) == func.lower(name))
    return session.exec(statement).first()

# --- Alta de Rutina (Create) ---

def create_rutina(session: Session, rutina_in: RutinaBase) -> Rutina:
    """
    Crea una nueva rutina, validando que el nombre no exista.
    Requisito: Validar que el nombre de la rutina sea único (insensible a mayúsculas).
    """
    # Validación de nombre único
    if get_rutina_by_name(session, rutina_in.nombre):
        raise RutinaNameTakenError(f"Ya existe una rutina con el nombre '{rutina_in.nombre}'.")

    db_rutina = Rutina.model_validate(rutina_in)
    
    session.add(db_rutina)
    session.commit()
    session.refresh(db_rutina)
    return db_rutina

def add_ejercicio_to_rutina(
    session: Session, rutina_id: int, ejercicio_in: EjercicioBase
) -> Ejercicio:
    """
    Agrega un nuevo ejercicio a una rutina específica.
    Requisito: Asignar un orden automático si no se especifica.
    """
    # Creamos el objeto Ejercicio. El 'rutina_id' es obligatorio en la DB.
    db_ejercicio = Ejercicio.model_validate(ejercicio_in, update={'rutina_id': rutina_id})
    
    # Lógica para establecer el 'orden' (si es 0 o no está especificado)
    if db_ejercicio.orden == 0:
        # Calcular el orden máximo actual para ese día de la semana y rutina
        max_order_statement = select(func.max(Ejercicio.orden)).where(
            Ejercicio.rutina_id == rutina_id,
            Ejercicio.dia_semana == db_ejercicio.dia_semana
        )
        max_order = session.exec(max_order_statement).one_or_none()
        
        # El nuevo orden es el máximo actual + 1 (o 1 si no hay ejercicios)
        db_ejercicio.orden = (max_order if max_order is not None else 0) + 1

    session.add(db_ejercicio)
    session.commit()
    session.refresh(db_ejercicio)
    return db_ejercicio

def add_multiple_ejercicios_to_rutina(
    session: Session, rutina_id: int, ejercicios_in: List[EjercicioBase]
) -> List[Ejercicio]:
    """
    Agrega múltiples ejercicios a una rutina específica.
    Requisito: Asignar un orden automático si no se especifica.
    """
    db_ejercicios = []
    for ejercicio_in in ejercicios_in:
        # Creamos el objeto Ejercicio. El 'rutina_id' es obligatorio en la DB.
        db_ejercicio = Ejercicio.model_validate(ejercicio_in, update={'rutina_id': rutina_id})
        
        # Lógica para establecer el 'orden' (si es 0 o no está especificado)
        if db_ejercicio.orden == 0:
            # Calcular el orden máximo actual para ese día de la semana y rutina
            max_order_statement = select(func.max(Ejercicio.orden)).where(
                Ejercicio.rutina_id == rutina_id,
                Ejercicio.dia_semana == db_ejercicio.dia_semana
            )
            max_order = session.exec(max_order_statement).one_or_none()
            
            # El nuevo orden es el máximo actual + 1 (o 1 si no hay ejercicios)
            db_ejercicio.orden = (max_order if max_order is not None else 0) + 1

        session.add(db_ejercicio)
        db_ejercicios.append(db_ejercicio)
        
    session.commit()
    for db_ejercicio in db_ejercicios:
        session.refresh(db_ejercicio)
    
    return db_ejercicios

# --- Baja de Rutina (Delete) ---

def delete_rutina_by_id(session: Session, rutina_id: int) -> Optional[Rutina]:
    """
    Elimina una rutina y todos sus ejercicios asociados.
    Requisito: Al eliminar la rutina, se eliminan todos sus ejercicios (cascada).
    
    IMPORTANTE: Esto requiere que el modelo `Rutina` en `models.py`
    tenga la configuración de cascada en su relación con `Ejercicio`.
    """
    rutina = session.get(Rutina, rutina_id)
    if not rutina:
        return None
        
    session.delete(rutina)
    session.commit()
    return rutina # Devolvemos la rutina eliminada para confirmación

# --- Modificación de Rutina y Ejercicio (Update) ---

def update_rutina(session: Session, rutina: Rutina, rutina_in: RutinaBase) -> Rutina:
    """
    Edita el nombre y la descripción de una rutina existente.
    Requisito: Editar el nombre y descripción.
    """
    
    # Si el nombre está en la entrada Y es diferente al actual, verificamos unicidad
    if rutina_in.nombre and rutina_in.nombre != rutina.nombre:
        if get_rutina_by_name(session, rutina_in.nombre):
            raise RutinaNameTakenError(f"Ya existe otra rutina con el nombre '{rutina_in.nombre}'.")

    # Copia solo los campos establecidos en rutina_in al objeto de DB
    rutina.sqlmodel_update(rutina_in.model_dump(exclude_unset=True))
    
    session.add(rutina)
    session.commit()
    session.refresh(rutina)
    return rutina

def update_ejercicio(
    session: Session, ejercicio: Ejercicio, ejercicio_in: EjercicioBase
) -> Ejercicio:
    """
    Modifica los campos de un ejercicio existente.
    Requisito: Modificar ejercicios existentes (nombre, series, repeticiones, peso, notas, orden).
    """
    # Actualiza el ejercicio de DB con los datos de entrada
    ejercicio.sqlmodel_update(ejercicio_in.model_dump(exclude_unset=True))
    
    session.add(ejercicio)
    session.commit()
    session.refresh(ejercicio)
    return ejercicio

def delete_ejercicio_by_id(session: Session, ejercicio_id: int) -> Optional[Ejercicio]:
    """
    Elimina un ejercicio específico de una rutina.
    Requisito: Eliminar ejercicios de la rutina.
    """
    ejercicio = session.get(Ejercicio, ejercicio_id)
    if not ejercicio:
        return None
        
    session.delete(ejercicio)
    session.commit()
    return ejercicio


# --- Búsqueda de Rutinas (Search) ---

def search_rutinas_by_name(session: Session, search_term: str) -> List[Rutina]:
    """
    Busca rutinas cuyo nombre contenga el término de búsqueda.
    Requisito: Búsqueda parcial e insensible a mayúsculas/minúsculas.
    """
    if not search_term:
        # Si el término está vacío, devolvemos todas las rutinas
        return get_all_rutinas(session)
        
    # Usamos func.lower() y like con comodines (%) para búsqueda parcial
    search_pattern = f"%{search_term.lower()}%"
    
    statement = select(Rutina).where(func.lower(Rutina.nombre).like(search_pattern))
    return session.exec(statement).all()


# --- Visualización de Rutinas (Read) ---

def get_all_rutinas(session: Session) -> List[Rutina]:
    """
    Lista todas las rutinas existentes (información resumida).
    Requisito: Listar todas las rutinas.
    """
    statement = select(Rutina)
    return session.exec(statement).all()

def get_rutina_detail_by_id(session: Session, rutina_id: int) -> Optional[Rutina]:
    """
    Ver el detalle completo de una rutina específica, incluyendo ejercicios.
    """
    return session.get(Rutina, rutina_id)

def get_ejercicio_by_id(session: Session, ejercicio_id: int) -> Optional[Ejercicio]:
    """Recupera un ejercicio por su ID."""
    return session.get(Ejercicio, ejercicio_id)

# --- Implmentación de paginación ---
ModelType = TypeVar("ModelType", bound=SQLModel)

# Paginación y Filtros

def get_rutinas_paginated(
    session: Session,
    pagina: int = 1,
    tamano_pagina: int = 10,
    dia_semana_filtro: Optional[str] = None
) -> Tuple[List[Rutina], int]:
    """
    Recupera una página de rutinas con el tamaño de página especificado.
    Devuelve la lista de rutinas y el total de rutinas.
    """
    offset = (pagina - 1) * tamano_pagina
    
    if dia_semana_filtro:
        # Filtrar rutinas que tengan al menos un ejercicio en el día especificado
        subquery = select(Ejercicio.rutina_id).where(
            Ejercicio.dia_semana == dia_semana_filtro
            ).distinct()
        
        statement = select(Rutina).where(Rutina.id.in_(subquery))
    else:
        statement = select(Rutina)
    
    # Contar el total de elementos para la paginación
    count_statement = select(func.count()).select_from(statement.subquery())
    total_items = session.exec(count_statement).one()
    
    # Aplicar LIMIT y OFFSET
    results = session.exec(
        statement.offset(offset).limit(tamano_pagina)
    ).all()
    
    return results, total_items

# --- Implementación de Duplicación ---

def duplicate_rutina(session: Session, original_rutina_id: int) -> Optional[Rutina]:
    """
    Duplica una rutina existente junto con todos sus ejercicios.
    Requisito: Crear una copia exacta de una rutina y sus ejercicios.
    """
    original = session.get(Rutina, original_rutina_id)
    if not original:
        return None
    
    # Crear la nueva rutina con el nombre modificado
    new_rutina_data = original.model_dump(exclude={"id", "fecha_creacion", "ejercicios"})
    
    # Creamos un nombre único para la copia
    copy_count = 1
    new_name = f"{original.nombre} (Copia {copy_count})"
    while get_rutina_by_name(session, new_name):
        copy_count += 1
        new_name = f"{original.nombre} (Copia {copy_count})"

    new_rutina_data['nombre'] = new_name
    
    new_rutina =Rutina(**new_rutina_data)
    session.add(new_rutina)
    session.flush()  # Flush para obtener el ID de la nueva rutina
    
    # Duplicar los ejercicios asociados
    for original_ejercicio in original.ejercicios:
        new_ejercicio_data = original_ejercicio.model_dump(exclude={"id", "rutina_id"})
        # Asignar la nueva rutina_id para mantener la relación
        new_ejercicio = Ejercicio(**new_ejercicio_data, rutina_id=new_rutina.id)
        session.add(new_ejercicio)
        
    session.commit()
    session.refresh(new_rutina)
    return new_rutina