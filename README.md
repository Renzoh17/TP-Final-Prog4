# 🏋️ Gestor Completo de Rutinas de Entrenamiento

## 📋 Descripción del Proyecto

Esta aplicación es un sistema completo (Full-Stack) diseñado para la gestión y planificación de rutinas de entrenamiento físico. Permite a los usuarios autenticarse, crear planes detallados por día de la semana y administrar ejercicios con métricas específicas (series, repeticiones, peso).

El proyecto está dividido en dos servicios principales:
1.  **Backend (FastAPI):** Gestiona la lógica de negocio, la API RESTful, la autenticación JWT y la persistencia de datos en PostgreSQL.
2.  **Frontend (React/MUI):** Proporciona una interfaz de usuario moderna y *responsive* para interactuar con la API.

---

## ⚙️ Requisitos Previos

Para ejecutar la aplicación completa en un entorno reproducible y aislado, solo necesitas:

* **Docker:** Versión 20.x o superior.
* **Docker Compose:** Versión 1.29.x o Docker Engine con soporte Compose V2 (generalmente viene incluido con Docker Desktop).

---

## 🚀 Ejecución del Proyecto (Docker Compose)

El proyecto utiliza `docker-compose.yml` para construir, configurar y conectar los tres servicios necesarios (Frontend, Backend y Base de Datos) automáticamente.

### 1. Construcción y Arranque

Ejecuta el siguiente comando desde la carpeta raíz del proyecto (`/TP-Final-Prog4`):

```bash
docker-compose up --build
```

### 2\. Acceso a la Aplicación

Una vez que los contenedores estén operativos:

| Servicio | URL de Acceso |
| :--- | :--- |
| **Frontend (App)** | `http://localhost:5173` |
| **Backend (API)** | `http://localhost:8000/docs` (Documentación de FastAPI) |

-----

## 💻 Tecnologías Utilizadas

### 🌐 Frontend (React / Vite)

### 🐍 Backend (FastAPI)

### 🐳 Infraestructura

  * **Contenedorización:** Docker.
  * **Orquestación:** Docker Compose (maneja la red interna y las variables de entorno).

-----

## 📂 Estructura del Proyecto

El proyecto está dividido en carpetas que separan claramente los servicios y la configuración de contenedores:

```
/gestor-rutinas-app/
├── backend/                  # Código del servidor FastAPI
│   ├── ..                    # Resto de Archivos explicados en su respectiva carpeta
│   └── Dockerfile            # Define la imagen del backend (Python/Uvicorn)
|
├── frontend/                 # Código del cliente React/MUI
│   ├── ..                    # Resto de Archivos explicados en su respectiva carpeta
│   └── Dockerfile            # Define la imagen del frontend (Node/Nginx)
|
└── docker-compose.yml        # Configuración para levantar y conectar todos los servicios
```