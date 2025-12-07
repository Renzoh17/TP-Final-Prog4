from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Annotated, Optional
from database import get_session
from security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from models import Usuario, UsuarioCreate, UsuarioRead, Token
from fastapi.security import OAuth2PasswordRequestForm

# Definición del Router de Autenticación
router = APIRouter(
    prefix="/api/auth",
    tags=["autenticacion"]
)


# --- Funciones CRUD básicas para Usuario (Podrían ir a crud.py) ---

def get_user_by_email(session: Session, email: str) -> Optional[Usuario]:
    """Busca un usuario por su email."""
    statement = select(Usuario).where(Usuario.email == email)
    return session.exec(statement).first()

# --- Endpoints de Autenticación ---

@router.post("/register", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
def register_user(
    user_in: UsuarioCreate, 
    session: Session = Depends(get_session)
):
    """Endpoint para registrar un nuevo usuario."""
    # Verificar si el email ya existe
    if get_user_by_email(session, user_in.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El email ya está registrado."
        )

    # Hashear la contraseña
    hashed_password = get_password_hash(user_in.password)
    
    # Crear el objeto Usuario (incluyendo la contraseña hasheada)
    db_user = Usuario.model_validate(user_in, update={"hashed_password": hashed_password})
    
    # Guardar en DB
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_session)
):
    """Endpoint para iniciar sesión y obtener un token JWT."""
    user = get_user_by_email(session, form_data.username)
    
    # Verificar usuario y contraseña
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de usuario o contraseña inválidas.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Crear el token con el ID del usuario en el payload
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, # 'sub' es el estándar para el sujeto (subject), aquí es el ID del usuario
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}