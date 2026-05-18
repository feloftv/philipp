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

    console.log('=== PHILIPP DEBUG ===');
    console.log('URL:', url);
    console.log('Endpoint:', 'https://philipp-backend.onrender.com/api/subtitles/download');
    console.log('Timestamp:', new Date().toISOString());

    fetch('https://philipp-backend.onrender.com/api/subtitles/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url })
    })
    .then(function(response) {
        console.log('Response Status:', response.status);
        console.log('Response Headers:', {
            'content-type': response.headers.get('content-type'),
            'access-control-allow-origin': response.headers.get('access-control-allow-origin')
        });
        return response.json().then(function(data) {
            return {ok: response.ok, status: response.status, data: data};
        });
    })
    .then(function(result) {
        console.log('Response Data:', result.data);
        
        if (!result.ok) {
            const errorMsg = result.data.message || result.data.error || 'Error desconocido';
            const errorLog = `\n❌ ERROR 400\nURL: ${document.getElementById('youtubeUrl').value}\nMensaje: ${errorMsg}\nTiempo: ${new Date().toLocaleString()}\n\nCopiar esto para reportar:\n${JSON.stringify(result.data, null, 2)}`;
            
            console.error('=== ERROR DETAILS ===');
            console.error(errorLog);
            
            alert('❌ ERROR:\n\n' + errorMsg + '\n\nRevisa la consola (F12) para más detalles.');
            showStatus('status1', 'Error: ' + errorMsg, 'error');
            throw new Error(errorMsg);
        }

        subtitlesText = result.data.data.subtitles;
        videoTitle = result.data.data.title;

        console.log('✓ Success');
        console.log('Title:', videoTitle);
        console.log('Subtitles length:', subtitlesText.length);

        document.getElementById('downloadReady').classList.remove('hidden');
        document.getElementById('previewContent').textContent = subtitlesText.substring(0, 300) + '...';
        document.getElementById('charCount').textContent = subtitlesText.length.toLocaleString();

        const successLog = `\n✓ EXITO\nURL: ${document.getElementById('youtubeUrl').value}\nTítulo: ${videoTitle}\nCaracteres: ${subtitlesText.length}\nTiempo: ${new Date().toLocaleString()}`;
        console.log(successLog);
        alert('✓ Subtítulos descargados correctamente\n\nTítulo: ' + videoTitle + '\nCaracteres: ' + subtitlesText.length);
        
        showStatus('status1', '✓ Subtítulos descargados correctamente', 'success');
        document.getElementById('downloadBtn').disabled = false;
    })
    .catch(function(error) {
        console.error('=== CATCH ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        console.error('Timestamp:', new Date().toISOString());
        
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
    
    console.log('✓ TXT Guardado:', fileName);
    alert('✓ Archivo guardado:\n' + fileName);
    showStatus('status1', '✓ Archivo guardado: ' + fileName, 'success');
}

function saveAsPDF(fileName) {
    if (!fileName.endsWith('.pdf')) {
        fileName += '.pdf';
    }

    showStatus('status1', 'Generando PDF...');
    
    console.log('📄 Generando PDF:', fileName);

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
        console.log('PDF Response Status:', response.status);
        if (!response.ok) {
            throw new Error('Error generando PDF (Status: ' + response.status + ')');
        }
        return response.blob();
    })
    .then(function(blob) {
        console.log('PDF Blob Size:', blob.size, 'bytes');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        closeSaveModal();
        
        console.log('✓ PDF Guardado:', fileName);
        alert('✓ PDF guardado:\n' + fileName);
        showStatus('status1', '✓ Archivo guardado: ' + fileName, 'success');
    })
    .catch(function(error) {
        console.error('PDF Error:', error.message);
        alert('❌ Error generando PDF:\n\n' + error.message);
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
