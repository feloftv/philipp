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

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "http://localhost:*", "https://*.anthropic.com", "https://*.onrender.com", "https://*.netlify.app", "https://*.ngrok-free.dev"],
    },
  },
}));

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5000',
      'http://localhost:3000',
      'https://philipp-youtube.netlify.app',
      'https://jokester-sample-flavorful.ngrok-free.dev'
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

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    env: NODE_ENV, 
    version: VERSION,
    buildTime: BUILD_TIME
  });
});

app.get('/api/version', (req, res) => {
  res.json({
    version: VERSION,
    env: NODE_ENV,
    buildTime: BUILD_TIME,
    uptime: process.uptime()
  });
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Demasiadas solicitudes desde esta IP, intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/api/version'
});

app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/subtitles', subtitlesRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

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

app.use((req, res) => {
  res.status(404).json({ error: 'No encontrado' });
});

app.listen(PORT, () => {
  console.log(`\n✅ Philipp Backend v${VERSION} ${NODE_ENV}`);
  console.log(`📡 API en http://localhost:${PORT}/api/subtitles`);
  console.log(`🏥 Health en http://localhost:${PORT}/health`);
  console.log(`🔖 Version en http://localhost:${PORT}/api/version\n`);
});

module.exports = app;
