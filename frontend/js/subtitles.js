let subtitlesText = '';
let videoTitle = '';
let saveFormat = '';

function downloadSubtitles() {
    const url = document.getElementById('youtubeUrl').value.trim();

    if (!url) {
        showStatus('status1', 'Por favor ingresa una URL de YouTube', 'error');
        return;
    }

    showStatus('status1', 'Descargando subtítulos...');
    document.getElementById('downloadBtn').disabled = true;

    fetch('https://philipp-backend.onrender.com/api/subtitles/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url })
    })
    .then(function(response) {
        return response.json().then(function(data) {
            return {ok: response.ok, data: data};
        });
    })
    .then(function(result) {
        if (!result.ok) {
            throw new Error(result.data.message || result.data.error || 'Error desconocido');
        }

        subtitlesText = result.data.data.subtitles;
        videoTitle = result.data.data.title;

        document.getElementById('downloadReady').classList.remove('hidden');
        document.getElementById('previewContent').textContent = subtitlesText.substring(0, 300) + '...';
        document.getElementById('charCount').textContent = subtitlesText.length.toLocaleString();

        showStatus('status1', '✓ Subtítulos descargados correctamente', 'success');
        document.getElementById('downloadBtn').disabled = false;
    })
    .catch(function(error) {
        showStatus('status1', 'Error: ' + error.message, 'error');
        document.getElementById('downloadBtn').disabled = false;
    });
}

function promptSaveLocation(format) {
    if (!subtitlesText) {
        showStatus('status1', 'Descarga los subtítulos primero', 'error');
        return;
    }

    saveFormat = format;
    const defaultName = videoTitle.replace(/[^a-zA-Z0-9áéíóú\s]/g, '').substring(0, 50).trim();
    document.getElementById('fileName').value = defaultName;
    
    if (format === 'txt') {
        document.getElementById('modalTitle').textContent = '💾 Guardar como TXT';
    } else {
        document.getElementById('modalTitle').textContent = '🎯 Guardar como PDF';
    }
    
    document.getElementById('saveModal').classList.add('show');
}

function closeSaveModal() {
    document.getElementById('saveModal').classList.remove('show');
}

function saveFile() {
    let fileName = document.getElementById('fileName').value.trim();

    if (!fileName) {
        fileName = 'subtitulos';
    }

    if (saveFormat === 'txt') {
        saveAsTXT(fileName);
    } else if (saveFormat === 'pdf') {
        saveAsPDF(fileName);
    }
}

function saveAsTXT(fileName) {
    if (!fileName.endsWith('.txt')) {
        fileName += '.txt';
    }

    const blob = new Blob([subtitlesText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a'); 
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    closeSaveModal();
    showStatus('status1', '✓ Archivo guardado: ' + fileName, 'success');
}

function saveAsPDF(fileName) {
    if (!fileName.endsWith('.pdf')) {
        fileName += '.pdf';
    }

    showStatus('status1', 'Generando PDF...');

    fetch('https://philipp-backend.onrender.com/api/subtitles/generate-pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            subtitles: subtitlesText,
            title: videoTitle
        })
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Error generando PDF');
        }
        return response.blob();
    })
    .then(function(blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        closeSaveModal();
        showStatus('status1', '✓ Archivo guardado: ' + fileName, 'success');
    })
    .catch(function(error) {
        showStatus('status1', 'Error: ' + error.message, 'error');
    });
}

function showStatus(id, msg, type) {
    if (!type) type = 'loading';
    const el = document.getElementById(id);
    el.className = 'status show ' + type;
    if (type === 'loading') {
        el.innerHTML = '<span class="spinner"></span>' + msg;
    } else {
        el.textContent = msg;
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('saveModal');
    if (event.target === modal) {
        closeSaveModal();
    }
}
