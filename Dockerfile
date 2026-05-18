FROM python:3.11-slim

# Instalar Node.js y dependencias
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    git \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

# Instalar yt-dlp directamente con pip en el PATH global
RUN python3 -m pip install --no-cache-dir yt-dlp

# Verificar que yt-dlp está instalado
RUN which yt-dlp || python3 -c "import yt_dlp; print('yt-dlp installed')"

WORKDIR /app

# Copiar y instalar backend
COPY backend/package*.json ./
RUN npm install

# Copiar código
COPY backend .
COPY frontend ../frontend

EXPOSE 5000

CMD ["node", "server.js"]
