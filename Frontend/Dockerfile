# --- STAGE 1: Build (Compilación) ---
# Usamos una imagen de Node para instalar dependencias y compilar
FROM node:22.21.0-alpine as builder

WORKDIR /app

# Copia package.json y package-lock.json e instala dependencias
COPY package*.json ./
RUN npm install

# Copia el código fuente e inicia la compilación
COPY . .

# Compila la aplicación React/Vite
# Se genera el output en la carpeta 'dist'
RUN npm run build

# --- STAGE 2: Serve (Servicio) ---
# Usamos una imagen ligera de Nginx para servir los archivos estáticos
FROM nginx:alpine

# Copia el output compilado (de la etapa 'builder') al directorio de servicio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia el archivo de configuración personalizado de Nginx (si lo tienes), si no, usa el default
# COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expón el puerto 80 (puerto HTTP estándar de Nginx)
EXPOSE 80

# El comando por defecto de Nginx inicia el servidor
CMD ["nginx", "-g", "daemon off;"]