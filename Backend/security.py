from os import getenv
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from database import get_session
from models import Usuario

# --- Configuración de Seguridad ---

# Definición del esquema OAuth2 para la obtención del token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Usaremos bcrypt para hashear contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Clave secreta para firmar los tokens JWT. OBTENER DEL ENTORNO.
# Si no está definida, usa una clave por defecto, ¡PERO CAMBIA ESTO EN PRODUCCIÓN!
SECRET_KEY = getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # Token expira en 24 horas

# --- Lógica de Contraseña ---

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña plana coincide con el hash almacenado."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashea una contraseña plana."""
    truncated_password = password.encode('utf-8')[:72]
    return pwd_context.hash(truncated_password)

# --- Lógica de JWT ---

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crea un token JWT."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decodifica y valida un token JWT. Retorna el payload si es válido."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        # Esto ocurre si el token es inválido, ha expirado o la firma no coincide.
        return None
    
def get_current_user(
    session: Session = Depends(get_session),
    token: str = Depends(oauth2_scheme)
    ) -> Usuario:
    """Dependecia de FastAPI para obtener el usuario actual a partir del token JWT."""
    # Decodificar el token
    payload = decode_access_token(token)
    
    # Verificar el ID del sujeto
    user_id: Optional[str] = payload.get("sub") if payload else None
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Obtener el usuario de la base de datos
    user = session.get(Usuario, int(user_id))
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user