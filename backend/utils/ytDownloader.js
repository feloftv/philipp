const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const PDFDocument = require('pdfkit');

async function downloadSubtitles(url) {
  const tempDir = path.join(os.tmpdir(), `felipe-${Date.now()}`);
  
  try {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('📁 Directorio temp:', tempDir);

    const videoInfo = await getVideoInfo(url);
    if (!videoInfo.success) {
      return { success: false, error: videoInfo.error };
    }

    const cmd = `cd "${tempDir}" && python3 -m yt_dlp --write-auto-subs --sub-langs es --skip-download "${url}" 2>&1`;
    console.log('📥 Ejecutando yt-dlp...');
    const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    console.log(output);

    const files = fs.readdirSync(tempDir);
    console.log('📂 Archivos en temp:', files);

    const subFile = files.find(f => f.endsWith('.vtt') || f.endsWith('.srt'));

    if (!subFile) {
      console.error('❌ No se encontró archivo de subtítulos');
      return { success: false, error: 'No se encontraron subtítulos en el video' };
    }

    const fullPath = path.join(tempDir, subFile);
    console.log('📄 Leyendo:', fullPath);
    const rawSubtitles = fs.readFileSync(fullPath, 'utf8');
    
    const cleanText = cleanWebVTT(rawSubtitles);
    const formattedText = formatWithTitle(videoInfo.title, cleanText);
    
    console.log(`✓ Subtítulos listos (${formattedText.length} caracteres)`);
    
    fs.rmSync(tempDir, { recursive: true, force: true });

    return {
      success: true,
      title: videoInfo.title,
      subtitles: formattedText,
      language: 'es'
    };

  } catch (error) {
    console.error('❌ Error:', error.message);
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
    return { success: false, error: error.message };
  }
}

function cleanWebVTT(webvttText) {
  let text = webvttText.replace(/^WEBVTT\n/i, '');
  text = text.replace(/^Kind:.*\n/i, '');
  text = text.replace(/^Language:.*\n/i, '');
  text = text.replace(/\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}[^\n]*\n/g, '');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/<\d{2}:\d{2}:\d{2}\.\d{3}>/g, '');
  text = text.replace(/\r/g, '');

  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const uniqueLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (i === 0 || lines[i] !== lines[i - 1]) {
      uniqueLines.push(lines[i]);
    }
  }

  let cleanText = uniqueLines.join(' ');

  return cleanText;
}

function formatWithTitle(title, text) {
  const divider = '-'.repeat(70);
  return `${title}\n${divider}\n\n${text}`;
}

async function generatePDF(subtitles, title) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4'
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      const lines = subtitles.split('\n');
      const titleLine = lines[0];
      const contentStart = 3;
      const content = lines.slice(contentStart).join(' ');

      doc.fontSize(16)
        .font('Helvetica-Bold')
        .text(titleLine, { align: 'center' });

      doc.moveDown(0.5);

      doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#999999')
        .text(''.padEnd(70, '-'), { align: 'center' });

      doc.moveDown(0.8);

      doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#000000')
        .text(content, {
          align: 'left',
          lineGap: 3
        });

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

async function getVideoInfo(url) {
  try {
    const output = execSync(`python3 -m yt_dlp -j "${url}"`, { encoding: 'utf8' });
    const info = JSON.parse(output);
    return {
      success: true,
      title: info.title || 'Video',
      id: info.id
    };
  } catch (error) {
    console.error('Error getVideoInfo:', error.message);
    return { success: false, error: 'Error obteniendo info del video' };
  }
}

module.exports = { downloadSubtitles, generatePDF };
