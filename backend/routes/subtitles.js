const express = require('express');
const router = express.Router();
const { downloadSubtitles, generatePDF } = require('../utils/ytDownloader');

// Función para sanitizar nombres de archivo
function sanitizeFileName(fileName) {
  return fileName
    .replace(/[^a-zA-Z0-9áéíóúñ\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50)
    .trim();
}

router.post('/download', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'No se pudieron descargar los subtítulos',
        message: 'URL no proporcionada'
      });
    }

    const result = await downloadSubtitles(url);

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
        language: result.language
      }
    });

  } catch (error) {
    console.error('Error en /download:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

router.post('/generate-pdf', async (req, res) => {
  try {
    const { subtitles, title } = req.body;

    if (!subtitles || !title) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Se requieren subtítulos y título'
      });
    }

    const pdfBuffer = await generatePDF(subtitles, title);
    
    // Sanitizar el nombre del archivo
    const sanitizedTitle = sanitizeFileName(title);
    const fileName = `${sanitizedTitle}.pdf`;

    console.log('📄 Enviando PDF:', fileName);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error en /generate-pdf:', error);
    res.status(500).json({
      error: 'Error generando PDF',
      message: error.message
    });
  }
});

module.exports = router;
