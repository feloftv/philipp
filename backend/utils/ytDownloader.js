const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const PDFDocument = require('pdfkit');

async function downloadSubtitles(url) {
  const tempDir = path.join(os.tmpdir(), `felipe-${Date.now()}`);
  
  try {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('📁 Temp dir:', tempDir);

    const videoInfo = await getVideoInfo(url);
    if (!videoInfo.success) {
      console.error('❌ getVideoInfo failed:', videoInfo.error);
      return { success: false, error: videoInfo.error };
    }

    console.log('✓ Video info:', videoInfo.title);

    // Descargar subtítulos en español, portugués e inglés
    const languages = 'es,pt,en';
    const cmd = `cd "${tempDir}" && yt-dlp --write-auto-subs --sub-langs ${languages} --skip-download "${url}" 2>&1`;
    console.log('📥 Ejecutando:', cmd);
    const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    console.log('Output:', output);

    const files = fs.readdirSync(tempDir);
    console.log('📂 Files:', files);

    // Buscar archivos de subtítulos
    const subFiles = files.filter(f => f.endsWith('.vtt') || f.endsWith('.srt'));

    if (subFiles.length === 0) {
      console.error('❌ No subtitle files found');
      return { success: false, error: 'No se encontraron subtítulos en el video' };
    }

    // Procesar todos los idiomas encontrados
    const subtitlesByLanguage = {};
    
    for (const subFile of subFiles) {
      const fullPath = path.join(tempDir, subFile);
      console.log('📄 Reading:', fullPath);
      
      const rawSubtitles = fs.readFileSync(fullPath, 'utf8');
      const cleanText = cleanWebVTT(rawSubtitles);
      const formattedText = formatWithTitle(videoInfo.title, cleanText);
      
      // Detectar idioma del archivo
      let language = 'es'; // default
      if (subFile.includes('.pt')) language = 'pt';
      if (subFile.includes('.en')) language = 'en';
      
      subtitlesByLanguage[language] = {
        text: formattedText,
        fileName: subFile
      };
      
      console.log(`✓ Subtitles ${language} ready:`, formattedText.length, 'chars');
    }
    
    fs.rmSync(tempDir, { recursive: true, force: true });

    return {
      success: true,
      title: videoInfo.title,
      subtitles: subtitlesByLanguage['es'] ? subtitlesByLanguage['es'].text : Object.values(subtitlesByLanguage)[0].text,
      allSubtitles: subtitlesByLanguage,
      language: 'es'
    };

  } catch (error) {
    console.error('❌ Download error:', error.message);
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
    console.log('🔍 Getting video info for:', url);
    
    const cmd = `yt-dlp -j "${url}"`;
    console.log('📌 Command:', cmd);
    
    const output = execSync(cmd, { encoding: 'utf8' });
    console.log('✓ yt-dlp output received:', output.substring(0, 100) + '...');
    
    const info = JSON.parse(output);
    console.log('✓ Video title:', info.title);
    
    return {
      success: true,
      title: info.title || 'Video',
      id: info.id
    };
  } catch (error) {
    console.error('❌ getVideoInfo error:', error.message);
    console.error('Command that failed: yt-dlp -j "' + url + '"');
    return { success: false, error: 'Error obteniendo info del video: ' + error.message };
  }
}

module.exports = { downloadSubtitles, generatePDF };
