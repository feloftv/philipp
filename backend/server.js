require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const packageJson = require('./package.json');
const subtitlesRouter = require('./routes/subtitles');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const VERSION = packageJson.version;
const BUILD_TIME = new Date().toISOString();

// Seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "http://localhost:*", "https://*.anthropic.com", "https://*.onrender.com", "https://*.netlify.app"],
    },
  },
}));

// CORS
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5000',
      'http://localhost:3000',
      'https://philipp-youtube.netlify.app',
      'https://philipp-backend.onrender.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    env: NODE_ENV, 
    version: VERSION,
    buildTime: BUILD_TIME
  });
});

// Version endpoint con más detalles
app.get('/api/version', (req, res) => {
  res.json({
    backend: VERSION,
    env: NODE_ENV,
    buildTime: BUILD_TIME,
    uptime: process.uptime()
  });
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Demasiadas solicitudes desde esta IP, intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/api/version'
});

app.use(limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas
app.use('/api/subtitles', subtitlesRouter);

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  const statusCode = err.statusCode || 500;
  const message = NODE_ENV === 'production' 
    ? 'Error interno del servidor' 
    : err.message;

  res.status(statusCode).json({ 
    error: 'Error',
    message: message
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'No encontrado' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n✅ Philipp Backend v${VERSION} ${NODE_ENV}`);
  console.log(`📡 API en http://localhost:${PORT}/api/subtitles`);
  console.log(`🏥 Health en http://localhost:${PORT}/health`);
  console.log(`🔖 Version en http://localhost:${PORT}/api/version\n`);
});

module.exports = app;
