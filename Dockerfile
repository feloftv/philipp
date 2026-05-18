FROM python:3.11-slim

# Instalar yt-dlp como script ejecutable
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    git \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Instalar yt-dlp y asegurar que está en /usr/local/bin
RUN python3 -m pip install --upgrade pip setuptools wheel && \
    python3 -m pip install yt-dlp && \
    ln -s /usr/local/bin/yt-dlp /usr/bin/yt-dlp || true

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend .
COPY frontend ../frontend

EXPOSE 5000

CMD ["node", "server.js"]
