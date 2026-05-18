FROM node:22

# Instalar Python y yt-dlp
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && pip3 install yt-dlp \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
