FROM python:3.11-slim

# Instalar ffmpeg, curl y otras dependencias
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Instalar Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Instalar yt-dlp desde pip (en el environment global)
RUN pip install --no-cache-dir yt-dlp

# Verificar que yt-dlp está disponible
RUN which yt-dlp && yt-dlp --version

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend .
COPY frontend ../frontend

EXPOSE 5000

CMD ["node", "server.js"]
