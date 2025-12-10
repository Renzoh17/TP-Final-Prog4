# 🏋️ Gestor de Rutinas de Entrenamiento (Frontend)

## 📋 Descripción del Proyecto

Esta es la interfaz de usuario (Frontend) para la aplicación Gestor de Rutinas de Entrenamiento, construida con **React** y **Material UI (MUI)**.

La aplicación permite a los usuarios autenticarse, crear, visualizar, editar, copiar y eliminar planes de entrenamiento, y gestionar los ejercicios detallados (series, repeticiones, peso) asociados a cada día de la semana. Consume datos de una API construida con FastAPI (Backend).

---

## ⚙️ Requisitos Previos

Para ejecutar esta aplicación localmente, asegúrate de tener instalado el siguiente software:

* **Node.js:** Versión 18.x o superior.
* **Gestor de Paquetes:** `npm` (se utiliza en los comandos de este README) o `yarn`.
* **Backend:** La API de FastAPI debe estar corriendo y accesible.

---

## 🚀 Instalación y Configuración

### 1. Instalación

Para instalar todas las dependencias del proyecto, usa el siguiente comando en la terminal dentro de la carpeta raíz del *frontend*:

```bash
npm install
# Alternativamente, si usas Yarn: yarn install
```

### 2\. Configuración del Backend (API URL)

La aplicación necesita conocer la dirección donde se ejecuta la API de FastAPI. Esta URL se configura utilizando variables de entorno.

1.  Localiza un archivo llamado **`.env`** en la carpeta raíz del proyecto.
2.  Define la URL base del backend (incluyendo el puerto, si aplica, y el prefijo `/api`):

**.env**

```
# Ejemplo: Si el backend corre en http://localhost:8000
VITE_API_URL=http://localhost:8000/api
```

### 3\. Ejecución

#### Modo Desarrollo

Para iniciar la aplicación en modo desarrollo (con recarga en caliente):

```bash
npm run dev
```

  * **Puerto de Ejecución:** La aplicación generalmente corre en el puerto **`5173`** (o similar, definido por Vite).
  * **Acceso:** Abre tu navegador y navega a `http://localhost:5173`.

#### Compilación para Producción

Para crear una versión optimizada y estática lista para ser desplegada:

```bash
npm run build
```

El resultado de la compilación se encontrará en la carpeta **`dist`**.

-----

## 🛠️ Tecnologías Utilizadas

  * **Framework:** React (usando Vite).
  * **Librería de Componentes/UI:** Material UI (MUI).
  * **Enrutamiento:** React Router DOM.
  * **Peticiones HTTP:** Axios (Utilizado para peticiones a la API, incluyendo la inyección del token JWT).
  * **Gestión de Estado:** React Hooks (`useState`, `useEffect`, `useCallback`).

-----

## 🧱 Estructura del Proyecto

El código está organizado de manera modular para facilitar el mantenimiento y la escalabilidad:

```
Frontend/
    ├── .env                        # Almacena la URL base de la API.
    └── src/
        ├── api/                    # Contiene la logica para la comunicación con la API. 
        │   └── rutinas.js          # Archivo que hace el llamado a la api.
        ├── components/             
        │   ├── EjercicioItem.jsx   # Representa un ejercicio.
        │   └── SearchBar.jsx       # Barra de navegación.
        ├── pages/                  # Componentes que representan las vistas de la app.
        │   ├── RutinaList.jsx      # Lista de todas las Rutinas.
        │   ├── RutinaForm.jsx      # Crear/Editar Rutinas.
        │   ├── RutinaDetail.jsx    # Detalle de una Rutina.
        │   ├── LoginPage.jsx       # Página para logearse.
        │   └── RegisterPage.jsx    # Página para registrarse.
        └── App.jsx                 # Define las rutas principales y la estructura del *layout* incluyendo el `AuthWrapper`.
``` 

