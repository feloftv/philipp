FROM python:3.11-slim

# Instalar Node.js
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

# Instalar yt-dlp
RUN pip install yt-dlp

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend ./
COPY frontend ../frontend

EXPOSE 5000

CMD ["npm", "start"]
