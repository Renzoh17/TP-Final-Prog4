# Usa la imagen oficial de Python como base
FROM python:3.13.7-slim

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de requerimientos e instálalos
# Asume que tienes un archivo requirements.txt con FastAPI, Uvicorn, SQLAlchemy, etc.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código del backend
COPY . .

# Expón el puerto que usa Uvicorn (8000 por defecto)
EXPOSE 8000

# Comando para iniciar la aplicación con Uvicorn
# 'main:app' asume que tu aplicación se llama 'app' en 'main.py'
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]