const express = require('express');
const router = express.Router();
const { downloadSubtitles, generatePDF } = require('../utils/ytDownloader');

// Validar URL de YouTube
function isValidYoutubeUrl(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//;
  return youtubeRegex.test(url);
}

// Sanitizar entrada
function sanitizeInput(input) {
  return input.trim().slice(0, 500);
}

router.post('/download', async (req, res) => {
  try {
    const { url } = req.body;

    // Validación
    if (!url) {
      return res.status(400).json({ 
        error: 'URL requerida',
        message: 'Proporciona una URL válida de YouTube'
      });
    }

    const cleanUrl = sanitizeInput(url);

    if (!isValidYoutubeUrl(cleanUrl)) {
      return res.status(400).json({ 
        error: 'URL no válida',
        message: 'Debe ser una URL válida de YouTube'
      });
    }

    console.log(`📥 Descargando subtítulos de: ${cleanUrl}`);
    const result = await downloadSubtitles(cleanUrl);

    if (!result.success) {
      return res.status(400).json({ 
        error: 'No se pudieron descargar los subtítulos',
        message: result.error
      });
    }

    res.json({
      success: true,
      data: {
        title: result.title,
        subtitles: result.subtitles,
        language: 'es'
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      error: 'Error',
      message: 'Error interno del servidor'
    });
  }
});

router.post('/generate-pdf', async (req, res) => {
  try {
    const { subtitles, title } = req.body;

    // Validación
    if (!subtitles || typeof subtitles !== 'string') {
      return res.status(400).json({ 
        error: 'Subtítulos requeridos',
        message: 'Proporciona los subtítulos válidos'
      });
    }

    if (subtitles.length > 1000000) {
      return res.status(413).json({ 
        error: 'Archivo muy grande',
        message: 'Los subtítulos no pueden exceder 1MB'
      });
    }

    const cleanTitle = sanitizeInput(title || 'documento');

    console.log(`📄 Generando PDF de: ${cleanTitle}`);
    const pdfBuffer = await generatePDF(subtitles, cleanTitle);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanTitle}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      error: 'Error',
      message: 'Error generando PDF'
    });
  }
});

module.exports = router;
