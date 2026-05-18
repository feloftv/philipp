FROM python:3.11-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Instalar yt-dlp globalmente (como comando ejecutable)
RUN pip install --upgrade pip && \
    pip install yt-dlp && \
    which yt-dlp

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend ./
COPY frontend ../frontend

EXPOSE 5000

CMD ["npm", "start"]
