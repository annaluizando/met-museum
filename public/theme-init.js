(function() {
  function getTheme() {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return 'system';
  }
  
  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  const theme = getTheme();
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();
