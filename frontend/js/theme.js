function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        document.getElementById('themeIcon').textContent = '\u2600\ufe0f';
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('themeIcon');
    
    if (html.classList.contains('dark-mode')) {
        html.classList.remove('dark-mode');
        icon.textContent = '\ud83c\udf19';
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark-mode');
        icon.textContent = '\u2600\ufe0f';
        localStorage.setItem('theme', 'dark');
    }
}
