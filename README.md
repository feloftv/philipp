cat > README.md << 'EOF'
# Philipp 📥

**Extrae Videos de Youtube en TXT y PDF**

Una herramienta simple y elegante para descargar subtítulos de YouTube y exportarlos en TXT o PDF.

## Características

✅ Descarga automática de subtítulos de YouTube
✅ Exporta a TXT o PDF
✅ Interfaz limpia y responsiva
✅ Tema claro/oscuro
✅ Sin publicidad ni rastreo
✅ Código abierto

## Requisitos

- Node.js v22+
- npm v10+
- yt-dlp (instalado vía pipx)

## Instalación Local

### 1. Clonar o descargar el proyecto

```bash
cd ~/Descargas/Automatizacion/
git clone <tu-repo> philippe-app
cd philippe-app
```

### 2. Instalar dependencias

```bash
cd backend
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus valores
```

### 4. Instalar yt-dlp

```bash
pip install yt-dlp --break-system-packages
```

### 5. Iniciar el servidor

```bash
npm start
```

El servidor estará disponible en `http://localhost:5000`

## Uso

1. Ingresa una URL de YouTube
2. Haz clic en "Descargar Subtítulos"
3. Elige exportar a TXT o PDF
4. ¡Listo! El archivo se descargará automáticamente

## Estructura del Proyecto

philipp-app/
├── backend/
│   ├── routes/          # Rutas API
│   ├── utils/           # Utilidades (yt-dlp, PDF)
│   ├── server.js        # Servidor Express
│   └── package.json
├── frontend/
│   └── index.html       # Interfaz web
└── README.md

## API

### POST /api/subtitles/download

Descarga subtítulos de un video de YouTube.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Título del video",
    "subtitles": "Contenido de subtítulos...",
    "language": "es"
  }
}
```

### POST /api/subtitles/generate-pdf

Genera un PDF con los subtítulos.

**Request:**
```json
{
  "subtitles": "Contenido...",
  "title": "Título"
}
```

**Response:** Archivo PDF

## Variables de Entorno

PORT=5000                              # Puerto del servidor
NODE_ENV=development                   # development o production
ALLOWED_ORIGINS=http://localhost:5000  # Orígenes CORS permitidos
ANTHROPIC_API_KEY=tu-api-key          # (Opcional) API key de Claude

## Seguridad

- Rate limiting: 10 requests por IP cada 15 minutos
- Validación de URLs
- Sanitización de inputs
- CORS configurado
- Helmet para headers seguros

## Desarrollo

### Stack Tecnológico

**Backend:**
- Node.js + Express
- yt-dlp (descarga de subtítulos)
- pdfkit (generación de PDFs)
- cors, helmet, express-rate-limit (seguridad)

**Frontend:**
- HTML5 + CSS3
- JavaScript vanilla
- Tema oscuro/claro
- Responsive design

## Deployment

### Railway / Render

1. Conecta tu repositorio
2. Define las variables de entorno
3. Deploy automático

### Vercel (Frontend)

1. Conecta tu repo a Vercel
2. Deploy automático del `/frontend`

## Troubleshooting

**Error: yt-dlp no encontrado**
```bash
pip install yt-dlp --break-system-packages
```

**Puerto 5000 en uso**
```bash
PORT=3001 npm start
```

**CORS error**
Verifica `ALLOWED_ORIGINS` en `.env`

## Licencia

MIT

## Autor

Desarrollado con ❤️ para extraer subtítulos de YouTube fácilmente.

---

**¿Preguntas?** Abre un issue en el repositorio.
EOF

echo "✓ README.md creado"