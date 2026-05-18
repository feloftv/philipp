FROM node:22

# Instalar Python3 y pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg

# Instalar yt-dlp globalmente
RUN pip3 install --break-system-packages yt-dlp

WORKDIR /app

# Copiar archivos
COPY backend/package*.json ./
RUN npm install

COPY backend ./
COPY frontend ../frontend

EXPOSE 5000

CMD ["npm", "start"]
