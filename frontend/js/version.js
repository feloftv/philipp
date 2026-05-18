function loadVersions() {
    fetch('https://jokester-sample-flavorful.ngrok-free.dev/api/version')
        .then(function(backendResponse) {
            return backendResponse.json();
        })
        .then(function(backendData) {
            return fetch('/version.json').then(function(frontendResponse) {
                return frontendResponse.json().then(function(frontendData) {
                    return {backend: backendData, frontend: frontendData};
                });
            });
        })
        .then(function(data) {
            var versionInfo = document.getElementById('versionInfo');
            if (versionInfo) {
                var backendTime = new Date(data.backend.buildTime).toLocaleString();
                versionInfo.innerHTML = '<div style="font-size: 0.7em; line-height: 1.4;">Frontend: v' + data.frontend.frontend + '<br>Backend: v' + data.backend.version + '<br>Modificado: ' + data.frontend.lastModified + '<br>Build: ' + backendTime + '</div>';
            }
        })
        .catch(function(error) {
            console.log('Version check failed');
            document.getElementById('versionInfo').textContent = 'v?.?.?';
        });
}
