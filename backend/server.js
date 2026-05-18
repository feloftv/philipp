require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const subtitlesRouter = require('./routes/subtitles');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Seguridad - Headers con CSP permitiendo onclick
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "http://localhost:*", "https://*.anthropic.com"],
    },
  },
}));

// CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Demasiadas solicitudes desde esta IP, intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas
app.use('/api/subtitles', subtitlesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: NODE_ENV });
});

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
  console.log(`\n✅ Philipp Backend ${NODE_ENV} en http://localhost:${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api/subtitles`);
  console.log(`🏥 Health check en http://localhost:${PORT}/health\n`);
});

module.exports = app;
