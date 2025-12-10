# 🏋️ API REST de Gestión de Rutinas de Gimnasio (Backend)

## 📝 Descripción del Proyecto

Esta es la API RESTful que sirve como backend para el sistema de gestión de rutinas de gimnasio. Está construida utilizando **FastAPI** para el enrutamiento y la velocidad, **SQLModel** para la gestión de la base de datos relacional (ORM y validación Pydantic), y **PostgreSQL** como motor de persistencia.

La API permite a los usuarios autenticados gestionar, crear, modificar y buscar planes de entrenamiento y ejercicios asociados.

---

## 🛠️ Requisitos Previos

Asegúrese de tener instalados los siguientes componentes en su sistema antes de comenzar:

* **Python:** Versión 3.10 o superior.
* **PostgreSQL:** La versión 12 o superior del motor de base de datos instalado y accesible.
* **Git** (opcional, pero recomendado para clonar el repositorio).

---

## ⚙️ Instalación

Siga estos pasos para configurar el entorno de desarrollo:

### 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
```

### 2\. Creación e Inicialización del Entorno Virtual

Es fundamental trabajar en un entorno virtual (`.venv`) para aislar las dependencias:

```bash
# Crear el entorno virtual
python -m venv .venv

# Activar el entorno virtual
# En Windows (CMD):
.\.venv\Scripts\activate
# En Linux/macOS o PowerShell:
source .venv/bin/activate
```

### 3\. Instalación de Dependencias

En la raíz de la carpeta de Backend habra un archivo llamado `requirementsForPy.txt`, que contendra las dependecias necesarias.

Luego, instale todas las librerías:

```bash
pip install -r requirementsForPy.txt
```

-----

## 💾 Configuración de la Base de Datos

La aplicación requiere acceso a una instancia de PostgreSQL y utiliza un archivo `.env` para gestionar las credenciales de forma segura. Debe localizar dicho archivo que se encuentra en la raíz de la carpeta de Backend y abrirlo.

### Opción 1 - String de Conexión a PostgreSQL

La aplicación requiere la variable `DATABASE_URL` (o las credenciales separadas) para funcionar. El formato estándar para PostgreSQL con el driver `psycopg2` es:

**`postgresql+psycopg2://<usuario>:<contraseña>@<host>:<puerto>/<nombre_db>`**

### Opción 2 - Variables de Entorno

En caso de no usar la opción 1, debe dejar en blanco la variable `DATABASE_URL` y completar las siguientes:

| Variable | Propósito |
| :--- | :--- |
| `DB_USER` | Nombre de usuario de PostgreSQL. |
| `DB_PASS` | Contraseña. |
| `DB_HOST` | Host de la base de datos. |
| `DB_NAME` | Nombre de la base de datos. |
| `SECRET_KEY` | Clave secreta para firmar los Tokens JWT (mínimo 32 caracteres). **OBLIGATORIA** |

### Ejemplo de Archivo `.env`

```ini
# .env
# --- Opción 1 (Recomendada) ---
DATABASE_URL="postgresql+psycopg2://user_dev:password123@localhost:5432/gym_app_db"

# --- Opción 2 (Alternativa) ---
DB_USER="user_dev"
DB_PASS="password123"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="gym_db"

# --- Seguridad JWT ---
SECRET_KEY="SU_CLAVE_SECRETA_LARGA_AQUI_PARA_JWT_MINIMO_32_CARACTERES"
```

### Inicialización de la Base de Datos

Al iniciar el servidor (ver sección "Ejecución"), la función `lifespan` de FastAPI llama automáticamente a `database.create_db_and_tables()`.

  * **Instrucciones:** Asegúrese de que la base de datos (`gym_db` en el ejemplo) exista en PostgreSQL antes de iniciar el servidor. El servidor se encargará de crear las tablas (`rutina`, `ejercicio`, `usuario`).

-----

## ▶️ Ejecución

### Comando para Iniciar el Servidor

Inicie el servidor Uvicorn con la opción `--reload` para que se actualice automáticamente con cada cambio de código:

```bash
uvicorn main:app --reload
```

### Detalles de la Aplicación

  * **Puerto de Ejecución:** `http://localhost:8000` (por defecto)
  * **Documentación (Swagger UI):** Acceda a la documentación interactiva en:
    `http://localhost:8000/docs`

-----

## 🌐 Endpoints Disponibles

Todos los *endpoints* están prefijados con `/api`.

| Método | Endpoint | Descripción | Protección |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Registra un nuevo usuario en el sistema. | **Público** |
| `POST` | `/api/auth/login` | Obtiene el Token JWT necesario para acceder a recursos privados. | **Público** |
| `GET` | `/api/rutinas` | Lista todas las rutinas con paginación y filtros. | **JWT** |
| `GET` | `/api/rutinas/{id}` | Obtiene el detalle de una rutina específica (incluyendo ejercicios). | **JWT** |
| `GET` | `/api/rutinas/buscar` | Busca rutinas por nombre (parcial, no case-sensitive). | **JWT** |
| `POST` | `/api/rutinas` | Crea una nueva rutina. | **JWT** |
| `PUT` | `/api/rutinas/{id}` | Actualiza el nombre y descripción de una rutina. | **JWT** |
| `DELETE`| `/api/rutinas/{id}` | Elimina una rutina y sus ejercicios asociados (cascada). | **JWT** |
| `POST` | `/api/rutinas/{id}/ejercicio` | Agrega un ejercicio a una rutina. | **JWT** |
| `POST` | `/api/rutinas/{id}/ejercicios` | Agrega varios ejercicios a una rutina. | **JWT** |
| `POST` | `/api/rutinas/{id}/duplicar` | Crea una copia completa de la rutina y sus ejercicios. | **JWT** |
| `PUT` | `/api/ejercicios/{id}` | Modifica los detalles de un ejercicio específico. | **JWT** |
| `DELETE`| `/api/ejercicios/{id}` | Elimina un ejercicio específico. | **JWT** |

-----

## 📁 Estructura del Proyecto

El proyecto está organizado en las siguientes carpetas y módulos clave:

```
Backend/
  ├── .env                  # Variables de entorno
  ├── main.py               # Punto de entrada de la aplicación FastAPI y configuración de lifespan.
  ├── security.py           # Lógica de JWT, hashing de contraseñas y dependencia de autenticación.
  ├── database.py           # Configuración de la conexión SQLModel/PostgreSQL y obtención de sesiones.
  ├── models.py             # Definición de los modelos de base de datos (SQLModel) y esquemas Pydantic.
  ├── repository.py               # Capa de Repositorio con la lógica de acceso a datos.
  ├── requirementsForPy.txt       # Dependencias para que el proyecto funcione.
  └── routers/
      ├── ejercicios.py     # Endpoints para la gestión de Ejercicios.
      ├── rutinas.py        # Endpoints para la gestión de Rutinas.
      └── auth.py           # Endpoints para Registro y Login de Usuarios.
```