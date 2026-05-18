FROM python:3.11-slim

# Instalar ffmpeg y dependencias
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Instalar Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Descargar yt-dlp como binario ejecutable
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod +x /usr/local/bin/yt-dlp && \
    yt-dlp --version

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend .
COPY frontend ../frontend

EXPOSE 5000

CMD ["node", "server.js"]
